package com.clean4jesus.app

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build

object BankCompatibilityBridge {
  const val EXTRA_BANK_PACKAGE = "clean4jesus.bank_package"
  private const val RETURN_CHANNEL_ID = "clean4jesus-refuge-return"
  private const val RETURN_NOTIFICATION_ID = 4107
  private const val PREF_BANK_SESSION_PENDING = "bank_session_pending"
  private const val PREF_BANK_PACKAGE = "bank_session_package"
  private const val PREF_BANK_BRIDGE_DEPARTED = "bank_bridge_departed"

  /**
   * Accessibility can emit several window events while a financial app opens. Only the
   * first one may create the bridge activity; duplicate launches make the return flow
   * unpredictable and can bring Clean4Jesus to the foreground over the bank.
   */
  fun beginBankSession(context: Context, packageName: String): Boolean {
    val preferences = context.getSharedPreferences(
      Clean4JesusAccessibilityService.PREFS_NAME,
      Context.MODE_PRIVATE,
    )
    if (preferences.getBoolean(PREF_BANK_SESSION_PENDING, false)) return false

    preferences
      .edit()
      .putBoolean(PREF_BANK_SESSION_PENDING, true)
      .putBoolean(PREF_BANK_BRIDGE_DEPARTED, false)
      .putString(PREF_BANK_PACKAGE, packageName)
      .apply()

    showReturnReminder(context)

    context.startActivity(
      Intent(context, BankReturnActivity::class.java).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_NO_ANIMATION)
        putExtra(EXTRA_BANK_PACKAGE, packageName)
      }
    )
    return true
  }

  fun hasPendingReturn(context: Context): Boolean =
    context.getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)
      .getBoolean(PREF_BANK_SESSION_PENDING, false)

  fun markBankBridgeDeparted(context: Context) {
    context.getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putBoolean(PREF_BANK_BRIDGE_DEPARTED, true)
      .apply()
  }

  fun shouldShowPendingReturn(context: Context): Boolean {
    val preferences = context.getSharedPreferences(
      Clean4JesusAccessibilityService.PREFS_NAME,
      Context.MODE_PRIVATE,
    )
    return preferences.getBoolean(PREF_BANK_SESSION_PENDING, false) &&
      preferences.getBoolean(PREF_BANK_BRIDGE_DEPARTED, false)
  }

  fun pendingBankPackage(context: Context): String? =
    context.getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)
      .getString(PREF_BANK_PACKAGE, null)

  fun showPendingReturn(context: Context) {
    if (!shouldShowPendingReturn(context)) return
    context.startActivity(
      Intent(context, BankReturnActivity::class.java).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_NO_ANIMATION)
        putExtra(BankReturnActivity.EXTRA_RETURN_ONLY, true)
      }
    )
  }

  fun clearReturnPrompt(context: Context) {
    context.getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .remove(PREF_BANK_SESSION_PENDING)
      .remove(PREF_BANK_PACKAGE)
      .remove(PREF_BANK_BRIDGE_DEPARTED)
      .apply()
    context.getSystemService(NotificationManager::class.java).cancel(RETURN_NOTIFICATION_ID)
  }

  private fun showReturnReminder(context: Context) {
    if (
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
      context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
    ) return

    val manager = context.getSystemService(NotificationManager::class.java)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      manager.createNotificationChannel(
        NotificationChannel(
          RETURN_CHANNEL_ID,
          "Regreso al Refugio",
          NotificationManager.IMPORTANCE_DEFAULT,
        ).apply {
          description = "Guía para continuar en Clean4Jesus después de usar una app compatible."
          lockscreenVisibility = Notification.VISIBILITY_PRIVATE
        },
      )
    }

    val returnIntent = Intent(context, BankReturnActivity::class.java).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
      putExtra(BankReturnActivity.EXTRA_RETURN_ONLY, true)
    }
    val pendingIntent = PendingIntent.getActivity(
      context,
      RETURN_NOTIFICATION_ID,
      returnIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(context, RETURN_CHANNEL_ID)
    } else {
      @Suppress("DEPRECATION")
      Notification.Builder(context)
    }

    manager.notify(
      RETURN_NOTIFICATION_ID,
      builder
        .setSmallIcon(R.drawable.notification_icon)
        .setContentTitle("Todo listo por aquí")
        .setContentText("Toca para volver al Refugio y continuar.")
        .setContentIntent(pendingIntent)
        .setCategory(Notification.CATEGORY_REMINDER)
        .setVisibility(Notification.VISIBILITY_PRIVATE)
        .setOngoing(true)
        .setAutoCancel(false)
        .build(),
    )
  }
}
