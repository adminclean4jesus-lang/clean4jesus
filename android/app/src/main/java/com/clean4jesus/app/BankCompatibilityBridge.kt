package com.clean4jesus.app

import android.content.Context
import android.content.Intent

object BankCompatibilityBridge {
  const val EXTRA_BANK_PACKAGE = "clean4jesus.bank_package"
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
  }
}
