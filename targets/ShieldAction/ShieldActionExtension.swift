import ManagedSettings
import Foundation

@available(iOS 15.0, *)
class ShieldActionExtension: ShieldActionDelegate {
    let appGroupID = "group.com.clean4jesus.app"
    
    override func handle(action: ShieldAction, for application: ApplicationToken, completionHandler: @escaping (ShieldActionResponse) -> Void) {
        handleAction(action, completionHandler: completionHandler)
    }

    override func handle(action: ShieldAction, for webDomain: WebDomainToken, completionHandler: @escaping (ShieldActionResponse) -> Void) {
        handleAction(action, completionHandler: completionHandler)
    }

    private func handleAction(_ action: ShieldAction, completionHandler: @escaping (ShieldActionResponse) -> Void) {
        guard let defaults = UserDefaults(suiteName: appGroupID) else {
            completionHandler(.close)
            return
        }

        switch action {
        case .primaryButtonPressed:
            // Activar pausa de rescate de 60 segundos
            defaults.set(true, forKey: "rescueActive")
            defaults.set(Date().timeIntervalSince1970, forKey: "rescueActiveTimestamp")
            completionHandler(.defer)
        case .secondaryButtonPressed:
            // Cerrar interrupción
            completionHandler(.close)
        @unknown default:
            completionHandler(.close)
        }
    }
}
