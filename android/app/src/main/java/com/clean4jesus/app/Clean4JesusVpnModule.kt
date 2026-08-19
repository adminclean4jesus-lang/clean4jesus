package com.clean4jesus.app

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.os.ResultReceiver
import android.provider.Settings
import android.text.TextUtils
import android.content.Context
import android.net.Uri
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.concurrent.TimeUnit

class Clean4JesusVpnModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  companion object {
    const val EXTRA_RESULT_RECEIVER = "clean4jesus.vpn_result_receiver"
    const val RESULT_VPN_ACTIVE = 1
    const val RESULT_VPN_INACTIVE = 0
  }

  override fun getName(): String = "Clean4JesusVpn"

  @ReactMethod
  fun startDnsVpn(promise: Promise) {
    try {
      val resultReceiver = object : ResultReceiver(Handler(Looper.getMainLooper())) {
        override fun onReceiveResult(resultCode: Int, resultData: Bundle?) {
          promise.resolve(resultCode == RESULT_VPN_ACTIVE && Clean4JesusVpnService.isActive())
        }
      }
      val intent = Intent(reactContext, Clean4JesusVpnPermissionActivity::class.java).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        putExtra(EXTRA_RESULT_RECEIVER, resultReceiver)
      }
      reactContext.startActivity(intent)
    } catch (error: Exception) {
      promise.reject("VPN_START_FAILED", error)
    }
  }

  @ReactMethod
  fun stopDnsVpn(promise: Promise) {
    try {
      reactContext.startService(Intent(reactContext, Clean4JesusVpnService::class.java).apply {
        action = Clean4JesusVpnService.ACTION_STOP
      })
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("VPN_STOP_FAILED", error)
    }
  }

  @ReactMethod
  fun getStatus(promise: Promise) {
    promise.resolve(Clean4JesusVpnService.isActive())
  }

  @ReactMethod
  fun syncLanguage(language: String, promise: Promise) {
    try {
      val normalized = if (language in setOf("es", "en", "fr", "pt")) language else "es"
      reactContext.getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)
        .edit()
        .putString(Clean4JesusAccessibilityService.PREF_APP_LANGUAGE, normalized)
        .apply()
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("LANGUAGE_SYNC_FAILED", error)
    }
  }

  @ReactMethod
  fun isAccessibilityInterventionEnabled(promise: Promise) {
    try {
      val enabledServices = Settings.Secure.getString(
        reactContext.contentResolver,
        Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
      )
      val expected = "${reactContext.packageName}/${Clean4JesusAccessibilityService::class.java.name}"
      val colonSplitter = TextUtils.SimpleStringSplitter(':')

      if (enabledServices != null) {
        colonSplitter.setString(enabledServices)
        while (colonSplitter.hasNext()) {
          if (colonSplitter.next().equals(expected, ignoreCase = true)) {
            promise.resolve(true)
            return
          }
        }
      }

      promise.resolve(false)
    } catch (error: Exception) {
      promise.reject("ACCESSIBILITY_STATUS_FAILED", error)
    }
  }

  @ReactMethod
  fun pauseAccessibilityIntervention(promise: Promise) {
    try {
      promise.resolve(Clean4JesusAccessibilityService.pauseIfRunning())
    } catch (error: Exception) {
      promise.reject("ACCESSIBILITY_PAUSE_FAILED", error)
    }
  }

  @ReactMethod
  fun syncAppProtectionRules(rulesJson: String, promise: Promise) {
    try {
      val prefs = reactContext.getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)
      val previousRules = JSONArray(prefs.getString(Clean4JesusAccessibilityService.PREF_APP_RULES, "[]") ?: "[]")
      val nextRules = JSONArray(rulesJson)
      val nextPackages = mutableSetOf<String>()
      for (index in 0 until nextRules.length()) {
        nextRules.optJSONObject(index)?.optString("packageName")?.takeIf { it.isNotBlank() }?.let(nextPackages::add)
      }
      val editor = prefs.edit().putString(Clean4JesusAccessibilityService.PREF_APP_RULES, rulesJson)
      for (index in 0 until previousRules.length()) {
        val packageName = previousRules.optJSONObject(index)?.optString("packageName").orEmpty()
        if (packageName.isNotBlank() && !nextPackages.contains(packageName)) {
          editor.remove(Clean4JesusAccessibilityService.temporaryUnlockKey(packageName))
        }
      }
      editor.apply()
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("APP_RULES_SYNC_FAILED", error)
    }
  }

  @ReactMethod
  fun syncGuardianPin(pin: String, promise: Promise) {
    try {
      val prefs = reactContext.getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)
      prefs.edit()
        .putString(Clean4JesusAccessibilityService.PREF_GUARDIAN_PIN, pin)
        .remove(InterruptionActivity.PREF_PIN_FAILED_ATTEMPTS)
        .remove(InterruptionActivity.PREF_PIN_LOCKED_UNTIL)
        .remove(InterruptionActivity.PREF_PIN_LOCKED_BOOT_COUNT)
        .also { editor -> prefs.all.keys.filter { it.startsWith(Clean4JesusAccessibilityService.PREF_APP_UNLOCK_PREFIX) }.forEach(editor::remove) }
        .apply()
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("PIN_SYNC_FAILED", error)
    }
  }

  @ReactMethod
  fun verifyGuardianPin(pin: String, promise: Promise) {
    try {
      promise.resolve(InterruptionActivity.verifyGuardianPin(reactContext, pin))
    } catch (error: Exception) {
      promise.reject("PIN_VERIFY_FAILED", error)
    }
  }

  @ReactMethod
  fun getGuardianPinLockoutRemainingMs(promise: Promise) {
    try {
      promise.resolve(InterruptionActivity.remainingPinLockoutMs(reactContext).toDouble())
    } catch (error: Exception) {
      promise.reject("PIN_LOCKOUT_READ_FAILED", error)
    }
  }

  @ReactMethod
  fun copyInterruptionImage(uri: String, promise: Promise) {
    try {
      val destination = File(reactContext.filesDir, "interruption_background.jpg")
      reactContext.contentResolver.openInputStream(Uri.parse(uri)).use { input ->
        if (input == null) throw IllegalArgumentException("IMAGE_UNAVAILABLE")
        destination.outputStream().use { output -> input.copyTo(output) }
      }
      promise.resolve(destination.absolutePath)
    } catch (error: Exception) {
      promise.reject("INTERRUPTION_IMAGE_COPY_FAILED", error)
    }
  }

  @ReactMethod
  fun syncInterruptionCustomization(message: String, reference: String, imagePath: String, promise: Promise) {
    try {
      if (imagePath.isBlank()) {
        File(reactContext.filesDir, "interruption_background.jpg").delete()
      }
      reactContext.getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)
        .edit()
        .putString(InterruptionActivity.PREF_CUSTOM_MESSAGE, message.take(180))
        .putString(InterruptionActivity.PREF_CUSTOM_REFERENCE, reference.take(60))
        .putString(InterruptionActivity.PREF_CUSTOM_IMAGE_PATH, imagePath)
        .apply()
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("INTERRUPTION_CUSTOMIZATION_SYNC_FAILED", error)
    }
  }

  @ReactMethod
  fun configureAccountabilityDevice(endpoint: String, healthEndpoint: String, healthMonitoringEnabled: Boolean, deviceId: String, secret: String, promise: Promise) {
    try {
      if (!endpoint.startsWith("https://") || !healthEndpoint.startsWith("https://") || deviceId.isBlank() || secret.length < 32) {
        throw IllegalArgumentException("INVALID_ACCOUNTABILITY_CONFIGURATION")
      }
      reactContext.getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)
        .edit()
        .putString(Clean4JesusAccessibilityService.PREF_ACCOUNTABILITY_ENDPOINT, endpoint)
        .putString(Clean4JesusAccessibilityService.PREF_ACCOUNTABILITY_HEALTH_ENDPOINT, healthEndpoint)
        .putString(Clean4JesusAccessibilityService.PREF_ACCOUNTABILITY_DEVICE_ID, deviceId)
        .putString(Clean4JesusAccessibilityService.PREF_ACCOUNTABILITY_DEVICE_SECRET, secret)
        .apply()
      if (healthMonitoringEnabled) {
        val constraints = Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()
        val periodic = PeriodicWorkRequestBuilder<ProtectionHealthWorker>(15, TimeUnit.MINUTES)
          .setConstraints(constraints)
          .build()
        WorkManager.getInstance(reactContext).enqueueUniquePeriodicWork(
          "clean4jesus-protection-health",
          ExistingPeriodicWorkPolicy.UPDATE,
          periodic,
        )
        WorkManager.getInstance(reactContext).enqueueUniqueWork(
          "clean4jesus-protection-health-now",
          ExistingWorkPolicy.REPLACE,
          OneTimeWorkRequestBuilder<ProtectionHealthWorker>().setConstraints(constraints).build(),
        )
      } else {
        WorkManager.getInstance(reactContext).cancelUniqueWork("clean4jesus-protection-health")
        WorkManager.getInstance(reactContext).cancelUniqueWork("clean4jesus-protection-health-now")
      }
      Clean4JesusAccessibilityService.flushRiskSignalsIfRunning()
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("ACCOUNTABILITY_CONFIGURATION_FAILED", error)
    }
  }

  @ReactMethod
  fun configureFalsePositiveReporting(endpoint: String, apiKey: String, promise: Promise) {
    try {
      if (!endpoint.startsWith("https://") || apiKey.length < 20) {
        throw IllegalArgumentException("INVALID_FALSE_POSITIVE_CONFIGURATION")
      }
      reactContext.getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)
        .edit()
        .putString(Clean4JesusAccessibilityService.PREF_FALSE_POSITIVE_ENDPOINT, endpoint)
        .putString(Clean4JesusAccessibilityService.PREF_FALSE_POSITIVE_API_KEY, apiKey)
        .apply()
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("FALSE_POSITIVE_CONFIGURATION_FAILED", error)
    }
  }

  @ReactMethod
  fun clearAccountabilityDevice(promise: Promise) {
    try {
      reactContext.getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)
        .edit()
        .remove(Clean4JesusAccessibilityService.PREF_ACCOUNTABILITY_ENDPOINT)
        .remove(Clean4JesusAccessibilityService.PREF_ACCOUNTABILITY_HEALTH_ENDPOINT)
        .remove(Clean4JesusAccessibilityService.PREF_ACCOUNTABILITY_DEVICE_ID)
        .remove(Clean4JesusAccessibilityService.PREF_ACCOUNTABILITY_DEVICE_SECRET)
        .remove(Clean4JesusAccessibilityService.PREF_ACCOUNTABILITY_PENDING_SIGNALS)
        .apply()
      WorkManager.getInstance(reactContext).cancelUniqueWork("clean4jesus-protection-health")
      WorkManager.getInstance(reactContext).cancelUniqueWork("clean4jesus-protection-health-now")
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("ACCOUNTABILITY_CLEAR_FAILED", error)
    }
  }

  @ReactMethod
  fun getAppProtectionUsage(packageNamesJson: String, promise: Promise) {
    try {
      val packageNames = JSONArray(packageNamesJson)
      val usage = JSONArray()
      val now = System.currentTimeMillis()
      val bootCount = try { Settings.Global.getInt(reactContext.contentResolver, Settings.Global.BOOT_COUNT) } catch (_: Exception) { -1 }

      for (index in 0 until packageNames.length()) {
        val packageName = packageNames.optString(index, "")
        if (packageName.isBlank()) continue
        usage.put(
          JSONObject()
            .put("packageName", packageName)
            .put("usedMs", Clean4JesusAccessibilityService.getUsageSnapshot(reactContext, packageName, now))
        )
      }

      promise.resolve(usage.toString())
    } catch (error: Exception) {
      promise.reject("APP_USAGE_READ_FAILED", error)
    }
  }

  @ReactMethod
  fun getTemporaryAppUnlocks(packageNamesJson: String, promise: Promise) {
    try {
      val packageNames = JSONArray(packageNamesJson)
      val prefs = reactContext.getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)
      val unlocks = JSONArray()
      val now = SystemClock.elapsedRealtime()
      val bootCount = try { Settings.Global.getInt(reactContext.contentResolver, Settings.Global.BOOT_COUNT) } catch (_: Exception) { -1 }

      for (index in 0 until packageNames.length()) {
        val packageName = packageNames.optString(index, "")
        if (packageName.isBlank()) continue
        val key = Clean4JesusAccessibilityService.temporaryUnlockKey(packageName)
        val unlockedUntil = prefs.getLong(key, 0L)
        val savedBoot = prefs.getInt(Clean4JesusAccessibilityService.temporaryUnlockBootKey(packageName), -1)
        if (savedBoot == bootCount && unlockedUntil > now) {
          unlocks.put(JSONObject().put("packageName", packageName).put("remainingMs", unlockedUntil - now))
        } else if (unlockedUntil > 0L) {
          prefs.edit().remove(key).remove(Clean4JesusAccessibilityService.temporaryUnlockBootKey(packageName)).apply()
        }
      }
      promise.resolve(unlocks.toString())
    } catch (error: Exception) {
      promise.reject("TEMPORARY_UNLOCKS_READ_FAILED", error)
    }
  }
}
