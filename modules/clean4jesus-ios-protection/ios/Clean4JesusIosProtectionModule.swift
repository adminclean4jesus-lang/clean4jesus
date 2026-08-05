import DeviceActivity
import ExpoModulesCore
import FamilyControls
import Foundation
import ManagedSettings
import SwiftUI
import UIKit

private enum RefugeStorage {
  static let appGroup = "group.com.clean4jesus.app"
  static let selectionKey = "clean4jesus.familyActivitySelection"
  static let shieldActiveKey = "clean4jesus.shieldActive"
  static let webFilterActiveKey = "clean4jesus.webFilterActive"
  static let usageLimitKey = "clean4jesus.usageLimitMinutes"
  static let monitoringActiveKey = "clean4jesus.monitoringActive"
  static let rescueRequestedKey = "clean4jesus.rescueRequested"
  static let languageKey = "clean4jesus.language"
  static let storeName = ManagedSettingsStore.Name("clean4jesus")
  static let activityName = DeviceActivityName("clean4jesus.dailyLimit")
  static let eventName = DeviceActivityEvent.Name("clean4jesus.dailyLimit.threshold")

  static var defaults: UserDefaults? {
    UserDefaults(suiteName: appGroup)
  }
}

private final class IosProtectionException: GenericException<String> {
  override var reason: String { param }
}

private struct SelectionSummary: Record {
  @Field var applications: Int = 0
  @Field var categories: Int = 0
  @Field var webDomains: Int = 0
}

private struct RefugeStatus: Record {
  @Field var shieldActive: Bool = false
  @Field var webFilterActive: Bool = false
  @Field var monitoringActive: Bool = false
  @Field var usageLimitMinutes: Int = 0
}

private struct FamilyPickerScreen: View {
  @Environment(\.dismiss) private var dismiss
  @State var selection: FamilyActivitySelection
  let onCancel: () -> Void
  let onSave: (FamilyActivitySelection) -> Void

  var body: some View {
    NavigationStack {
      FamilyActivityPicker(selection: $selection)
        .navigationTitle("Elegir protección")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
          ToolbarItem(placement: .cancellationAction) {
            Button("Cancelar") {
              onCancel()
              dismiss()
            }
          }
          ToolbarItem(placement: .confirmationAction) {
            Button("Guardar") {
              onSave(selection)
              dismiss()
            }
          }
        }
    }
  }
}

public final class Clean4JesusIosProtectionModule: Module {
  private let authorizationCenter = AuthorizationCenter.shared
  private let settingsStore = ManagedSettingsStore(named: RefugeStorage.storeName)
  private let activityCenter = DeviceActivityCenter()

  public func definition() -> ModuleDefinition {
    Name("Clean4JesusIosProtection")

    AsyncFunction("getAuthorizationStatus") { () -> String in
      self.authorizationStatus()
    }.runOnQueue(.main)

    AsyncFunction("requestAuthorization") { (promise: Promise) in
      Task { @MainActor in
        do {
          try await self.authorizationCenter.requestAuthorization(for: .individual)
          promise.resolve(self.authorizationStatus())
        } catch {
          promise.reject("ERR_FAMILY_CONTROLS_AUTHORIZATION", error.localizedDescription)
        }
      }
    }.runOnQueue(.main)

    AsyncFunction("getSelectionSummary") { () -> SelectionSummary in
      self.summary(for: self.loadSelection())
    }.runOnQueue(.main)

    AsyncFunction("getRefugeStatus") { () -> RefugeStatus in
      self.refugeStatus()
    }.runOnQueue(.main)

    AsyncFunction("getShieldStatus") { () -> Bool in
      guard self.authorizationCenter.authorizationStatus == .approved else { return false }
      return RefugeStorage.defaults?.bool(forKey: RefugeStorage.shieldActiveKey) ?? false
    }.runOnQueue(.main)

    AsyncFunction("setLanguage") { (language: String) throws -> Void in
      guard ["es", "en", "fr", "pt"].contains(language) else {
        throw IosProtectionException("Idioma de protección no compatible.")
      }
      try self.requireSharedDefaults().set(language, forKey: RefugeStorage.languageKey)
    }.runOnQueue(.main)

    AsyncFunction("consumeRescueRequest") { () -> Bool in
      guard let defaults = RefugeStorage.defaults else { return false }
      let requested = defaults.bool(forKey: RefugeStorage.rescueRequestedKey)
      if requested {
        defaults.set(false, forKey: RefugeStorage.rescueRequestedKey)
      }
      return requested
    }.runOnQueue(.main)

    AsyncFunction("presentFamilyActivityPicker") { (promise: Promise) in
      DispatchQueue.main.async {
        guard let viewController = self.appContext?.utilities?.currentViewController() else {
          promise.reject("ERR_NO_VIEW_CONTROLLER", "No fue posible abrir el selector de Apple.")
          return
        }

        let picker = FamilyPickerScreen(
          selection: self.loadSelection(),
          onCancel: {
            promise.reject("ERR_PICKER_CANCELLED", "Selección cancelada.")
          },
          onSave: { selection in
            do {
              try self.saveSelection(selection)
              promise.resolve(self.summary(for: selection))
            } catch {
              promise.reject("ERR_SELECTION_SAVE", error.localizedDescription)
            }
          }
        )

        viewController.present(UIHostingController(rootView: picker), animated: true)
      }
    }.runOnQueue(.main)

    AsyncFunction("activateRefuge") { (minutes: Int) throws -> RefugeStatus in
      try self.scheduleDailyLimit(minutes: minutes)
    }.runOnQueue(.main)

    AsyncFunction("clearRefuge") { () throws -> Void in
      let defaults = try self.requireSharedDefaults()
      activityCenter.stopMonitoring([RefugeStorage.activityName])
      settingsStore.clearAllSettings()
      defaults.set(false, forKey: RefugeStorage.shieldActiveKey)
      defaults.set(false, forKey: RefugeStorage.webFilterActiveKey)
      defaults.set(false, forKey: RefugeStorage.monitoringActiveKey)
      defaults.set(0, forKey: RefugeStorage.usageLimitKey)
    }.runOnQueue(.main)

    // Compatibility methods retained while the React Native layer migrates to Refugio v1.
    AsyncFunction("applyShield") { () throws -> SelectionSummary in
      try self.requireApprovedAuthorization()
      let selection = self.loadSelection()
      guard !selection.applicationTokens.isEmpty ||
              !selection.categoryTokens.isEmpty ||
              !selection.webDomainTokens.isEmpty else {
        throw IosProtectionException("Elige al menos una app, categoría o sitio.")
      }
      self.applyUsageShields(selection)
      try self.requireSharedDefaults().set(true, forKey: RefugeStorage.shieldActiveKey)
      return self.summary(for: selection)
    }.runOnQueue(.main)

    AsyncFunction("clearShield") { () throws -> Void in
      try self.clearUsageShields()
    }.runOnQueue(.main)

    AsyncFunction("scheduleUsageLimit") { (minutes: Int) throws -> Void in
      _ = try self.scheduleDailyLimit(minutes: minutes)
    }.runOnQueue(.main)
  }

  private func authorizationStatus() -> String {
    switch authorizationCenter.authorizationStatus {
    case .notDetermined: return "not-determined"
    case .denied: return "denied"
    case .approved: return "approved"
    @unknown default: return "not-determined"
    }
  }

  private func requireApprovedAuthorization() throws {
    guard authorizationCenter.authorizationStatus == .approved else {
      throw IosProtectionException("Autoriza Tiempo en Pantalla antes de activar el Refugio.")
    }
  }

  private func requireSharedDefaults() throws -> UserDefaults {
    guard let defaults = RefugeStorage.defaults else {
      throw IosProtectionException("El App Group de Clean4Jesus no está disponible en este build.")
    }
    return defaults
  }

  private func validate(minutes: Int) throws {
    guard minutes >= 1 && minutes <= 1_440 else {
      throw IosProtectionException("El límite diario debe estar entre 1 y 1440 minutos.")
    }
  }

  private func scheduleDailyLimit(minutes: Int) throws -> RefugeStatus {
    try requireApprovedAuthorization()
    try validate(minutes: minutes)

    let selection = loadSelection()
    guard !selection.applicationTokens.isEmpty ||
            !selection.categoryTokens.isEmpty ||
            !selection.webDomainTokens.isEmpty else {
      throw IosProtectionException("Elige al menos una app, categoría o sitio.")
    }

    let defaults = try requireSharedDefaults()
    let schedule = DeviceActivitySchedule(
      intervalStart: DateComponents(hour: 0, minute: 0, second: 0),
      intervalEnd: DateComponents(hour: 23, minute: 59, second: 59),
      repeats: true
    )
    let event = DeviceActivityEvent(
      applications: selection.applicationTokens,
      categories: selection.categoryTokens,
      webDomains: selection.webDomainTokens,
      threshold: DateComponents(minute: minutes)
    )

    activityCenter.stopMonitoring([RefugeStorage.activityName])
    try activityCenter.startMonitoring(
      RefugeStorage.activityName,
      during: schedule,
      events: [RefugeStorage.eventName: event]
    )

    settingsStore.webContent.blockedByFilter = .auto()
    defaults.set(true, forKey: RefugeStorage.webFilterActiveKey)
    defaults.set(true, forKey: RefugeStorage.monitoringActiveKey)
    defaults.set(minutes, forKey: RefugeStorage.usageLimitKey)
    return refugeStatus()
  }

  private func loadSelection() -> FamilyActivitySelection {
    guard let data = RefugeStorage.defaults?.data(forKey: RefugeStorage.selectionKey),
          let selection = try? PropertyListDecoder().decode(FamilyActivitySelection.self, from: data) else {
      return FamilyActivitySelection()
    }
    return selection
  }

  private func saveSelection(_ selection: FamilyActivitySelection) throws {
    let data = try PropertyListEncoder().encode(selection)
    try requireSharedDefaults().set(data, forKey: RefugeStorage.selectionKey)
  }

  private func applyUsageShields(_ selection: FamilyActivitySelection) {
    settingsStore.shield.applications = selection.applicationTokens.isEmpty ? nil : selection.applicationTokens
    settingsStore.shield.applicationCategories = selection.categoryTokens.isEmpty
      ? nil
      : .specific(selection.categoryTokens)
    settingsStore.shield.webDomains = selection.webDomainTokens.isEmpty ? nil : selection.webDomainTokens
  }

  private func clearUsageShields() throws {
    settingsStore.shield.applications = nil
    settingsStore.shield.applicationCategories = nil
    settingsStore.shield.webDomains = nil
    try requireSharedDefaults().set(false, forKey: RefugeStorage.shieldActiveKey)
  }

  private func refugeStatus() -> RefugeStatus {
    let defaults = RefugeStorage.defaults
    var result = RefugeStatus()
    guard authorizationCenter.authorizationStatus == .approved else {
      result.usageLimitMinutes = defaults?.integer(forKey: RefugeStorage.usageLimitKey) ?? 0
      return result
    }
    result.shieldActive = defaults?.bool(forKey: RefugeStorage.shieldActiveKey) ?? false
    result.webFilterActive = defaults?.bool(forKey: RefugeStorage.webFilterActiveKey) ?? false
    result.monitoringActive = defaults?.bool(forKey: RefugeStorage.monitoringActiveKey) ?? false
    result.usageLimitMinutes = defaults?.integer(forKey: RefugeStorage.usageLimitKey) ?? 0
    return result
  }

  private func summary(for selection: FamilyActivitySelection) -> SelectionSummary {
    var result = SelectionSummary()
    result.applications = selection.applicationTokens.count
    result.categories = selection.categoryTokens.count
    result.webDomains = selection.webDomainTokens.count
    return result
  }
}
