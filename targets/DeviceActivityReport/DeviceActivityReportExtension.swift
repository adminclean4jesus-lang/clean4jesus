import DeviceActivity
import FamilyControls
import Foundation
import ManagedSettings
import SwiftUI

private let reportContext = DeviceActivityReport.Context(rawValue: "clean4jesus.daily-usage")
private let appGroupID = "group.com.clean4jesus.app"
private let limitsKey = "clean4jesus.perAppLimits.v2"

private struct StoredApplicationLimit: Codable {
    let id: UUID
    let token: ApplicationToken
    let minutes: Int
    let enabled: Bool
}

private struct UsageRow: Identifiable {
    let id: String
    let token: ApplicationToken
    let name: String
    let used: TimeInterval
    let limit: Int?
}

private struct UsageReportConfiguration {
    let rows: [UsageRow]
    let updatedAt: Date?
}

private struct UsageReportView: View {
    let configuration: UsageReportConfiguration

    private static let formatter: DateComponentsFormatter = {
        let formatter = DateComponentsFormatter()
        formatter.allowedUnits = [.hour, .minute]
        formatter.unitsStyle = .abbreviated
        formatter.zeroFormattingBehavior = .dropAll
        return formatter
    }()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                HStack(spacing: 12) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 14)
                            .fill(Color(red: 0.10, green: 0.14, blue: 0.49))
                        Image(systemName: "shield.lefthalf.filled")
                            .font(.title3.weight(.semibold))
                            .foregroundStyle(.white)
                    }
                    .frame(width: 48, height: 48)
                    VStack(alignment: .leading, spacing: 3) {
                        Text("CLEAN4JESUS")
                            .font(.caption.weight(.bold))
                            .tracking(1.2)
                            .foregroundStyle(Color(red: 0.98, green: 0.66, blue: 0.15))
                        Text("Uso de hoy")
                            .font(.title2.weight(.bold))
                    }
                }

                if configuration.rows.isEmpty {
                    VStack(alignment: .leading, spacing: 10) {
                        Image(systemName: "chart.bar.xaxis")
                            .font(.title.weight(.semibold))
                            .foregroundStyle(Color(red: 0.10, green: 0.14, blue: 0.49))
                        Text("Aún no hay uso registrado")
                            .font(.headline.weight(.semibold))
                        Text("iOS puede tardar unos minutos en actualizar el uso. Vuelve a abrir esta pantalla cuando hayas usado una app protegida.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(18)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.primary.opacity(0.06))
                    .clipShape(RoundedRectangle(cornerRadius: 18))
                } else {
                    ForEach(configuration.rows) { row in
                        VStack(alignment: .leading, spacing: 10) {
                            HStack(alignment: .firstTextBaseline) {
                                Text(row.name).font(.headline.weight(.semibold))
                                Spacer()
                                Text(Self.formatter.string(from: row.used) ?? "0 min")
                                    .font(.headline.monospacedDigit().weight(.semibold))
                            }
                            if let limit = row.limit {
                                let remaining = max(0, TimeInterval(limit * 60) - row.used)
                                ProgressView(value: min(1, row.used / TimeInterval(limit * 60)))
                                    .tint(remaining == 0 ? .red : Color(red: 0.98, green: 0.66, blue: 0.15))
                                Text(remaining == 0
                                     ? "Límite alcanzado"
                                     : "Te quedan \(Self.formatter.string(from: remaining) ?? "0 min") de \(limit) min")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            } else {
                                Text("Sin límite configurado")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.primary.opacity(0.06))
                        .clipShape(RoundedRectangle(cornerRadius: 18))
                    }
                }

                if let updatedAt = configuration.updatedAt {
                    Label("Actualizado por iOS · \(updatedAt.formatted(date: .omitted, time: .shortened))", systemImage: "clock.arrow.circlepath")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(20)
        }
        .background(Color(uiColor: .systemBackground))
    }
}

private struct DailyUsageReport: DeviceActivityReportScene {
    let context: DeviceActivityReport.Context = reportContext
    let content: (UsageReportConfiguration) -> UsageReportView

    func makeConfiguration(
        representing data: DeviceActivityResults<DeviceActivityData>
    ) async -> UsageReportConfiguration {
        var durations: [String: (token: ApplicationToken, name: String, used: TimeInterval)] = [:]
        var updatedAt: Date?

        for await deviceData in data {
            updatedAt = deviceData.lastUpdatedDate
            for await segment in deviceData.activitySegments {
                for await category in segment.categories {
                    for await application in category.applications {
                        guard let token = application.application.token else { continue }
                        let identifier = application.application.localizedDisplayName ?? application.application.bundleIdentifier ?? UUID().uuidString
                        let current = durations[identifier] ?? (token, application.application.localizedDisplayName ?? "App", 0)
                        durations[identifier] = (current.token, current.name, current.used + application.totalActivityDuration)
                    }
                }
            }
        }

        let limits = loadLimits()
        let rows = durations.map { identifier, value in
            UsageRow(id: identifier, token: value.token, name: value.name, used: value.used, limit: limitFor(token: value.token, limits: limits))
        }.sorted { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
        return UsageReportConfiguration(rows: rows, updatedAt: updatedAt)
    }

    private func loadLimits() -> [StoredApplicationLimit] {
        guard let defaults = UserDefaults(suiteName: appGroupID),
              let data = defaults.data(forKey: limitsKey),
              let rules = try? PropertyListDecoder().decode([StoredApplicationLimit].self, from: data) else { return [] }
        return rules
    }

    private func limitFor(token: ApplicationToken, limits: [StoredApplicationLimit]) -> Int? {
        limits.first(where: { $0.token == token })?.minutes
    }
}

@main
struct Clean4JesusDeviceActivityReportExtension: DeviceActivityReportExtension {
    var body: some DeviceActivityReportScene {
        DailyUsageReport { configuration in
            UsageReportView(configuration: configuration)
        }
    }
}
