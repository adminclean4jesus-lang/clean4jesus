import ManagedSettings
import ManagedSettingsUI
import UIKit

@available(iOS 16.0, *)
class ShieldConfigurationExtension: ShieldConfigurationDataSource {
    let appGroupID = "group.com.clean4jesus.app"
    
    override func configuration(shielding application: Application) -> ShieldConfiguration {
        return createClean4JesusShieldConfig()
    }
    
    override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration {
        return createClean4JesusShieldConfig()
    }
    
    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        return createClean4JesusShieldConfig()
    }
    
    private func createClean4JesusShieldConfig() -> ShieldConfiguration {
        let defaults = UserDefaults(suiteName: appGroupID)
        let titleText = defaults?.string(forKey: "customShieldTitle") ?? "Refugio Clean4Jesus"
        let subtitleText = defaults?.string(forKey: "customShieldMessage") ?? "Esta pausa protege tu decisión. Puedes volver a Clean4Jesus para revisar tu refugio."

        return ShieldConfiguration(
            backgroundColor: UIColor(red: 0.03, green: 0.12, blue: 0.32, alpha: 1.0),
            icon: UIImage(named: "AppIcon"),
            title: ShieldConfiguration.Label(text: titleText, color: UIColor.white),
            subtitle: ShieldConfiguration.Label(text: subtitleText, color: UIColor(red: 0.85, green: 0.85, blue: 0.90, alpha: 1.0)),
            primaryButtonLabel: ShieldConfiguration.Label(text: defaults?.string(forKey: "customShieldPrimaryLabel") ?? "Abrir Clean4Jesus", color: UIColor(red: 0.03, green: 0.12, blue: 0.32, alpha: 1.0)),
            primaryButtonBackgroundColor: UIColor(red: 0.95, green: 0.80, blue: 0.30, alpha: 1.0),
            secondaryButtonLabel: ShieldConfiguration.Label(text: defaults?.string(forKey: "customShieldSecondaryLabel") ?? "Cerrar", color: UIColor.white)
        )
    }
}
