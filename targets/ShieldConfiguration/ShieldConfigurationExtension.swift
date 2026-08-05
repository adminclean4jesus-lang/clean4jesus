import Foundation
import ManagedSettings
import ManagedSettingsUI
import UIKit

private enum ShieldCopy {
  static let appGroup = "group.com.clean4jesus.app"
  static let languageKey = "clean4jesus.language"

  static var language: String {
    UserDefaults(suiteName: appGroup)?.string(forKey: languageKey) ?? "es"
  }

  static var title: String {
    switch language {
    case "en": return "Pause for a moment"
    case "fr": return "Faites une pause"
    case "pt": return "Pare por um momento"
    default: return "Detente un momento"
    }
  }

  static var subtitle: String {
    switch language {
    case "en": return "Your limit is complete. Take a breath and choose your next step clearly."
    case "fr": return "Votre limite est atteinte. Respirez et choisissez la suite avec clarté."
    case "pt": return "Seu limite terminou. Respire e escolha o próximo passo com clareza."
    default: return "Tu límite terminó. Respira y elige el siguiente paso con claridad."
    }
  }

  static var rescue: String {
    switch language {
    case "en": return "Open 60-second rescue"
    case "fr": return "Ouvrir la pause de 60 secondes"
    case "pt": return "Abrir resgate de 60 segundos"
    default: return "Abrir rescate de 60 segundos"
    }
  }

  static var close: String {
    switch language {
    case "en": return "Close"
    case "fr": return "Fermer"
    case "pt": return "Fechar"
    default: return "Cerrar"
    }
  }
}

final class ShieldConfigurationExtension: ShieldConfigurationDataSource {
  override func configuration(shielding application: Application) -> ShieldConfiguration {
    makeConfiguration()
  }

  override func configuration(
    shielding application: Application,
    in category: ActivityCategory
  ) -> ShieldConfiguration {
    makeConfiguration()
  }

  override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
    makeConfiguration()
  }

  override func configuration(
    shielding webDomain: WebDomain,
    in category: ActivityCategory
  ) -> ShieldConfiguration {
    makeConfiguration()
  }

  private func makeConfiguration() -> ShieldConfiguration {
    ShieldConfiguration(
      backgroundBlurStyle: .systemMaterialDark,
      backgroundColor: UIColor(red: 0.03, green: 0.12, blue: 0.32, alpha: 0.92),
      icon: UIImage(systemName: "shield.lefthalf.filled"),
      title: ShieldConfiguration.Label(
        text: ShieldCopy.title,
        color: .white
      ),
      subtitle: ShieldConfiguration.Label(
        text: ShieldCopy.subtitle,
        color: UIColor(white: 0.88, alpha: 1)
      ),
      primaryButtonLabel: ShieldConfiguration.Label(
        text: ShieldCopy.rescue,
        color: UIColor(red: 0.03, green: 0.12, blue: 0.32, alpha: 1)
      ),
      primaryButtonBackgroundColor: UIColor(red: 0.95, green: 0.78, blue: 0.32, alpha: 1),
      secondaryButtonLabel: ShieldConfiguration.Label(
        text: ShieldCopy.close,
        color: .white
      )
    )
  }
}
