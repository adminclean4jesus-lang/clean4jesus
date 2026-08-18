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
  let language: String
  let onCancel: () -> Void
  let onSave: (FamilyActivitySelection) -> Void

  private func localized(es: String, en: String, fr: String, pt: String) -> String {
    switch language {
    case "en": return en
    case "fr": return fr
    case "pt": return pt
    default: return es
    }
  }

  var body: some View {
    NavigationStack {
      FamilyActivityPicker(selection: $selection)
        .navigationTitle(localized(es: "Elegir protección", en: "Choose protection", fr: "Choisir la protection", pt: "Escolher proteção"))
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
          ToolbarItem(placement: .cancellationAction) {
            Button(localized(es: "Cancelar", en: "Cancel", fr: "Annuler", pt: "Cancelar")) {
              onCancel()
              dismiss()
            }
          }
          ToolbarItem(placement: .confirmationAction) {
            Button(localized(es: "Guardar", en: "Save", fr: "Enregistrer", pt: "Salvar")) {
              onSave(selection)
              dismiss()
            }
          }
        }
    }
  }
}

@available(iOS 16.0, *)
private struct StoredApplicationLimit: Codable, Identifiable {
  let id: UUID
  let token: ApplicationToken
  var minutes: Int
  var enabled: Bool
}

@available(iOS 16.0, *)
private struct PerAppEditorCopy {
  let title: String
  let help: String
  let apps: String
  let dailyTime: String
  let categories: String
  let categoriesHelp: String
  let privacy: String
  let cancel: String
  let save: String

  static func forLanguage(_ requestedLanguage: String) -> PerAppEditorCopy {
    let language = requestedLanguage.isEmpty
      ? (Locale.preferredLanguages.first?.split(separator: "-").first.map(String.init) ?? "es")
      : requestedLanguage
    switch language {
    case "en": return .init(title: "Limits per app", help: "Choose a different time for each app. Usage resets every day.", apps: "Selected apps", dailyTime: "Daily time", categories: "Categories and sites", categoriesHelp: "For different times, choose apps one by one. Categories and sites do not receive an individual limit.", privacy: "Apple keeps your selections private. Clean4Jesus does not send this information.", cancel: "Cancel", save: "Save")
    case "fr": return .init(title: "Limites par app", help: "Choisissez un temps différent pour chaque app. L’usage est réinitialisé chaque jour.", apps: "Apps choisies", dailyTime: "Temps quotidien", categories: "Catégories et sites", categoriesHelp: "Pour des temps différents, choisissez les apps une par une. Les catégories et sites n’ont pas de limite individuelle.", privacy: "Apple garde vos sélections privées. Clean4Jesus n’envoie pas ces informations.", cancel: "Annuler", save: "Enregistrer")
    case "pt": return .init(title: "Limites por app", help: "Escolha um tempo diferente para cada app. O uso reinicia todos os dias.", apps: "Apps escolhidos", dailyTime: "Tempo diário", categories: "Categorias e sites", categoriesHelp: "Para tempos diferentes, escolha os apps um a um. Categorias e sites não recebem limite individual.", privacy: "A Apple mantém suas seleções privadas. O Clean4Jesus não envia essas informações.", cancel: "Cancelar", save: "Salvar")
    default: return .init(title: "Límites por aplicación", help: "Elige un tiempo distinto para cada app. El uso se reinicia cada día.", apps: "Apps elegidas", dailyTime: "Tiempo diario", categories: "Categorías y sitios", categoriesHelp: "Para usar tiempos distintos, elige las apps una por una. Las categorías y sitios no reciben un límite individual.", privacy: "Apple mantiene privadas tus selecciones. Clean4Jesus no envía esta información.", cancel: "Cancelar", save: "Guardar")
    }
  }
}

@available(iOS 16.0, *)
private struct PerAppLimitEditorScreen: View {
  @Environment(\.dismiss) private var dismiss
  @State var rules: [StoredApplicationLimit]
  let language: String
  let categoryCount: Int
  let webDomainCount: Int
  let onCancel: () -> Void
  let onSave: ([StoredApplicationLimit]) -> Void
  private let options = [15, 30, 60, 120]
  private var copy: PerAppEditorCopy { .forLanguage(language) }

  var body: some View {
    NavigationStack {
      List {
        Section {
          Text(copy.help)
            .font(.subheadline)
            .foregroundStyle(.secondary)
        }

        Section(copy.apps) {
          ForEach($rules) { $rule in
            VStack(alignment: .leading, spacing: 12) {
              Label(rule.token)
                .font(.headline)
              Picker(copy.dailyTime, selection: $rule.minutes) {
                ForEach(options, id: \.self) { minutes in
                  Text("\(minutes) min").tag(minutes)
                }
              }
              .pickerStyle(.segmented)
            }
            .padding(.vertical, 8)
          }
        }

        if categoryCount > 0 || webDomainCount > 0 {
          Section(copy.categories) {
            Text(copy.categoriesHelp)
              .font(.footnote)
              .foregroundStyle(.secondary)
          }
        }

        Section {
          Text(copy.privacy)
            .font(.footnote)
            .foregroundStyle(.secondary)
        }
      }
      .navigationTitle(copy.title)
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .cancellationAction) {
          Button(copy.cancel) {
            onCancel()
            dismiss()
          }
        }
        ToolbarItem(placement: .confirmationAction) {
          Button(copy.save) {
            onSave(rules)
            dismiss()
          }
          .disabled(rules.isEmpty)
        }
      }
    }
  }
}

@available(iOS 16.0, *)
private struct DailyUsageReportScreen: View {
  @Environment(\.dismiss) private var dismiss
  let selection: FamilyActivitySelection
  let language: String
  @State private var reportRefreshID = UUID()

  private var copy: (title: String, close: String) {
    switch language {
    case "en": return ("Today’s usage", "Close")
    case "fr": return ("Utilisation du jour", "Fermer")
    case "pt": return ("Uso de hoje", "Fechar")
    default: return ("Uso de hoy", "Cerrar")
    }
  }

  var body: some View {
    NavigationStack {
      ZStack {
        Color(uiColor: .systemBackground).ignoresSafeArea()
        DeviceActivityReport(
          DeviceActivityReport.Context(rawValue: "clean4jesus.daily-usage"),
          filter: DeviceActivityFilter(
            segment: .daily(during: Calendar.current.dateInterval(of: .day, for: .now) ?? DateInterval(start: .now, duration: 86400)),
            applications: selection.applicationTokens,
            categories: selection.categoryTokens,
            webDomains: selection.webDomainTokens
          )
        )
        .id(reportRefreshID)
      }
      .navigationTitle(copy.title)
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .cancellationAction) {
          Button(copy.close) { dismiss() }
        }
        ToolbarItem(placement: .topBarTrailing) {
          Button {
            reportRefreshID = UUID()
          } label: {
            Image(systemName: "arrow.clockwise")
          }
          .accessibilityLabel(language == "en" ? "Refresh usage" : "Actualizar uso")
        }
      }
    }
  }
}

public class Clean4JesusIosProtectionModule: Module {
  private let appGroupID = "group.com.clean4jesus.app"
  private let selectionKey = "clean4jesus.familyActivitySelection"
  private let perAppLimitsKey = "clean4jesus.perAppLimits.v2"
  private let perAppLimitsConfiguredKey = "clean4jesus.perAppLimits.userConfigured"
  private let dailyActivityName = DeviceActivityName("clean4jesus.daily-limit")
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
            guard AuthorizationCenter.shared.authorizationStatus == .approved else {
              let status = String(describing: AuthorizationCenter.shared.authorizationStatus)
              promise.reject(
                "ERR_FAMILY_CONTROLS_AUTHORIZATION",
                "Apple finalizó la solicitud con estado \(status), pero no concedió Family Controls."
              )
              return
            }
            promise.resolve(true)
          } catch {
            let nsError = error as NSError
            promise.reject(
              "ERR_FAMILY_CONTROLS_AUTHORIZATION",
              "\(nsError.domain) (\(nsError.code)): \(nsError.localizedDescription)"
            )
          }
        }
      } else {
        promise.reject(
          "ERR_IOS_VERSION",
          "Family Controls requiere iOS 16 o posterior."
        )
      }
    }.runOnQueue(.main)

    AsyncFunction("getStatus") { () -> [String: Any] in
      let defaults = self.userDefaults
      let isEnabled = defaults?.bool(forKey: "shieldEnabled") ?? false
      
      var statusString = "not_configured"
      if #available(iOS 16.0, *) {
        let authStatus = AuthorizationCenter.shared.authorizationStatus
        if authStatus == .approved {
          statusString = isEnabled ? "protection_active" : "permission_granted"
        } else if authStatus == .denied {
          statusString = "permission_denied"
        }
      }

      return [
        "status": statusString,
        "isEnabled": isEnabled,
        "isAuthorized": statusString == "protection_active" || statusString == "permission_granted",
        "appGroupSynced": defaults != nil,
        "dailyLimitMinutes": defaults?.integer(forKey: "dailyLimitMinutes") ?? 0,
        "lastSyncTimestamp": Date().timeIntervalSince1970
      ]
    }.runOnQueue(.main)

    AsyncFunction("getSelectionSummary") { () -> [String: Int] in
      let selection = self.loadSelection()
      return self.selectionSummary(selection)
    }.runOnQueue(.main)

    AsyncFunction("getPerAppLimitSummary") { () -> [String: Any] in
      let selection = self.loadSelection()
      let rules = self.loadPerAppLimits().filter { selection.applicationTokens.contains($0.token) }
      return [
        "applications": selection.applicationTokens.count,
        "configuredApplications": rules.filter { $0.enabled }.count,
        "hasUserConfiguredLimits": self.hasUserConfiguredPerAppLimits()
      ]
    }.runOnQueue(.main)

    AsyncFunction("presentPerAppLimitEditor") { (language: String, promise: Promise) in
      DispatchQueue.main.async {
        guard #available(iOS 16.0, *) else {
          promise.reject("ERR_IOS_VERSION", "Los límites por aplicación requieren iOS 16 o posterior.")
          return
        }
        guard self.authorizationCenter.authorizationStatus == .approved else {
          promise.reject("ERR_FAMILY_CONTROLS_AUTHORIZATION", "Autoriza Family Controls antes de configurar límites.")
          return
        }
        let selection = self.loadSelection()
        guard !selection.applicationTokens.isEmpty else {
          promise.reject("ERR_EMPTY_APP_SELECTION", "Elige al menos una app para asignarle un límite.")
          return
        }
        guard let viewController = self.appContext?.utilities?.currentViewController() else {
          promise.reject("ERR_NO_VIEW_CONTROLLER", "No fue posible abrir los límites por aplicación.")
          return
        }

        let editor = PerAppLimitEditorScreen(
          rules: self.synchronizedPerAppLimits(for: selection),
          language: language,
          categoryCount: selection.categoryTokens.count,
          webDomainCount: selection.webDomainTokens.count,
          onCancel: { promise.reject("ERR_LIMIT_EDITOR_CANCELLED", "Configuración cancelada.") },
          onSave: { rules in
            do {
              try self.savePerAppLimits(rules)
              self.userDefaults?.set(true, forKey: self.perAppLimitsConfiguredKey)
              if self.userDefaults?.bool(forKey: "shieldEnabled") == true {
                try self.startPerAppLimitMonitoring(rules: rules)
                self.settingsStore.shield.applications = nil
              }
              promise.resolve([
                "applications": selection.applicationTokens.count,
                "configuredApplications": rules.filter { $0.enabled }.count,
                "hasUserConfiguredLimits": true
              ])
            } catch {
              promise.reject("ERR_LIMIT_SAVE", error.localizedDescription)
            }
          }
        )
        viewController.present(UIHostingController(rootView: editor), animated: true)
      }
    }.runOnQueue(.main)

    AsyncFunction("presentDailyUsageReport") { (language: String, promise: Promise) in
      DispatchQueue.main.async {
        guard #available(iOS 16.0, *) else {
          promise.reject("ERR_IOS_VERSION", "El reporte de uso requiere iOS 16 o posterior.")
          return
        }
        guard self.authorizationCenter.authorizationStatus == .approved else {
          promise.reject("ERR_FAMILY_CONTROLS_AUTHORIZATION", "Autoriza Family Controls antes de consultar el uso.")
          return
        }
        guard !self.loadSelection().applicationTokens.isEmpty else {
          promise.reject("ERR_EMPTY_APP_SELECTION", "Elige al menos una app antes de consultar el uso.")
          return
        }
        guard let viewController = self.appContext?.utilities?.currentViewController() else {
          promise.reject("ERR_NO_VIEW_CONTROLLER", "No fue posible abrir el reporte de uso.")
          return
        }
        let report = DailyUsageReportScreen(selection: self.loadSelection(), language: language)
        viewController.present(UIHostingController(rootView: report), animated: true) {
          promise.resolve(true)
        }
      }
    }.runOnQueue(.main)

    AsyncFunction("presentFamilyActivityPicker") { (language: String, promise: Promise) in
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
          language: language,
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

      defaults.set(config["customShieldTitle"] as? String, forKey: "customShieldTitle")
      defaults.set(config["customShieldMessage"] as? String, forKey: "customShieldMessage")
      defaults.set(config["customShieldPrimaryLabel"] as? String, forKey: "customShieldPrimaryLabel")
      defaults.set(config["customShieldSecondaryLabel"] as? String, forKey: "customShieldSecondaryLabel")
      do {
        let rules = self.synchronizedPerAppLimits(for: selection)
        try self.savePerAppLimits(rules)
        try self.startPerAppLimitMonitoring(rules: rules)
        self.settingsStore.clearAllSettings()
        self.applyNonApplicationShield(selection)
      } catch {
        return false
      }
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
      self.activityCenter.stopMonitoring([self.dailyActivityName])
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
      do {
        let rules = self.synchronizedPerAppLimits(for: selection)
        try self.savePerAppLimits(rules)
        try self.startPerAppLimitMonitoring(rules: rules)
        self.settingsStore.clearAllSettings()
        self.applyNonApplicationShield(selection)
      } catch {
        return false
      }
      defaults.set(true, forKey: "shieldEnabled")
      return true
    }.runOnQueue(.main)

    AsyncFunction("clearProtection") { (pinHash: String) -> Bool in
      guard let defaults = self.userDefaults else { return false }
      if let storedHash = defaults.string(forKey: "pinHash"), !pinHash.isEmpty, storedHash != pinHash {
        return false
      }
      self.activityCenter.stopMonitoring([self.dailyActivityName])
      self.settingsStore.clearAllSettings()
      defaults.set(false, forKey: "shieldEnabled")
      return true
    }.runOnQueue(.main)

    AsyncFunction("setShieldCopy") { (title: String, message: String, primaryLabel: String, secondaryLabel: String) -> Bool in
      guard let defaults = self.userDefaults else { return false }
      defaults.set(title, forKey: "customShieldTitle")
      defaults.set(message, forKey: "customShieldMessage")
      defaults.set(primaryLabel, forKey: "customShieldPrimaryLabel")
      defaults.set(secondaryLabel, forKey: "customShieldSecondaryLabel")
      return true
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

  private func applyNonApplicationShield(_ selection: FamilyActivitySelection) {
    self.settingsStore.shield.applicationCategories = selection.categoryTokens.isEmpty ? nil : .specific(selection.categoryTokens)
    self.settingsStore.shield.webDomains = selection.webDomainTokens.isEmpty ? nil : selection.webDomainTokens
    self.settingsStore.webContent.blockedByFilter = .auto()
  }

  private func loadPerAppLimits() -> [StoredApplicationLimit] {
    guard let data = userDefaults?.data(forKey: perAppLimitsKey),
          let rules = try? PropertyListDecoder().decode([StoredApplicationLimit].self, from: data) else {
      return []
    }
    return rules
  }

  private func savePerAppLimits(_ rules: [StoredApplicationLimit]) throws {
    guard let defaults = userDefaults else {
      throw NSError(domain: "Clean4Jesus", code: 2, userInfo: [NSLocalizedDescriptionKey: "El App Group no está disponible."])
    }
    defaults.set(try PropertyListEncoder().encode(rules), forKey: perAppLimitsKey)
    defaults.set(2, forKey: "clean4jesus.limitSchemaVersion")
    defaults.set("perApplication", forKey: "clean4jesus.limitMode")
  }

  private func hasUserConfiguredPerAppLimits() -> Bool {
    guard let defaults = userDefaults else { return false }
    if defaults.object(forKey: perAppLimitsConfiguredKey) != nil {
      return defaults.bool(forKey: perAppLimitsConfiguredKey)
    }
    // Releases before this marker already exposed rules to the user. Keep their
    // existing settings protected on upgrade rather than silently allowing edits.
    return !loadPerAppLimits().isEmpty
  }

  private func synchronizedPerAppLimits(for selection: FamilyActivitySelection) -> [StoredApplicationLimit] {
    let existing = loadPerAppLimits()
    let storedLegacyLimit = userDefaults?.integer(forKey: "dailyLimitMinutes") ?? 0
    let legacyLimit = storedLegacyLimit > 0 ? storedLegacyLimit : 30
    return selection.applicationTokens.map { token in
      if let rule = existing.first(where: { $0.token == token }) {
        return rule
      }
      return StoredApplicationLimit(id: UUID(), token: token, minutes: legacyLimit, enabled: true)
    }
  }

  private func startPerAppLimitMonitoring(rules: [StoredApplicationLimit]) throws {
    self.activityCenter.stopMonitoring([self.dailyActivityName])
    let enabledRules = rules.filter { $0.enabled && $0.minutes > 0 }
    guard !enabledRules.isEmpty else { return }
    let schedule = DeviceActivitySchedule(
      intervalStart: DateComponents(hour: 0, minute: 0),
      intervalEnd: DateComponents(hour: 23, minute: 59),
      repeats: true
    )
    var events: [DeviceActivityEvent.Name: DeviceActivityEvent] = [:]
    for rule in enabledRules {
      let eventName = DeviceActivityEvent.Name("clean4jesus.app-limit.\(rule.id.uuidString)")
      events[eventName] = makePerAppLimitEvent(token: rule.token, minutes: rule.minutes)
    }
    try self.activityCenter.startMonitoring(
      self.dailyActivityName,
      during: schedule,
      events: events
    )
  }

  private func makePerAppLimitEvent(token: ApplicationToken, minutes: Int) -> DeviceActivityEvent {
    let threshold = DateComponents(minute: max(1, minutes))
    if #available(iOS 17.4, *) {
      return DeviceActivityEvent(
        applications: [token],
        threshold: threshold,
        includesPastActivity: true
      )
    }
    // iOS 16–17.3 do not expose includesPastActivity. Apple starts this
    // event's baseline when monitoring begins on those system versions.
    return DeviceActivityEvent(
      applications: [token],
      threshold: threshold
    )
  }

  private func selectionSummary(_ selection: FamilyActivitySelection) -> [String: Int] {
    [
      "applications": selection.applicationTokens.count,
      "categories": selection.categoryTokens.count,
      "webDomains": selection.webDomainTokens.count,
    ]
  }
}
