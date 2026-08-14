import DeviceActivity
import FamilyControls
import Foundation
import ManagedSettings

@available(iOS 16.0, *)
class DeviceActivityMonitorExtension: DeviceActivityMonitor {
    let appGroupID = "group.com.clean4jesus.app"
    let selectionKey = "clean4jesus.familyActivitySelection"
    let store = ManagedSettingsStore(named: .init("clean4jesus"))
    
    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)
        guard let defaults = UserDefaults(suiteName: appGroupID) else { return }
        defaults.set(true, forKey: "activityIntervalActive")
    }

    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)
        guard let defaults = UserDefaults(suiteName: appGroupID) else { return }
        defaults.set(false, forKey: "activityIntervalActive")
    }

    override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
        super.eventDidReachThreshold(event, activity: activity)
        guard let defaults = UserDefaults(suiteName: appGroupID) else { return }
        defaults.set(true, forKey: "dailyThresholdReached")
        applyStoredSelection(defaults: defaults)
    }

    private func applyStoredSelection(defaults: UserDefaults) {
        guard let data = defaults.data(forKey: selectionKey),
              let selection = try? PropertyListDecoder().decode(FamilyActivitySelection.self, from: data) else { return }
        store.shield.applications = selection.applicationTokens.isEmpty ? nil : selection.applicationTokens
        store.shield.applicationCategories = selection.categoryTokens.isEmpty ? nil : .specific(selection.categoryTokens)
        store.shield.webDomains = selection.webDomainTokens.isEmpty ? nil : selection.webDomainTokens
        store.webContent.blockedByFilter = .auto()
        defaults.set(true, forKey: "shieldAppliedByDailyLimit")
    }
}
