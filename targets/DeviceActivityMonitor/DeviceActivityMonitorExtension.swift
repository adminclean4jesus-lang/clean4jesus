import DeviceActivity
import Foundation
import ManagedSettings

@available(iOS 15.0, *)
class DeviceActivityMonitorExtension: DeviceActivityMonitor {
    let appGroupID = "group.com.clean4jesus.app"
    
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
    }
}
