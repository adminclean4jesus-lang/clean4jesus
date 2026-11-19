import ManagedSettings
import ManagedSettingsUI
import UIKit

@available(iOS 16.0, *)
class ShieldConfigurationExtension: ShieldConfigurationDataSource {
    let appGroupID = "group.com.clean4jesus.app"

    override func configuration(shielding application: Application) -> ShieldConfiguration {
        createClean4JesusShieldConfig()
    }

    override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration {
        createClean4JesusShieldConfig()
    }

    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        createClean4JesusShieldConfig()
    }

    private func createClean4JesusShieldConfig() -> ShieldConfiguration {
        let defaults = UserDefaults(suiteName: appGroupID)
        let titleText = defaults?.string(forKey: "customShieldTitle") ?? "Tu límite de hoy se cumplió"
        let subtitleText = defaults?.string(forKey: "customShieldMessage") ?? "Ya usaste el tiempo que elegiste para esta app. Tu refugio permanece activo."
        let primaryLabel = defaults?.string(forKey: "customShieldPrimaryLabel") ?? "Cerrar aplicación"

        return ShieldConfiguration(
            backgroundBlurStyle: .systemMaterialLight,
            backgroundColor: UIColor(red: 0.94, green: 0.96, blue: 0.99, alpha: 1.0),
            icon: UIImage(named: "Clean4JesusOfficialMark"),
            title: ShieldConfiguration.Label(text: titleText, color: UIColor(red: 0.027, green: 0.122, blue: 0.322, alpha: 1.0)),
            subtitle: ShieldConfiguration.Label(text: subtitleText, color: UIColor(red: 0.19, green: 0.29, blue: 0.43, alpha: 1.0)),
            primaryButtonLabel: ShieldConfiguration.Label(text: primaryLabel, color: .white),
            primaryButtonBackgroundColor: UIColor(red: 0.027, green: 0.122, blue: 0.322, alpha: 1.0),
            secondaryButtonLabel: nil
        )
    }

}
