import DeviceActivity
import FamilyControls
import Foundation
import ManagedSettings

@available(iOS 16.0, *)
class DeviceActivityMonitorExtension: DeviceActivityMonitor {
    let appGroupID = "group.com.clean4jesus.app"
    let perAppLimitsKey = "clean4jesus.perAppLimits.v2"
    let store = ManagedSettingsStore(named: .init("clean4jesus"))

    private struct StoredApplicationLimit: Codable {
        let id: UUID
        let token: ApplicationToken
        var minutes: Int
        var enabled: Bool
    }
    
    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)
        guard let defaults = UserDefaults(suiteName: appGroupID) else { return }
        defaults.set(true, forKey: "activityIntervalActive")
        store.shield.applications = nil
        defaults.removeObject(forKey: "dailyThresholdReached")
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
        applyShield(for: event, defaults: defaults)
    }

    private func applyShield(for event: DeviceActivityEvent.Name, defaults: UserDefaults) {
        guard let data = defaults.data(forKey: perAppLimitsKey),
              let rules = try? PropertyListDecoder().decode([StoredApplicationLimit].self, from: data),
              let rule = rules.first(where: {
                  DeviceActivityEvent.Name("clean4jesus.app-limit.\($0.id.uuidString)") == event
              }) else { return }
        var shieldedApplications = store.shield.applications ?? Set<ApplicationToken>()
        shieldedApplications.insert(rule.token)
        store.shield.applications = shieldedApplications
        defaults.set(rule.minutes, forKey: "lastReachedLimitMinutes")
        defaults.set(rule.id.uuidString, forKey: "lastReachedLimitRuleID")
        defaults.set(true, forKey: "shieldAppliedByDailyLimit")
    }
}
