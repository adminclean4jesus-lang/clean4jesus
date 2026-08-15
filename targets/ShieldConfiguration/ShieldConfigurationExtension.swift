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
        let titleText = defaults?.string(forKey: "customShieldTitle") ?? "Límite diario alcanzado"
        let subtitleText = defaults?.string(forKey: "customShieldMessage") ?? "Ya usaste el tiempo que elegiste para esta app. Tu refugio sigue activo."
        let primaryLabel = defaults?.string(forKey: "customShieldPrimaryLabel") ?? "Cerrar aplicación"

        return ShieldConfiguration(
            backgroundColor: UIColor(red: 0.03, green: 0.12, blue: 0.32, alpha: 1.0),
            icon: makeClean4JesusIcon(),
            title: ShieldConfiguration.Label(text: titleText, color: .white),
            subtitle: ShieldConfiguration.Label(text: subtitleText, color: UIColor(red: 0.85, green: 0.85, blue: 0.90, alpha: 1.0)),
            primaryButtonLabel: ShieldConfiguration.Label(text: primaryLabel, color: UIColor(red: 0.03, green: 0.12, blue: 0.32, alpha: 1.0)),
            primaryButtonBackgroundColor: UIColor(red: 0.95, green: 0.80, blue: 0.30, alpha: 1.0),
            secondaryButtonLabel: nil
        )
    }

    private func makeClean4JesusIcon() -> UIImage {
        let size = CGSize(width: 84, height: 84)
        return UIGraphicsImageRenderer(size: size).image { _ in
            let rect = CGRect(origin: .zero, size: size)
            UIColor(red: 0.95, green: 0.80, blue: 0.30, alpha: 1.0).setFill()
            UIBezierPath(ovalIn: rect.insetBy(dx: 2, dy: 2)).fill()

            let shield = UIBezierPath()
            shield.move(to: CGPoint(x: 42, y: 13))
            shield.addLine(to: CGPoint(x: 66, y: 23))
            shield.addLine(to: CGPoint(x: 63, y: 52))
            shield.addCurve(to: CGPoint(x: 42, y: 71), controlPoint1: CGPoint(x: 60, y: 62), controlPoint2: CGPoint(x: 51, y: 68))
            shield.addCurve(to: CGPoint(x: 21, y: 52), controlPoint1: CGPoint(x: 33, y: 68), controlPoint2: CGPoint(x: 24, y: 62))
            shield.addLine(to: CGPoint(x: 18, y: 23))
            shield.close()
            UIColor(red: 0.03, green: 0.12, blue: 0.32, alpha: 1.0).setFill()
            shield.fill()

            UIColor.white.setFill()
            UIBezierPath(roundedRect: CGRect(x: 38, y: 29, width: 8, height: 28), cornerRadius: 4).fill()
            UIBezierPath(roundedRect: CGRect(x: 28, y: 39, width: 28, height: 8), cornerRadius: 4).fill()
        }
    }
}
