import DeviceActivity
import FamilyControls
import Foundation
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
        VStack(alignment: .leading, spacing: 16) {
            Text("Uso de hoy")
                .font(.title2.weight(.semibold))
            if configuration.rows.isEmpty {
                Text("Todavía no hay uso registrado para tus apps protegidas.")
                    .foregroundStyle(.secondary)
            } else {
                ForEach(configuration.rows) { row in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text(row.name).font(.headline)
                            Spacer()
                            Text(Self.formatter.string(from: row.used) ?? "0 min")
                                .font(.subheadline.monospacedDigit())
                        }
                        if let limit = row.limit {
                            let remaining = max(0, TimeInterval(limit * 60) - row.used)
                            ProgressView(value: min(1, row.used / TimeInterval(limit * 60)))
                                .tint(remaining == 0 ? .red : .accentColor)
                            Text(remaining == 0
                                 ? "Límite alcanzado"
                                 : "Te quedan \(Self.formatter.string(from: remaining) ?? "0 min") de \(limit) min")
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                        } else {
                            Text("Sin límite configurado")
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
            if let updatedAt = configuration.updatedAt {
                Text("Actualizado por iOS: \(updatedAt.formatted(date: .omitted, time: .shortened))")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

private struct DailyUsageReport: DeviceActivityReportScene {
    let context: DeviceActivityReport.Context = reportContext
    let content: (UsageReportConfiguration) -> UsageReportView

    func makeConfiguration(
        representing data: DeviceActivityResults<DeviceActivityData>
    ) async -> UsageReportConfiguration {
        var durations: [String: (name: String, used: TimeInterval)] = [:]
        var updatedAt: Date?

        for await deviceData in data {
            updatedAt = deviceData.lastUpdatedDate
            for await segment in deviceData.activitySegments {
                for await application in segment.applications {
                    let identifier = application.application.bundleIdentifier ?? application.application.localizedDisplayName ?? UUID().uuidString
                    let current = durations[identifier] ?? (application.application.localizedDisplayName ?? "App", 0)
                    durations[identifier] = (current.name, current.used + application.totalActivityDuration)
                }
            }
        }

        let limits = loadLimits()
        let rows = durations.map { identifier, value in
            UsageRow(id: identifier, name: value.name, used: value.used, limit: limitFor(identifier: identifier, limits: limits))
        }.sorted { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
        return UsageReportConfiguration(rows: rows, updatedAt: updatedAt)
    }

    private func loadLimits() -> [StoredApplicationLimit] {
        guard let defaults = UserDefaults(suiteName: appGroupID),
              let data = defaults.data(forKey: limitsKey),
              let rules = try? PropertyListDecoder().decode([StoredApplicationLimit].self, from: data) else { return [] }
        return rules
    }

    private func limitFor(identifier: String, limits: [StoredApplicationLimit]) -> Int? {
        limits.first(where: { Application(token: $0.token).bundleIdentifier == identifier })?.minutes
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
