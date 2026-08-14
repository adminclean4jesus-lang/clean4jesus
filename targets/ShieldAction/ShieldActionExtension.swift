import ManagedSettings
import Foundation

@available(iOS 16.0, *)
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
            // iOS 16-18 no permite abrir la app principal desde una extensión Shield.
            // Cerrar la app protegida devuelve al usuario a la pantalla de inicio.
            completionHandler(.close)
        case .secondaryButtonPressed:
            // Cerrar interrupción
            completionHandler(.close)
        @unknown default:
            completionHandler(.close)
        }
    }
}
