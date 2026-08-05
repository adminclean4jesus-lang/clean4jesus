import Foundation
import ManagedSettings

private enum ShieldActionStorage {
  static let appGroup = "group.com.clean4jesus.app"
  static let rescueRequestedKey = "clean4jesus.rescueRequested"

  static var defaults: UserDefaults? {
    UserDefaults(suiteName: appGroup)
  }
}

final class ShieldActionExtension: ShieldActionDelegate {
  override func handle(
    action: ShieldAction,
    for application: ApplicationToken,
    completionHandler: @escaping (ShieldActionResponse) -> Void
  ) {
    respond(to: action, completionHandler: completionHandler)
  }

  override func handle(
    action: ShieldAction,
    for webDomain: WebDomainToken,
    completionHandler: @escaping (ShieldActionResponse) -> Void
  ) {
    respond(to: action, completionHandler: completionHandler)
  }

  override func handle(
    action: ShieldAction,
    for category: ActivityCategoryToken,
    completionHandler: @escaping (ShieldActionResponse) -> Void
  ) {
    respond(to: action, completionHandler: completionHandler)
  }

  private func respond(
    to action: ShieldAction,
    completionHandler: @escaping (ShieldActionResponse) -> Void
  ) {
    switch action {
    case .primaryButtonPressed:
      // Persist the rescue intent for the container app, then use the broadly
      // available safe response for the shielded surface.
      ShieldActionStorage.defaults?.set(true, forKey: ShieldActionStorage.rescueRequestedKey)
      completionHandler(.close)
    case .secondaryButtonPressed:
      completionHandler(.close)
    @unknown default:
      completionHandler(.none)
    }
  }
}
