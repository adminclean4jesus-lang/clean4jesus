import ExpoModulesCore
import FamilyControls
import ManagedSettings
import DeviceActivity
import Foundation
import SwiftUI
import UIKit

@available(iOS 16.0, *)
private struct FamilyPickerScreen: View {
  @Environment(\.dismiss) private var dismiss
  @State var selection: FamilyActivitySelection
  let onCancel: () -> Void
  let onSave: (FamilyActivitySelection) -> Void

  var body: some View {
    NavigationStack {
      FamilyActivityPicker(selection: $selection)
        .navigationTitle("Elegir proteccion")
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

public class Clean4JesusIosProtectionModule: Module {
  private let appGroupID = "group.com.clean4jesus.app"
  private let selectionKey = "clean4jesus.familyActivitySelection"
  private let settingsStore = ManagedSettingsStore(named: .init("clean4jesus"))
  private let activityCenter = DeviceActivityCenter()
  
  private var userDefaults: UserDefaults? {
    return UserDefaults(suiteName: appGroupID)
  }

  public func definition() -> ModuleDefinition {
    Name("Clean4JesusIosProtectionModule")

    AsyncFunction("getCapabilities") { () -> [String: Any] in
      if #available(iOS 16.0, *) {
        let isAppGroupAvailable = self.userDefaults != nil
        return [
          "supportsFamilyControls": true,
          "supportsManagedSettings": true,
          "supportsDeviceActivity": true,
          "supportsShieldConfiguration": true,
          "appGroupConfigured": isAppGroupAvailable,
          "systemVersion": UIDevice.current.systemVersion
        ]
      } else {
        return [
          "supportsFamilyControls": false,
          "supportsManagedSettings": false,
          "supportsDeviceActivity": false,
          "supportsShieldConfiguration": false,
          "appGroupConfigured": false,
          "systemVersion": UIDevice.current.systemVersion
        ]
      }
    }.runOnQueue(.main)

    AsyncFunction("requestAuthorization") { (promise: Promise) in
      if #available(iOS 16.0, *) {
        Task {
          do {
            try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
            promise.resolve(true)
          } catch {
            let nsError = error as NSError
            promise.reject(
              "ERR_FAMILY_CONTROLS_AUTHORIZATION",
              "\(nsError.domain) (\(nsError.code)): \(nsError.localizedDescription)",
              nsError
            )
          }
        }
      } else {
        promise.reject(
          "ERR_IOS_VERSION",
          "Family Controls requiere iOS 16 o posterior.",
          NSError(domain: "Clean4Jesus", code: 1)
        )
      }
    }.runOnQueue(.main)

    AsyncFunction("getStatus") { () -> [String: Any] in
      let defaults = self.userDefaults
      let isEnabled = defaults?.bool(forKey: "shieldEnabled") ?? false
      let rescueActive = defaults?.bool(forKey: "rescueActive") ?? false
      let rescueTimestamp = defaults?.double(forKey: "rescueActiveTimestamp") ?? 0.0
      
      var statusString = "not_configured"
      if #available(iOS 16.0, *) {
        let authStatus = AuthorizationCenter.shared.authorizationStatus
        if authStatus == .approved {
          statusString = isEnabled ? "protection_active" : "permission_granted"
        } else if authStatus == .denied {
          statusString = "permission_denied"
        }
      }

      var timeRemaining = 0
      if rescueActive {
        let elapsed = Date().timeIntervalSince1970 - rescueTimestamp
        if elapsed < 60 {
          timeRemaining = Int(60 - elapsed)
        } else {
          defaults?.set(false, forKey: "rescueActive")
        }
      }

      return [
        "status": statusString,
        "isEnabled": isEnabled,
        "isAuthorized": statusString == "protection_active" || statusString == "permission_granted",
        "appGroupSynced": defaults != nil,
        "rescueActive": timeRemaining > 0,
        "rescueTimeRemainingSeconds": timeRemaining,
        "lastSyncTimestamp": Date().timeIntervalSince1970
      ]
    }.runOnQueue(.main)

    AsyncFunction("getSelectionSummary") { () -> [String: Int] in
      let selection = self.loadSelection()
      return self.selectionSummary(selection)
    }.runOnQueue(.main)

    AsyncFunction("presentFamilyActivityPicker") { (promise: Promise) in
      DispatchQueue.main.async {
        guard #available(iOS 16.0, *) else {
          promise.reject("ERR_IOS_VERSION", "Family Controls requiere iOS 16 o posterior.")
          return
        }
        guard self.authorizationCenter.authorizationStatus == .approved else {
          promise.reject("ERR_FAMILY_CONTROLS_AUTHORIZATION", "Autoriza Family Controls antes de elegir apps.")
          return
        }
        guard let viewController = self.appContext?.utilities?.currentViewController() else {
          promise.reject("ERR_NO_VIEW_CONTROLLER", "No fue posible abrir el selector de Apple.")
          return
        }

        let picker = FamilyPickerScreen(
          selection: self.loadSelection(),
          onCancel: { promise.reject("ERR_PICKER_CANCELLED", "Selección cancelada.") },
          onSave: { selection in
            do {
              try self.saveSelection(selection)
              promise.resolve(self.selectionSummary(selection))
            } catch {
              promise.reject("ERR_SELECTION_SAVE", error.localizedDescription)
            }
          }
        )
        viewController.present(UIHostingController(rootView: picker), animated: true)
      }
    }.runOnQueue(.main)

    AsyncFunction("configureProtection") { (config: [String: Any]) -> Bool in
      guard #available(iOS 16.0, *) else { return false }
      guard self.authorizationCenter.authorizationStatus == .approved,
            let defaults = self.userDefaults else { return false }
      let selection = self.loadSelection()
      guard !selection.applicationTokens.isEmpty ||
              !selection.categoryTokens.isEmpty ||
              !selection.webDomainTokens.isEmpty else { return false }

      self.settingsStore.shield.applications = selection.applicationTokens.isEmpty ? nil : selection.applicationTokens
      self.settingsStore.shield.applicationCategories = selection.categoryTokens.isEmpty ? nil : .specific(selection.categoryTokens)
      self.settingsStore.shield.webDomains = selection.webDomainTokens.isEmpty ? nil : selection.webDomainTokens
      self.settingsStore.webContent.blockedByFilter = .auto()
      // DeviceActivity limits are started by the monitor extension: activityCenter.startMonitoring
      defaults.set(true, forKey: "shieldEnabled")
      defaults.set(Date().timeIntervalSince1970, forKey: "lastConfigTimestamp")
      return true
    }.runOnQueue(.main)

    AsyncFunction("syncPinHash") { (pinHash: String) -> Bool in
      guard !pinHash.isEmpty, let defaults = self.userDefaults else { return false }
      defaults.set(pinHash, forKey: "pinHash")
      return true
    }.runOnQueue(.main)

    AsyncFunction("pauseProtection") { (pinHash: String) -> Bool in
      guard !pinHash.isEmpty, let defaults = self.userDefaults else { return false }
      guard let storedHash = defaults.string(forKey: "pinHash"), storedHash == pinHash else { return false }
      defaults.set(false, forKey: "shieldEnabled")
      self.settingsStore.clearAllSettings()
      defaults.set(Date().timeIntervalSince1970, forKey: "pausedTimestamp")
      return true
    }.runOnQueue(.main)

    AsyncFunction("resumeProtection") { () -> Bool in
      guard #available(iOS 16.0, *),
            self.authorizationCenter.authorizationStatus == .approved,
            let defaults = self.userDefaults else { return false }
      let selection = self.loadSelection()
      guard !selection.applicationTokens.isEmpty ||
              !selection.categoryTokens.isEmpty ||
              !selection.webDomainTokens.isEmpty else { return false }
      self.settingsStore.shield.applications = selection.applicationTokens.isEmpty ? nil : selection.applicationTokens
      self.settingsStore.shield.applicationCategories = selection.categoryTokens.isEmpty ? nil : .specific(selection.categoryTokens)
      self.settingsStore.shield.webDomains = selection.webDomainTokens.isEmpty ? nil : selection.webDomainTokens
      self.settingsStore.webContent.blockedByFilter = .auto()
      defaults.set(true, forKey: "shieldEnabled")
      return true
    }.runOnQueue(.main)

    AsyncFunction("startRescue") { () -> Bool in
      guard let defaults = self.userDefaults else { return false }
      defaults.set(true, forKey: "rescueActive")
      defaults.set(Date().timeIntervalSince1970, forKey: "rescueActiveTimestamp")
      return true
    }.runOnQueue(.main)

    AsyncFunction("getRescueState") { () -> [String: Any] in
      let defaults = self.userDefaults
      let active = defaults?.bool(forKey: "rescueActive") ?? false
      let timestamp = defaults?.double(forKey: "rescueActiveTimestamp") ?? 0.0
      
      var timeRemaining = 0
      if active {
        let elapsed = Date().timeIntervalSince1970 - timestamp
        if elapsed < 60 {
          timeRemaining = Int(60 - elapsed)
        }
      }

      return [
        "rescueActive": timeRemaining > 0,
        "timeRemaining": timeRemaining
      ]
    }.runOnQueue(.main)
  }

  private var authorizationCenter: AuthorizationCenter { AuthorizationCenter.shared }

  private func loadSelection() -> FamilyActivitySelection {
    guard let data = userDefaults?.data(forKey: selectionKey),
          let selection = try? PropertyListDecoder().decode(FamilyActivitySelection.self, from: data) else {
      return FamilyActivitySelection()
    }
    return selection
  }

  private func saveSelection(_ selection: FamilyActivitySelection) throws {
    guard let defaults = userDefaults else {
      throw NSError(domain: "Clean4Jesus", code: 1, userInfo: [NSLocalizedDescriptionKey: "El App Group no está disponible."])
    }
    defaults.set(try PropertyListEncoder().encode(selection), forKey: selectionKey)
  }

  private func selectionSummary(_ selection: FamilyActivitySelection) -> [String: Int] {
    [
      "applications": selection.applicationTokens.count,
      "categories": selection.categoryTokens.count,
      "webDomains": selection.webDomainTokens.count,
    ]
  }
}
