package com.clean4jesus.app

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.provider.Settings
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import java.util.UUID

class Clean4JesusAccessibilityService : AccessibilityService() {
  private var lastInterruptionAt = 0L
  private var foregroundPackage: String? = null
  private var foregroundStartedAt = 0L
  private val mainHandler = Handler(Looper.getMainLooper())
  companion object {
    const val EXTRA_BLOCK_REASON = "clean4jesus.block_reason"
    const val EXTRA_BLOCKED_PACKAGE = "clean4jesus.blocked_package"
    const val EXTRA_BLOCK_FINGERPRINT = "clean4jesus.block_fingerprint"
    const val PREFS_NAME = "clean4jesus.accessibility"
    const val PREF_APP_RULES = "app_protection_rules_json"
    const val PREF_GUARDIAN_PIN = "guardian_pin"
    const val PREF_APP_LANGUAGE = "app_language"
    private const val PREF_APP_USAGE_PREFIX = "app_usage_"
    private const val MAX_TRACKED_EVENT_GAP_MS = 15_000L
    const val PREF_APP_UNLOCK_PREFIX = "app_unlock_"
    private const val PREF_FALSE_POSITIVE_PREFIX = "false_positive_"
    const val PREF_ACCOUNTABILITY_ENDPOINT = "accountability_endpoint"
    const val PREF_ACCOUNTABILITY_DEVICE_ID = "accountability_device_id"
    const val PREF_ACCOUNTABILITY_DEVICE_SECRET = "accountability_device_secret"
    const val PREF_ACCOUNTABILITY_PENDING_SIGNALS = "accountability_pending_signals"
    const val PREF_FALSE_POSITIVE_ENDPOINT = "false_positive_endpoint"
    const val PREF_FALSE_POSITIVE_API_KEY = "false_positive_api_key"
    const val PREF_FALSE_POSITIVE_INSTALL_ID = "false_positive_install_id"
    private const val MAX_PENDING_RISK_SIGNALS = 20
    private const val MAX_PENDING_RISK_AGE_MS = 24 * 60 * 60_000L
    private const val RISK_THRESHOLD = 3
    private const val RISK_WINDOW_MS = 30 * 60_000L
    private const val RISK_COOLDOWN_MS = 6 * 60 * 60_000L
    private var activeInstance: Clean4JesusAccessibilityService? = null

    fun pauseIfRunning(): Boolean {
      val service = activeInstance ?: return false
      service.disableSelf()
      return true
    }

    fun getUsageSnapshot(context: Context, packageName: String, now: Long = System.currentTimeMillis()): Long {
      val service = activeInstance
      if (service != null) {
        return service.getTodayUsage(packageName, now)
      }

      return context
        .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        .getLong(usageKey(packageName, now), 0L)
    }

    private fun usageKey(packageName: String, now: Long): String {
      val localDay = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date(now))
      return "$PREF_APP_USAGE_PREFIX$localDay.$packageName"
    }

    fun temporaryUnlockKey(packageName: String) = "$PREF_APP_UNLOCK_PREFIX$packageName"
    fun temporaryUnlockBootKey(packageName: String) = "${temporaryUnlockKey(packageName)}_boot"
    fun falsePositiveFingerprintKey(packageName: String) = "${PREF_FALSE_POSITIVE_PREFIX}${packageName}_fingerprint"
    fun falsePositiveUntilKey(packageName: String) = "${PREF_FALSE_POSITIVE_PREFIX}${packageName}_until"
    fun falsePositiveBootKey(packageName: String) = "${PREF_FALSE_POSITIVE_PREFIX}${packageName}_boot"

    fun scheduleTemporaryRelock(packageName: String, until: Long) {
      activeInstance?.scheduleRelock(packageName, until)
    }

    fun flushRiskSignalsIfRunning() {
      activeInstance?.flushRiskSignalsAsync()
    }
  }

  private val browserPackages = setOf(
    "com.android.chrome",
    "com.chrome.beta",
    "com.chrome.dev",
    "org.mozilla.firefox",
    "com.brave.browser",
    "com.microsoft.emmx",
    "com.opera.browser",
    "com.duckduckgo.mobile.android"
  )

  private val socialPackages = setOf(
    "org.telegram.messenger",
    "org.telegram.messenger.web",
    "com.zhiliaoapp.musically",
    "com.ss.android.ugc.trill",
    "com.instagram.android",
    "com.twitter.android",
    "com.x.android",
    "com.threads.android",
    "com.whatsapp",
    "com.whatsapp.w4b",
    "com.facebook.katana",
    "com.facebook.orca",
    "com.snapchat.android",
    "com.reddit.frontpage"
  )

  private val watchedPackages = browserPackages + socialPackages

  private val ignoredPackages = setOf(
    "com.google.android.youtube",
    "com.google.android.youtube.tv",
    "com.google.android.youtube.kids",
    "com.google.android.apps.youtube",
    "com.google.android.apps.youtube.music",
    "com.google.android.videos",
    "com.nu.production"
  )

  private val trustedPackagePrefixes = listOf(
    "com.google.android.youtube",
    "com.google.android.apps.youtube",
    "com.youtube",
    "com.nu",
    "com.nubank"
  )

  private val trustedFinancialPackagePrefixes = listOf(
    "br.com.inter",
    "br.com.itau",
    "br.com.bradesco",
    "br.com.santander",
    "com.bbva",
    "com.bancolombia",
    "co.com.bancolombia",
    "com.davivienda",
    "com.scotiabank",
    "com.c6bank",
    "com.mercadolibre.mercadopago",
    "com.paypal.android.p2pmobile"
  )

  private val trustedMediaKeywords = listOf(
    "youtube",
    "youtubekids",
    "youtube.tv",
    "youtube.music",
    "youtubemusic",
    "youtubei"
  )

  private val trustedFinancialKeywords = listOf(
    "nubank",
    "nu.production",
    "nu.bank",
    "nequi",
    "bancolombia",
    "davivienda",
    "bogota",
    "bbva",
    "itau",
    "scotiabank",
    "sudameris",
    "falabella",
    "popular",
    "occidente",
    "avvillas",
    "agrario",
    "bank",
    "banco",
    "wallet",
    "payments",
    "payment",
    "fintech"
  )

  private val highConfidenceDomainSignals = listOf(
    "pornhub",
    "xvideos",
    "xnxx",
    "xhamster",
    "redtube",
    "youporn",
    "spankbang",
    "erome",
    "beeg",
    "tube8",
    "eporner",
    "motherless",
    "brazzers",
    "cam4",
    "chaturbate",
    "stripchat",
    "manyvids",
    "onlyfans",
    "faphouse",
    "fapello",
    "porn.com",
    "pornoxo",
    "porntrex",
    "hclips",
    "xfree",
    "gotporn",
    "drtuber",
    "thisvid",
    "livejasmin",
    "myfreecams",
    "camwhores",
    "xnalgas"
  )

  private val explicitAdultTerms = listOf(
    "porn",
    "porno",
    "pornografia",
    "adult",
    "nude",
    "naked",
    "sex",
    "xxx"
  )

  private val browserContextSignals = listOf(
    "search",
    "results",
    "google",
    "bing",
    "duckduckgo",
    "chrome",
    "www",
    "http"
  )

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event == null) return
    val packageName = event.packageName?.toString() ?: return
    val now = System.currentTimeMillis()
    trackForegroundPackage(packageName, now)
    if (shouldIgnorePackage(packageName)) return
    if (!watchedPackages.contains(packageName)) return
    if (isTemporarilyUnlocked(packageName, now)) return
    if (now - lastInterruptionAt < 6000) return

    getAppProtectionBlockReason(packageName, now)?.let { reason ->
      lastInterruptionAt = now
      launchInterruption(reason, packageName)
      return
    }

    val visibleText = buildString {
      event.text?.forEach { append(it.toString()).append(' ') }
      event.beforeText?.let { append(it.toString()).append(' ') }
      append(collectText(rootInActiveWindow, 0))
      event.source?.text?.let { append(it.toString()).append(' ') }
      event.source?.contentDescription?.let { append(it.toString()).append(' ') }
    }.normalizeForSignals()

    val fingerprint = signalFingerprint(packageName, visibleText)
    if (isApprovedFalsePositive(packageName, fingerprint)) return

    val reason = getBlockReason(packageName, visibleText)
    if (reason != null) {
      lastInterruptionAt = now
      launchInterruption(reason, packageName, fingerprint)
    }
  }

  override fun onServiceConnected() {
    super.onServiceConnected()
    activeInstance = this
    restoreTemporaryRelocks()
    flushRiskSignalsAsync()
  }

  override fun onInterrupt() = Unit

  override fun onDestroy() {
    persistForegroundUsage(System.currentTimeMillis())
    if (activeInstance === this) {
      activeInstance = null
    }
    super.onDestroy()
  }

  private fun collectText(node: AccessibilityNodeInfo?, depth: Int): String {
    if (node == null || depth > 7) return ""

    val current = buildString {
      node.text?.let { append(it.toString()).append(' ') }
      node.contentDescription?.let { append(it.toString()).append(' ') }
      node.viewIdResourceName?.let { append(it).append(' ') }
    }

    val children = StringBuilder()
    for (index in 0 until node.childCount) {
      children.append(collectText(node.getChild(index), depth + 1))
    }

    return current + children.toString()
  }

  private fun launchInterruption(reason: String, packageName: String, fingerprint: String? = null) {
    persistForegroundUsage(System.currentTimeMillis())
    sendRiskSignal()
    closeBlockedAppBestEffort()

    val intent = Intent(this, InterruptionActivity::class.java).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
      addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
      addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
      addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION)
      putExtra(EXTRA_BLOCK_REASON, reason)
      putExtra(EXTRA_BLOCKED_PACKAGE, packageName)
      fingerprint?.let { putExtra(EXTRA_BLOCK_FINGERPRINT, it) }
    }

    mainHandler.postDelayed({
      startActivity(intent)
    }, 460L)
  }

  private fun String.normalizeForSignals(): String {
    return lowercase()
      .replace(Regex("""[\p{Punct}\p{IsWhiteSpace}]+"""), " ")
      .replace(Regex("""\s+"""), " ")
      .trim()
  }

  private fun getBlockReason(packageName: String, text: String): String? {
    if (shouldIgnorePackage(packageName)) return null
    val language = currentLanguage()

    highConfidenceDomainSignals.firstOrNull { text.containsSignal(it) }?.let { signal ->
      return localizedReason(language, "domain", signal)
    }

    val browserLike = browserContextSignals.any { text.containsSignal(it) }
    val explicitTerm = explicitAdultTerms.firstOrNull { text.containsWholeSignal(it) }
    val sensitiveText = explicitTerm != null && (browserLike || text.containsSignal("video") || text.containsSignal("watch") || text.containsSignal("search"))
    val socialContext = socialPackages.contains(packageName) && (text.containsSignal("video") || text.containsSignal("post") || text.containsSignal("story") || text.containsSignal("reel") || text.containsSignal("shorts"))

    return when {
      browserPackages.contains(packageName) && sensitiveText ->
        localizedReason(language, "search", explicitTerm.orEmpty())
      socialPackages.contains(packageName) && explicitTerm != null && socialContext ->
        localizedReason(language, "social", explicitTerm)
      socialPackages.contains(packageName) && highConfidenceDomainSignals.any { text.containsSignal(it) } ->
        localizedReason(language, "known", "")
      else -> {
        if (explicitTerm != null && browserLike) {
          localizedReason(language, "search", explicitTerm)
        } else if (explicitTerm != null && socialContext) {
          localizedReason(language, "social", explicitTerm)
        } else {
          null
        }
      }
    }
  }

  private fun shouldIgnorePackage(packageName: String): Boolean {
    return isTrustedPackage(packageName)
  }

  private fun isTrustedPackage(packageName: String): Boolean {
    val normalized = packageName.lowercase()
    if (ignoredPackages.contains(packageName)) return true
    if (trustedPackagePrefixes.any { normalized.startsWith(it) }) return true
    if (trustedFinancialPackagePrefixes.any { normalized.startsWith(it) }) return true
    return trustedMediaKeywords.any { normalized.contains(it) } ||
      trustedFinancialKeywords.any { normalized.contains(it) }
  }

  private fun String.containsSignal(signal: String): Boolean {
    return contains(signal.normalizeForSignals())
  }

  private fun String.containsWholeSignal(signal: String): Boolean {
    val expected = signal.normalizeForSignals().split(" ").filter { it.isNotBlank() }
    if (expected.isEmpty()) return false
    val actual = split(" ").filter { it.isNotBlank() }
    if (expected.size > actual.size) return false
    return actual.windowed(expected.size).any { it == expected }
  }

  private fun signalFingerprint(packageName: String, text: String): String {
    return MessageDigest
      .getInstance("SHA-256")
      .digest("$packageName|$text".toByteArray())
      .joinToString("") { byte -> "%02x".format(byte.toInt() and 0xff) }
  }

  private fun isApprovedFalsePositive(packageName: String, fingerprint: String): Boolean {
    val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val savedFingerprint = prefs.getString(falsePositiveFingerprintKey(packageName), null)
    val until = prefs.getLong(falsePositiveUntilKey(packageName), 0L)
    val savedBoot = prefs.getInt(falsePositiveBootKey(packageName), -1)
    val valid = savedFingerprint == fingerprint &&
      savedBoot == currentBootCount() &&
      until > SystemClock.elapsedRealtime()
    if (!valid && savedFingerprint != null) {
      prefs.edit()
        .remove(falsePositiveFingerprintKey(packageName))
        .remove(falsePositiveUntilKey(packageName))
        .remove(falsePositiveBootKey(packageName))
        .apply()
    }
    return valid
  }

  private fun closeBlockedAppBestEffort() {
    val actions = listOf(
      GLOBAL_ACTION_BACK,
      GLOBAL_ACTION_BACK,
      GLOBAL_ACTION_HOME,
      GLOBAL_ACTION_HOME
    )

    actions.forEachIndexed { index, action ->
      mainHandler.postDelayed({
        performGlobalAction(action)
      }, index * 110L)
    }
  }

  private data class AppProtectionRule(
    val dailyLimitMinutes: Int?,
    val mode: String,
    val packageName: String
  )

  private fun getAppProtectionBlockReason(packageName: String, now: Long): String? {
    val rule = readAppProtectionRules().firstOrNull { it.packageName == packageName } ?: return null
    if (isTemporarilyUnlocked(packageName, now)) return null
    val displayName = packageName.toDisplayName()

    val language = currentLanguage()
    return when (rule.mode) {
      "blocked" -> when (language) {
        "en" -> "We blocked $displayName because you marked it as vulnerable for this time."
        "fr" -> "Nous avons bloqué $displayName car vous l'avez marquée comme vulnérable pour cette période."
        "pt" -> "Bloqueamos $displayName porque você o marcou como vulnerável neste período."
        else -> "Bloqueamos $displayName porque lo marcaste como una app vulnerable para este tiempo."
      }
      "limited" -> {
        val limitMinutes = rule.dailyLimitMinutes ?: 15
        val usedToday = getTodayUsage(packageName, now)
        if (usedToday >= limitMinutes * 60_000L) {
          when (language) {
            "en" -> "We blocked $displayName because you reached today's $limitMinutes-minute limit."
            "fr" -> "Nous avons bloqué $displayName car vous avez atteint la limite de $limitMinutes minutes aujourd'hui."
            "pt" -> "Bloqueamos $displayName porque você atingiu o limite de $limitMinutes minutos de hoje."
            else -> "Bloqueamos $displayName porque ya cumpliste tu límite de $limitMinutes minutos por hoy."
          }
        } else {
          null
        }
      }
      else -> null
    }
  }

  private fun currentLanguage(): String =
    getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).getString(PREF_APP_LANGUAGE, "es") ?: "es"

  private fun localizedReason(language: String, kind: String, signal: String): String = when (language) {
    "en" -> when (kind) {
      "search" -> "We blocked the search \"$signal\" after detecting a sensitive browser query."
      "social" -> "We blocked \"$signal\" because this content is not good for you in this app."
      "known" -> "We blocked a known source of adult content."
      else -> "We blocked \"$signal\" because it points to content that is not good for you."
    }
    "fr" -> when (kind) {
      "search" -> "Nous avons bloqué la recherche « $signal » après avoir détecté une requête sensible."
      "social" -> "Nous avons bloqué « $signal » car ce contenu ne vous convient pas dans cette app."
      "known" -> "Nous avons bloqué une source connue de contenu pour adultes."
      else -> "Nous avons bloqué « $signal » car il mène vers un contenu qui ne vous convient pas."
    }
    "pt" -> when (kind) {
      "search" -> "Bloqueamos a busca \"$signal\" após detectar uma pesquisa sensível no navegador."
      "social" -> "Bloqueamos \"$signal\" porque esse conteúdo não faz bem para você neste app."
      "known" -> "Bloqueamos uma fonte conhecida de conteúdo adulto."
      else -> "Bloqueamos \"$signal\" porque aponta para um conteúdo que não faz bem para você."
    }
    else -> when (kind) {
      "search" -> "Bloqueamos la búsqueda \"$signal\" porque detectamos una consulta sensible en el navegador."
      "social" -> "Bloqueamos \"$signal\" porque este contenido no te conviene en esta app."
      "known" -> "Bloqueamos una fuente conocida de contenido adulto."
      else -> "Bloqueamos \"$signal\" porque apunta a contenido que no te conviene."
    }
  }

  private fun readAppProtectionRules(): List<AppProtectionRule> {
    val raw = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).getString(PREF_APP_RULES, "[]") ?: "[]"

    return try {
      val json = JSONArray(raw)
      val rules = mutableListOf<AppProtectionRule>()
      for (index in 0 until json.length()) {
        val item = json.optJSONObject(index) ?: continue
        val enabled = item.optBoolean("enabled", false)
        val packageName = item.optString("packageName", "")
        val mode = item.optString("mode", "")
        if (!enabled || packageName.isBlank() || !watchedPackages.contains(packageName) || shouldIgnorePackage(packageName)) continue
        rules.add(
          AppProtectionRule(
            dailyLimitMinutes = if (item.has("dailyLimitMinutes")) item.optInt("dailyLimitMinutes", 15) else null,
            mode = mode,
            packageName = packageName
          )
        )
      }
      rules
    } catch (_: Exception) {
      emptyList()
    }
  }

  private fun trackForegroundPackage(packageName: String, now: Long) {
    if (foregroundPackage == packageName) {
      persistForegroundUsage(now)
      return
    }
    persistForegroundUsage(now)

    if (watchedPackages.contains(packageName) && !shouldIgnorePackage(packageName)) {
      foregroundPackage = packageName
      foregroundStartedAt = now
      return
    }

    foregroundPackage = null
    foregroundStartedAt = 0L
  }

  private fun persistForegroundUsage(now: Long) {
    val packageName = foregroundPackage ?: return
    if (foregroundStartedAt <= 0L) return
    val elapsed = now - foregroundStartedAt
    if (elapsed <= 0L) {
      foregroundStartedAt = now
      return
    }

    val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val key = usageKey(packageName, now)
    val current = prefs.getLong(key, 0L)
    prefs.edit().putLong(key, current + elapsed.coerceAtMost(MAX_TRACKED_EVENT_GAP_MS)).apply()
    foregroundStartedAt = now
  }

  private fun getTodayUsage(packageName: String, now: Long): Long {
    val stored = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).getLong(usageKey(packageName, now), 0L)
    val live = if (foregroundPackage == packageName && foregroundStartedAt > 0L) {
      (now - foregroundStartedAt).coerceIn(0L, MAX_TRACKED_EVENT_GAP_MS)
    } else {
      0L
    }
    return stored + live.coerceAtLeast(0L)
  }

  private fun isTemporarilyUnlocked(packageName: String, now: Long): Boolean {
    val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val key = temporaryUnlockKey(packageName)
    val elapsedNow = SystemClock.elapsedRealtime()
    val until = prefs.getLong(key, 0L)
    val savedBoot = prefs.getInt(temporaryUnlockBootKey(packageName), -1)
    if (savedBoot != currentBootCount() || until <= elapsedNow) {
      prefs.edit().remove(key).remove(temporaryUnlockBootKey(packageName)).apply()
      return false
    }
    return until > elapsedNow
  }

  private fun restoreTemporaryRelocks() {
    val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val now = SystemClock.elapsedRealtime()
    val boot = currentBootCount()
    prefs.all.forEach { (key, value) ->
      if (!key.startsWith(PREF_APP_UNLOCK_PREFIX) || key.endsWith("_boot") || value !is Long) return@forEach
      val packageName = key.removePrefix(PREF_APP_UNLOCK_PREFIX)
      val savedBoot = prefs.getInt(temporaryUnlockBootKey(packageName), -1)
      if (savedBoot == boot && value > now) scheduleRelock(packageName, value)
      else prefs.edit().remove(key).remove(temporaryUnlockBootKey(packageName)).apply()
    }
  }

  private fun scheduleRelock(packageName: String, until: Long) {
    val delay = (until - SystemClock.elapsedRealtime()).coerceAtLeast(0L)
    mainHandler.postDelayed({
      val now = SystemClock.elapsedRealtime()
      val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      val savedUntil = prefs.getLong(temporaryUnlockKey(packageName), 0L)
      if (savedUntil > now) {
        scheduleRelock(packageName, savedUntil)
        return@postDelayed
      }
      prefs.edit().remove(temporaryUnlockKey(packageName)).remove(temporaryUnlockBootKey(packageName)).apply()
      val activePackage = rootInActiveWindow?.packageName?.toString()
      if (activePackage == packageName) {
        launchInterruption("El permiso temporal de 15 minutos termino. Volvemos a cuidar este espacio.", packageName)
      }
    }, delay)
  }

  private fun currentBootCount(): Int = try {
    Settings.Global.getInt(contentResolver, Settings.Global.BOOT_COUNT)
  } catch (_: Exception) {
    -1
  }

  private fun sendRiskSignal() {
    val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    if (prefs.getString(PREF_ACCOUNTABILITY_ENDPOINT, null) == null) return
    if (prefs.getString(PREF_ACCOUNTABILITY_DEVICE_ID, null) == null) return
    if (prefs.getString(PREF_ACCOUNTABILITY_DEVICE_SECRET, null) == null) return
    val eventId = UUID.randomUUID().toString()
    enqueueRiskSignal(eventId)
    flushRiskSignalsAsync()
  }

  @Synchronized
  private fun enqueueRiskSignal(eventId: String) {
    val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val now = System.currentTimeMillis()
    val pending = readPendingRiskSignals(prefs)
      .filter { now - it.optLong("createdAt", now) <= MAX_PENDING_RISK_AGE_MS }
      .takeLast(MAX_PENDING_RISK_SIGNALS - 1)
      .toMutableList()
    pending.add(JSONObject().put("idempotencyKey", eventId).put("createdAt", now))
    writePendingRiskSignals(prefs, pending)
  }

  private fun flushRiskSignalsAsync() {
    Thread { flushPendingRiskSignals() }.start()
  }

  @Synchronized
  private fun flushPendingRiskSignals() {
    val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val endpoint = prefs.getString(PREF_ACCOUNTABILITY_ENDPOINT, null) ?: return
    val deviceId = prefs.getString(PREF_ACCOUNTABILITY_DEVICE_ID, null) ?: return
    val secret = prefs.getString(PREF_ACCOUNTABILITY_DEVICE_SECRET, null) ?: return
    val now = System.currentTimeMillis()
    val pending = readPendingRiskSignals(prefs)
      .filter { now - it.optLong("createdAt", now) <= MAX_PENDING_RISK_AGE_MS }
      .toMutableList()

    while (pending.isNotEmpty()) {
      val event = pending.first()
      val riskPayload = JSONObject()
        .put("deviceId", deviceId)
        .put("secret", secret)
        .put("idempotencyKey", event.optString("idempotencyKey"))

      try {
        val connection = URL(endpoint).openConnection() as HttpURLConnection
        connection.requestMethod = "POST"
        connection.connectTimeout = 5_000
        connection.readTimeout = 5_000
        connection.doOutput = true
        connection.setRequestProperty("Content-Type", "application/json")
        connection.outputStream.use { it.write(riskPayload.toString().toByteArray(Charsets.UTF_8)) }
        val responseCode = connection.responseCode
        connection.disconnect()
        if (responseCode !in 200..299) break
        pending.removeAt(0)
        writePendingRiskSignals(prefs, pending)
      } catch (_: Exception) {
        break
      }
    }
  }

  private fun readPendingRiskSignals(prefs: android.content.SharedPreferences): List<JSONObject> {
    return try {
      val raw = prefs.getString(PREF_ACCOUNTABILITY_PENDING_SIGNALS, "[]") ?: "[]"
      val json = JSONArray(raw)
      buildList {
        for (index in 0 until json.length()) json.optJSONObject(index)?.let(::add)
      }
    } catch (_: Exception) {
      emptyList()
    }
  }

  private fun writePendingRiskSignals(prefs: android.content.SharedPreferences, pending: List<JSONObject>) {
    val json = JSONArray()
    pending.forEach(json::put)
    prefs.edit().putString(PREF_ACCOUNTABILITY_PENDING_SIGNALS, json.toString()).commit()
  }

  private fun String.toDisplayName(): String {
    return when (this) {
      "com.twitter.android", "com.x.android" -> "X / Twitter"
      "com.zhiliaoapp.musically", "com.ss.android.ugc.trill" -> "TikTok"
      "com.instagram.android" -> "Instagram"
      "com.reddit.frontpage" -> "Reddit"
      "org.telegram.messenger", "org.telegram.messenger.web" -> "Telegram"
      "com.facebook.katana" -> "Facebook"
      "com.android.chrome" -> "Chrome"
      "com.brave.browser" -> "Brave"
      "org.mozilla.firefox" -> "Firefox"
      "com.microsoft.emmx" -> "Edge"
      else -> "esta app"
    }
  }
}
