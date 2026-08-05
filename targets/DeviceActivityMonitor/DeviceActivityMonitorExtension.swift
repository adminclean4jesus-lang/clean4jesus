import DeviceActivity
import FamilyControls
import Foundation
import ManagedSettings

private enum RefugeStorage {
  static let appGroup = "group.com.clean4jesus.app"
  static let selectionKey = "clean4jesus.familyActivitySelection"
  static let shieldActiveKey = "clean4jesus.shieldActive"
  static let storeName = ManagedSettingsStore.Name("clean4jesus")

  static var defaults: UserDefaults? {
    UserDefaults(suiteName: appGroup)
  }

  static func selection() -> FamilyActivitySelection {
    guard let data = defaults?.data(forKey: selectionKey),
          let selection = try? PropertyListDecoder().decode(FamilyActivitySelection.self, from: data) else {
      return FamilyActivitySelection()
    }
    return selection
  }
}

final class DeviceActivityMonitorExtension: DeviceActivityMonitor {
  private let store = ManagedSettingsStore(named: RefugeStorage.storeName)

  override func intervalDidStart(for activity: DeviceActivityName) {
    super.intervalDidStart(for: activity)
    clearUsageShields()
  }

  override func intervalDidEnd(for activity: DeviceActivityName) {
    super.intervalDidEnd(for: activity)
    clearUsageShields()
  }

  override func eventDidReachThreshold(
    _ event: DeviceActivityEvent.Name,
    activity: DeviceActivityName
  ) {
    super.eventDidReachThreshold(event, activity: activity)
    let selection = RefugeStorage.selection()

    store.shield.applications = selection.applicationTokens.isEmpty ? nil : selection.applicationTokens
    store.shield.applicationCategories = selection.categoryTokens.isEmpty
      ? nil
      : .specific(selection.categoryTokens)
    store.shield.webDomains = selection.webDomainTokens.isEmpty ? nil : selection.webDomainTokens
    RefugeStorage.defaults?.set(true, forKey: RefugeStorage.shieldActiveKey)
  }

  private func clearUsageShields() {
    store.shield.applications = nil
    store.shield.applicationCategories = nil
    store.shield.webDomains = nil
    RefugeStorage.defaults?.set(false, forKey: RefugeStorage.shieldActiveKey)
  }
}
