package com.clean4jesus.app

import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Context
import android.provider.Settings
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

/**
 * Sends a deliberately minimal check-in for the voluntary accompanied mode.
 * It never includes screen text, visited URLs, application names, or content.
 */
class ProtectionHealthWorker(
  appContext: Context,
  workerParams: WorkerParameters,
) : CoroutineWorker(appContext, workerParams) {
  override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
    val prefs = applicationContext.getSharedPreferences(
      Clean4JesusAccessibilityService.PREFS_NAME,
      Context.MODE_PRIVATE,
    )
    val endpoint = prefs.getString(Clean4JesusAccessibilityService.PREF_ACCOUNTABILITY_HEALTH_ENDPOINT, null)
      ?: return@withContext Result.success()
    val deviceId = prefs.getString(Clean4JesusAccessibilityService.PREF_ACCOUNTABILITY_DEVICE_ID, null)
      ?: return@withContext Result.success()
    val secret = prefs.getString(Clean4JesusAccessibilityService.PREF_ACCOUNTABILITY_DEVICE_SECRET, null)
      ?: return@withContext Result.success()

    val payload = JSONObject()
      .put("accessibilityEnabled", isClean4JesusAccessibilityEnabled())
      .put("deviceId", deviceId)
      .put("idempotencyKey", UUID.randomUUID().toString())
      .put("secret", secret)
      .put("vpnEnabled", Clean4JesusVpnService.isActive())

    try {
      val connection = URL(endpoint).openConnection() as HttpURLConnection
      connection.requestMethod = "POST"
      connection.connectTimeout = 5_000
      connection.readTimeout = 5_000
      connection.doOutput = true
      connection.setRequestProperty("Content-Type", "application/json")
      connection.outputStream.use { it.write(payload.toString().toByteArray(Charsets.UTF_8)) }
      val responseCode = connection.responseCode
      connection.disconnect()
      return@withContext when {
        responseCode in 200..299 -> Result.success()
        responseCode in 400..499 -> Result.failure()
        else -> Result.retry()
      }
    } catch (_: Exception) {
      Result.retry()
    }
  }

  private fun isClean4JesusAccessibilityEnabled(): Boolean {
    val expected = "${applicationContext.packageName}/${Clean4JesusAccessibilityService::class.java.name}"
      .lowercase()
    val enabled = Settings.Secure.getString(
      applicationContext.contentResolver,
      Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES,
    ).orEmpty()
    if (enabled.split(':').any { it.lowercase() == expected }) return true

    // The setting is authoritative, but the service list handles manufacturer
    // formatting differences without ever inspecting other services.
    val manager = applicationContext.getSystemService(Context.ACCESSIBILITY_SERVICE)
      as? android.view.accessibility.AccessibilityManager ?: return false
    return manager.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)
      .any { it.resolveInfo.serviceInfo.packageName == applicationContext.packageName &&
        it.resolveInfo.serviceInfo.name == Clean4JesusAccessibilityService::class.java.name }
  }
}
