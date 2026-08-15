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
            backgroundColor: UIColor(red: 0.027, green: 0.122, blue: 0.322, alpha: 1.0),
            icon: makeClean4JesusMark(),
            title: ShieldConfiguration.Label(text: titleText, color: .white),
            subtitle: ShieldConfiguration.Label(text: subtitleText, color: UIColor(red: 0.88, green: 0.90, blue: 0.95, alpha: 1.0)),
            primaryButtonLabel: ShieldConfiguration.Label(text: primaryLabel, color: UIColor(red: 0.03, green: 0.12, blue: 0.32, alpha: 1.0)),
            primaryButtonBackgroundColor: UIColor(red: 0.98, green: 0.98, blue: 0.96, alpha: 1.0),
            secondaryButtonLabel: nil
        )
    }

    private func makeClean4JesusMark() -> UIImage {
        let size = CGSize(width: 96, height: 96)
        return UIGraphicsImageRenderer(size: size).image { _ in
            let shield = UIBezierPath()
            shield.move(to: CGPoint(x: 48, y: 8))
            shield.addLine(to: CGPoint(x: 77, y: 20))
            shield.addLine(to: CGPoint(x: 73, y: 54))
            shield.addCurve(to: CGPoint(x: 48, y: 82), controlPoint1: CGPoint(x: 70, y: 67), controlPoint2: CGPoint(x: 58, y: 77))
            shield.addCurve(to: CGPoint(x: 23, y: 54), controlPoint1: CGPoint(x: 38, y: 77), controlPoint2: CGPoint(x: 26, y: 67))
            shield.addLine(to: CGPoint(x: 19, y: 20))
            shield.close()
            UIColor(red: 0.95, green: 0.80, blue: 0.30, alpha: 1.0).setStroke()
            shield.lineWidth = 4
            shield.stroke()

            UIColor(red: 0.10, green: 0.24, blue: 0.52, alpha: 1.0).setFill()
            shield.fill()

            UIColor.white.setFill()
            UIBezierPath(roundedRect: CGRect(x: 43, y: 29, width: 10, height: 35), cornerRadius: 5).fill()
            UIBezierPath(roundedRect: CGRect(x: 31, y: 42, width: 34, height: 10), cornerRadius: 5).fill()
        }
    }
}
