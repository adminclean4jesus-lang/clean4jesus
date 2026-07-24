package com.clean4jesus.app

import android.app.Activity
import android.animation.ValueAnimator
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.provider.Settings
import android.text.InputFilter
import android.text.InputType
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import java.util.Locale
import java.util.UUID
import org.json.JSONObject

class InterruptionActivity : Activity() {
  private val rescueHandler = Handler(Looper.getMainLooper())
  private var rescueAnimator: ValueAnimator? = null
  private var isRescueScreen = false

  companion object {
    const val PREF_CUSTOM_MESSAGE = "interruption_custom_message"
    const val PREF_CUSTOM_REFERENCE = "interruption_custom_reference"
    const val PREF_CUSTOM_IMAGE_PATH = "interruption_custom_image_path"
    const val PREF_PIN_FAILED_ATTEMPTS = "guardian_pin_failed_attempts"
    const val PREF_PIN_LOCKED_UNTIL = "guardian_pin_locked_until"
    const val PREF_PIN_LOCKED_BOOT_COUNT = "guardian_pin_locked_boot_count"
    private const val TEMPORARY_UNLOCK_DURATION_MS = 15 * 60_000L
    private const val FALSE_POSITIVE_APPROVAL_DURATION_MS = 20_000L

    private val translations = mapOf(
      "en" to mapOf(
        "status" to "Interruption active", "title" to "Your refuge is active", "subtitle" to "We blocked this step after detecting a sensitive signal. Breathe, return to your refuge, and continue in peace.", "defaultMessage" to "I can do everything through Christ, who gives me strength.", "defaultReference" to "Philippians 4:13", "reasonTitle" to "Why did we block this?", "genericReason" to "We detected a sensitive signal and moved you away from that environment to protect you.", "falsePositive" to "Was this a mistake?", "guardianHelp" to "I need my guardian's help", "falsePositiveHint" to "Use this only when the block was caused by an incorrect match.", "guardianHint" to "Use this only when a trusted person decides to open this app briefly.", "openPin" to "Open with PIN", "unlockTitle" to "Guardian verification", "falsePositiveDescription" to "If this was a mistake, your guardian can confirm the PIN. Clean4Jesus will allow only this incident and the refuge will remain active.", "guardianDescription" to "A trusted person can use the PIN to open this app for 15 minutes.", "confirm" to "Confirm PIN and continue", "unlock15" to "Unlock for 15 min", "cancel" to "Cancel", "privacy" to "Clean4Jesus analyzes visible text from protected apps on your device to detect signals. It does not send this content or your history.", "returnApp" to "Return to Clean4Jesus", "returnHome" to "Return to phone home", "close" to "Close", "unknownApp" to "We could not identify the blocked app.", "wrongPin" to "Incorrect PIN.", "pinLockout" to "Wait {seconds} seconds before trying again.", "falsePositiveApproved" to "Only this incident was allowed. Refuge remains active.", "temporaryUnlock" to "This app is available for 15 minutes.", "openFailed" to "We could not open that app automatically."
      ),
      "fr" to mapOf(
        "status" to "Interruption active", "title" to "Votre refuge est actif", "subtitle" to "Nous avons bloqué cette étape après avoir détecté un signal sensible. Respirez, revenez à votre refuge et continuez en paix.", "defaultMessage" to "Je peux tout par Christ qui me fortifie.", "defaultReference" to "Philippiens 4:13", "reasonTitle" to "Pourquoi avons-nous bloqué cela ?", "genericReason" to "Nous avons détecté un signal sensible et vous avons éloigné de cet environnement pour vous protéger.", "falsePositive" to "Était-ce une erreur ?", "guardianHelp" to "J'ai besoin de l'aide de mon gardien", "falsePositiveHint" to "Utilisez ceci uniquement si le blocage vient d'une correspondance incorrecte.", "guardianHint" to "Utilisez ceci uniquement si une personne de confiance décide d'ouvrir brièvement cette app.", "openPin" to "Ouvrir avec le PIN", "unlockTitle" to "Vérification du gardien", "falsePositiveDescription" to "Si ce blocage était une erreur, votre gardien peut confirmer le PIN. Clean4Jesus autorisera uniquement cet incident et le refuge restera actif.", "guardianDescription" to "Une personne de confiance peut utiliser le PIN pour ouvrir cette app pendant 15 minutes.", "confirm" to "Confirmer le PIN et continuer", "unlock15" to "Débloquer 15 min", "cancel" to "Annuler", "privacy" to "Clean4Jesus analyse sur votre appareil le texte visible des apps protégées. Ce contenu et votre historique ne sont pas envoyés.", "returnApp" to "Revenir à Clean4Jesus", "returnHome" to "Revenir à l'accueil du téléphone", "close" to "Fermer", "unknownApp" to "Impossible d'identifier l'app bloquée.", "wrongPin" to "PIN incorrect.", "pinLockout" to "Attendez {seconds} secondes avant de réessayer.", "falsePositiveApproved" to "Seul cet incident a été autorisé. Le refuge reste actif.", "temporaryUnlock" to "Cette app est disponible pendant 15 minutes.", "openFailed" to "Impossible d'ouvrir cette app automatiquement."
      ),
      "pt" to mapOf(
        "status" to "Interrupção ativa", "title" to "Seu refúgio está ativo", "subtitle" to "Bloqueamos este passo após detectar um sinal sensível. Respire, volte ao seu refúgio e siga em paz.", "defaultMessage" to "Tudo posso naquele que me fortalece.", "defaultReference" to "Filipenses 4:13", "reasonTitle" to "Por que bloqueamos isso?", "genericReason" to "Detectamos um sinal sensível e tiramos você desse ambiente para protegê-lo.", "falsePositive" to "Foi um erro?", "guardianHelp" to "Preciso da ajuda do meu guardião", "falsePositiveHint" to "Use isto somente se o bloqueio foi causado por uma correspondência incorreta.", "guardianHint" to "Use isto somente se uma pessoa de confiança decidir abrir este app por um momento.", "openPin" to "Abrir com PIN", "unlockTitle" to "Verificação do guardião", "falsePositiveDescription" to "Se este bloqueio foi um erro, seu guardião pode confirmar o PIN. O Clean4Jesus permitirá somente este incidente e o refúgio continuará ativo.", "guardianDescription" to "Uma pessoa de confiança pode usar o PIN para abrir este app por 15 minutos.", "confirm" to "Confirmar PIN e continuar", "unlock15" to "Desbloquear por 15 min", "cancel" to "Cancelar", "privacy" to "O Clean4Jesus analisa no seu dispositivo o texto visível dos apps protegidos. Ele não envia esse conteúdo nem seu histórico.", "returnApp" to "Voltar ao Clean4Jesus", "returnHome" to "Voltar à tela inicial", "close" to "Fechar", "unknownApp" to "Não foi possível identificar o app bloqueado.", "wrongPin" to "PIN incorreto.", "pinLockout" to "Aguarde {seconds} segundos antes de tentar novamente.", "falsePositiveApproved" to "Somente este incidente foi permitido. O refúgio continua ativo.", "temporaryUnlock" to "Este app ficará disponível por 15 minutos.", "openFailed" to "Não foi possível abrir esse app automaticamente."
      )
    )

    fun verifyGuardianPin(context: Context, pin: String): Boolean {
      val saved = context.getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)
        .getString(Clean4JesusAccessibilityService.PREF_GUARDIAN_PIN, null)
      return saved != null && saved == hashPin(pin)
    }

    fun remainingPinLockoutMs(context: Context): Long {
      val prefs = context.getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)
      val until = prefs.getLong(PREF_PIN_LOCKED_UNTIL, 0L)
      val lockedBootCount = prefs.getInt(PREF_PIN_LOCKED_BOOT_COUNT, -1)
      if (until <= 0L) return 0L
      if (lockedBootCount != -1 && lockedBootCount != currentBootCount(context)) {
        clearFailedPinAttempts(context)
        return 0L
      }
      return (until - SystemClock.elapsedRealtime()).coerceAtLeast(0L)
    }

    fun recordFailedPinAttempt(context: Context) {
      val prefs = context.getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)
      val attempts = prefs.getInt(PREF_PIN_FAILED_ATTEMPTS, 0) + 1
      val lockout = if (attempts >= 5) SystemClock.elapsedRealtime() + 30_000L else 0L
      val bootCount = currentBootCount(context)
      prefs.edit()
        .putInt(PREF_PIN_FAILED_ATTEMPTS, if (lockout > 0L) 0 else attempts)
        .putLong(PREF_PIN_LOCKED_UNTIL, lockout)
        .putInt(PREF_PIN_LOCKED_BOOT_COUNT, if (lockout > 0L) bootCount else -1)
        .apply()
    }

    fun clearFailedPinAttempts(context: Context) {
      context.getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)
        .edit()
        .remove(PREF_PIN_FAILED_ATTEMPTS)
        .remove(PREF_PIN_LOCKED_UNTIL)
        .remove(PREF_PIN_LOCKED_BOOT_COUNT)
        .apply()
    }

    private fun hashPin(pin: String): String {
      return MessageDigest
        .getInstance("SHA-256")
        .digest(pin.toByteArray())
        .joinToString("") { byte -> "%02x".format(byte.toInt() and 0xff) }
    }

    private fun currentBootCount(context: Context): Int {
      return try {
        Settings.Global.getInt(context.contentResolver, Settings.Global.BOOT_COUNT)
      } catch (_: Exception) {
        -1
      }
    }

    private fun localized(language: String, key: String, fallback: String): String =
      translations[language]?.get(key) ?: fallback

    private fun rescueCopy(language: String, key: String): String {
      val copy = mapOf(
        "es" to mapOf(
        "action" to "Respirar 60 segundos",
        "rescueIntro" to "Una pausa guiada para volver a elegir con claridad.",
          "title" to "Pausa antes de decidir",
          "subtitle" to "Esto no desbloquea la app. Toma un minuto para respirar y volver a lo que importa.",
          "inhale" to "Inhala",
          "hold" to "Sostén",
          "exhale" to "Exhala",
          "done" to "El minuto terminó",
          "doneSubtitle" to "El refugio sigue activo. Elige tu siguiente paso con la mente clara.",
          "back" to "Volver a la pantalla de bloqueo"
        ),
        "en" to mapOf(
        "action" to "Breathe for 60 seconds",
        "rescueIntro" to "A guided pause to help you choose your next step clearly.",
          "title" to "Pause before you decide",
          "subtitle" to "This will not unlock the app. Take one minute to breathe and return to what matters.",
          "inhale" to "Inhale",
          "hold" to "Hold",
          "exhale" to "Exhale",
          "done" to "The minute is complete",
          "doneSubtitle" to "The refuge is still active. Choose your next step with a clear mind.",
          "back" to "Back to the block screen"
        ),
        "fr" to mapOf(
        "action" to "Respirer 60 secondes",
        "rescueIntro" to "Une pause guidée pour choisir la suite avec clarté.",
          "title" to "Faites une pause avant de decider",
          "subtitle" to "Cette pause ne debloque pas l'application. Respirez une minute et revenez a l'essentiel.",
          "inhale" to "Inspirez",
          "hold" to "Retenez",
          "exhale" to "Expirez",
          "done" to "La minute est terminee",
          "doneSubtitle" to "Le refuge est toujours actif. Choisissez la suite avec un esprit clair.",
          "back" to "Retour a l'ecran de blocage"
        ),
        "pt" to mapOf(
        "action" to "Respirar por 60 segundos",
        "rescueIntro" to "Uma pausa guiada para escolher o próximo passo com clareza.",
          "title" to "Pare antes de decidir",
          "subtitle" to "Isso nao desbloqueia o app. Respire por um minuto e volte ao que importa.",
          "inhale" to "Inspire",
          "hold" to "Segure",
          "exhale" to "Expire",
          "done" to "O minuto terminou",
          "doneSubtitle" to "O refugio continua ativo. Escolha o proximo passo com a mente clara.",
          "back" to "Voltar para a tela de bloqueio"
        )
      )
      return copy[language]?.get(key) ?: copy["es"]!!.getValue(key)
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)
    window.statusBarColor = Color.WHITE
    window.navigationBarColor = Color.WHITE
    renderInterruption(intent)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    renderInterruption(intent)
  }

  override fun onBackPressed() {
    if (isRescueScreen) {
      rescueAnimator?.cancel()
      rescueHandler.removeCallbacksAndMessages(null)
      renderInterruption(intent)
      return
    }
    super.onBackPressed()
  }

  override fun onDestroy() {
    rescueAnimator?.cancel()
    rescueHandler.removeCallbacksAndMessages(null)
    super.onDestroy()
  }

  private fun renderInterruption(sourceIntent: Intent) {
    isRescueScreen = false
    rescueAnimator?.cancel()
    rescueHandler.removeCallbacksAndMessages(null)
    val bg = Color.parseColor("#F8F9FA")
    val surface = Color.WHITE
    val surfaceAlt = Color.parseColor("#EEF2FF")
    val indigo = Color.parseColor("#1A237E")
    val indigoSoft = Color.parseColor("#E8EAF6")
    val gold = Color.parseColor("#F9A825")
    val goldSoft = Color.parseColor("#FFF8E1")
    val slate = Color.parseColor("#334155")
    val muted = Color.parseColor("#64748B")
    val border = Color.parseColor("#D7DCE5")
    val blockedPackage = sourceIntent.getStringExtra(Clean4JesusAccessibilityService.EXTRA_BLOCKED_PACKAGE)
    val blockFingerprint = sourceIntent.getStringExtra(Clean4JesusAccessibilityService.EXTRA_BLOCK_FINGERPRINT)
    val preferences = getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, MODE_PRIVATE)
    val language = preferences.getString(Clean4JesusAccessibilityService.PREF_APP_LANGUAGE, "es") ?: "es"
    val customMessage = preferences.getString(PREF_CUSTOM_MESSAGE, null)?.takeIf { it.isNotBlank() }
      ?: localized(language, "defaultMessage", "Todo lo puedo en Cristo que me fortalece.")
    val customReference = preferences.getString(PREF_CUSTOM_REFERENCE, null)?.takeIf { it.isNotBlank() }
      ?: localized(language, "defaultReference", "Filipenses 4:13")
    val customImagePath = preferences.getString(PREF_CUSTOM_IMAGE_PATH, null)

    val root = ScrollView(this).apply {
      setBackgroundColor(bg)
      isFillViewport = true
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    }

    val content = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(dp(24), statusBarInset() + dp(16), dp(24), dp(32))
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      )
    }

    val brand = TextView(this).apply {
      text = "Clean4Jesus"
      setTextColor(indigo)
      textSize = 15f
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
      gravity = Gravity.CENTER_HORIZONTAL
    }

    val statusChip = chip(localized(language, "status", "Interrupción activa"), indigo, indigoSoft, border)

    val title = TextView(this).apply {
      text = localized(language, "title", "Tu refugio se activó")
      setTextColor(slate)
      textSize = 24f
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
      gravity = Gravity.CENTER_HORIZONTAL
      setLineSpacing(0f, 1.06f)
      setPadding(0, dp(12), 0, dp(8))
    }

    val subtitle = TextView(this).apply {
      text = localized(language, "subtitle", "Bloqueamos este paso porque detectamos una señal sensible. Respira, vuelve a tu refugio y sigue en paz.")
      setTextColor(muted)
      textSize = 15f
      gravity = Gravity.CENTER_HORIZONTAL
      setLineSpacing(0f, 1.18f)
      setPadding(dp(8), 0, dp(8), dp(16))
    }

    val heroCard = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL
      setPadding(dp(20), dp(20), dp(20), dp(20))
      background = roundedSurface(surface, border, dp(24))
      layoutParams = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      ).apply {
        topMargin = dp(8)
      }
    }

    val iconWrap = LinearLayout(this).apply {
      gravity = Gravity.CENTER
      background = roundedSurface(goldSoft, border, dp(22))
      layoutParams = LinearLayout.LayoutParams(dp(84), dp(84)).apply {
        bottomMargin = dp(16)
      }
    }

    val appIcon = ImageView(this).apply {
      setImageResource(R.drawable.ic_launcher_foreground)
      scaleType = ImageView.ScaleType.FIT_CENTER
      layoutParams = LinearLayout.LayoutParams(dp(52), dp(52))
    }
    iconWrap.addView(appIcon)

    val verse = TextView(this).apply {
      text = customMessage
      setTextColor(indigo)
      textSize = 22f
      gravity = Gravity.CENTER_HORIZONTAL
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
      setLineSpacing(0f, 1.1f)
    }

    val reference = TextView(this).apply {
      text = customReference
      setTextColor(gold)
      textSize = 15f
      gravity = Gravity.CENTER_HORIZONTAL
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
      setPadding(0, dp(10), 0, 0)
    }

    val reasonCard = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(dp(18), dp(18), dp(18), dp(18))
      background = roundedSurface(surfaceAlt, border, dp(20))
      layoutParams = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      ).apply {
        topMargin = dp(16)
      }
    }

    val reasonTitle = TextView(this).apply {
      text = localized(language, "reasonTitle", "¿Por qué lo bloqueamos?")
      setTextColor(indigo)
      textSize = 14f
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
    }

    val reason = TextView(this).apply {
      text = sourceIntent.getStringExtra(Clean4JesusAccessibilityService.EXTRA_BLOCK_REASON)
        ?: localized(language, "genericReason", "Detectamos una señal sensible y te sacamos de ese entorno para cuidarte.")
      setTextColor(slate)
      textSize = 16f
      setLineSpacing(0f, 1.18f)
      setPadding(0, dp(8), 0, 0)
    }
    reasonCard.addView(reasonTitle)
    reasonCard.addView(reason)

    val rescueActionCard = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(dp(18), dp(18), dp(18), dp(18))
      background = roundedSurface(goldSoft, gold, dp(22))
      layoutParams = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      ).apply {
        topMargin = dp(16)
      }
    }

    val rescueLabel = TextView(this).apply {
      text = "60 s"
      setTextColor(indigo)
      textSize = 13f
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
    }

    val rescueTitle = TextView(this).apply {
      text = rescueCopy(language, "title")
      setTextColor(indigo)
      textSize = 18f
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
      setPadding(0, dp(6), 0, dp(4))
    }

    val rescueHint = TextView(this).apply {
      text = rescueCopy(language, "rescueIntro")
      setTextColor(muted)
      textSize = 14f
      setLineSpacing(0f, 1.14f)
      setPadding(0, 0, 0, dp(4))
    }

    val rescueButton = actionButton(
      text = rescueCopy(language, "action"),
      backgroundColor = indigo,
      textColor = Color.WHITE,
      borderColor = indigo
    ) {
      renderRescue(sourceIntent)
    }

    rescueActionCard.addView(rescueLabel)
    rescueActionCard.addView(rescueTitle)
    rescueActionCard.addView(rescueHint)
    rescueActionCard.addView(rescueButton)

    val unlockCard = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(dp(18), dp(18), dp(18), dp(18))
      background = roundedSurface(surface, border, dp(20))
      layoutParams = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      ).apply {
        topMargin = dp(16)
      }
    }

    val revealPinButton = TextView(this).apply {
      text = if (!blockFingerprint.isNullOrBlank()) localized(language, "falsePositive", "¿Fue un error?") else localized(language, "openPin", "Abrir con PIN")
      setTextColor(indigo)
      textSize = 14f
      gravity = Gravity.CENTER
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
      paintFlags = paintFlags or android.graphics.Paint.UNDERLINE_TEXT_FLAG
      setPadding(dp(8), dp(10), dp(8), dp(6))
      layoutParams = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.WRAP_CONTENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      ).apply {
        topMargin = dp(10)
      }
    }

    val pinPanel = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      visibility = View.GONE
      layoutParams = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      ).apply {
        topMargin = dp(12)
      }
    }

    val unlockTitle = TextView(this).apply {
      text = localized(language, "unlockTitle", "Desbloqueo con guardián")
      setTextColor(indigo)
      textSize = 14f
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
    }

    val unlockDescription = TextView(this).apply {
      text = if (!blockFingerprint.isNullOrBlank()) {
        localized(language, "falsePositiveDescription", "Si este bloqueo fue un error, el guardián puede confirmar el PIN. Clean4Jesus permitirá solo este incidente y el refugio seguirá activo.")
      } else {
        localized(language, "guardianDescription", "Si una persona de confianza decide acompañarte en este momento, puede usar el PIN para abrir esta app por 15 minutos.")
      }
      setTextColor(muted)
      textSize = 13f
      setLineSpacing(0f, 1.16f)
      setPadding(0, dp(8), 0, dp(12))
    }

    val pinInput = EditText(this).apply {
      hint = "PIN"
      inputType = InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_VARIATION_PASSWORD
      filters = arrayOf(InputFilter.LengthFilter(4))
      gravity = Gravity.CENTER
      textSize = 18f
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
      setTextColor(slate)
      setHintTextColor(muted)
      setPadding(dp(16), 0, dp(16), 0)
      background = roundedSurface(Color.parseColor("#F7F8FF"), border, dp(16))
      layoutParams = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        dp(52)
      )
    }

    val unlockButton = actionButton(
      text = if (!blockFingerprint.isNullOrBlank()) localized(language, "confirm", "Confirmar PIN y continuar") else localized(language, "unlock15", "Desbloquear 15 min"),
      backgroundColor = indigoSoft,
      textColor = indigo,
      borderColor = border
    ) {
      if (blockedPackage.isNullOrBlank()) {
        Toast.makeText(this, localized(language, "unknownApp", "No pudimos identificar la app bloqueada."), Toast.LENGTH_SHORT).show()
        return@actionButton
      }

      val remainingLockout = remainingPinLockoutMs(this)
      if (remainingLockout > 0L) {
        val seconds = remainingLockout / 1000 + 1
        val message = localized(language, "pinLockout", "Espera {seconds} segundos antes de intentar de nuevo.")
          .replace("{seconds}", seconds.toString())
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
        return@actionButton
      }

      if (!verifyGuardianPin(this, pinInput.text?.toString().orEmpty())) {
        recordFailedPinAttempt(this)
        pinInput.setText("")
        Toast.makeText(this, localized(language, "wrongPin", "PIN incorrecto."), Toast.LENGTH_SHORT).show()
        return@actionButton
      }

      clearFailedPinAttempts(this)
      if (!blockFingerprint.isNullOrBlank()) {
        approveFalsePositive(blockedPackage, blockFingerprint)
        reportFalsePositiveAsync(blockedPackage, blockFingerprint)
        Toast.makeText(this, localized(language, "falsePositiveApproved", "Permitimos solo este incidente. El Refugio sigue activo."), Toast.LENGTH_LONG).show()
        openBlockedPackage(blockedPackage)
        finish()
        return@actionButton
      }

      unlockPackageTemporarily(blockedPackage)
        Toast.makeText(this, localized(language, "temporaryUnlock", "Esta app queda disponible durante 15 minutos."), Toast.LENGTH_LONG).show()
      openBlockedPackage(blockedPackage)
      finish()
    }

    val pinCancel = TextView(this).apply {
      text = localized(language, "cancel", "Cancelar")
      setTextColor(muted)
      textSize = 13f
      gravity = Gravity.CENTER_HORIZONTAL
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
      setPadding(dp(8), dp(12), dp(8), 0)
    }

    revealPinButton.setOnClickListener {
      revealPinButton.visibility = View.GONE
      pinPanel.visibility = View.VISIBLE
      pinInput.requestFocus()
    }

    pinCancel.setOnClickListener {
      pinInput.setText("")
      pinPanel.visibility = View.GONE
      revealPinButton.visibility = View.VISIBLE
    }

    pinPanel.addView(unlockTitle)
    pinPanel.addView(unlockDescription)
    pinPanel.addView(pinInput)
    pinPanel.addView(unlockButton)
    pinPanel.addView(pinCancel)

    unlockCard.addView(revealPinButton)
    unlockCard.addView(pinPanel)

    val privacy = TextView(this).apply {
      text = localized(language, "privacy", "Clean4Jesus analiza en tu dispositivo el texto visible de las apps protegidas para detectar señales. No envía ese contenido ni tu historial.")
      setTextColor(muted)
      textSize = 12f
      gravity = Gravity.CENTER_HORIZONTAL
      setLineSpacing(0f, 1.12f)
      setPadding(dp(10), dp(10), dp(10), 0)
    }

    val secondaryButton = actionButton(
      text = localized(language, "close", "Cerrar"),
      backgroundColor = goldSoft,
      textColor = indigo,
      borderColor = border
    ) {
      closeBlockedAppBestEffort()
      finish()
    }

    content.addView(brand)
    content.addView(statusChip)
    content.addView(title)
    content.addView(subtitle)

    val customBitmap = customImagePath?.let { decodeSampledBitmap(it, 960, 1200) }
    if (customBitmap != null) {
      heroCard.addView(ImageView(this).apply {
        setImageBitmap(customBitmap)
        scaleType = ImageView.ScaleType.CENTER_CROP
        layoutParams = LinearLayout.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          dp(208)
        ).apply {
          bottomMargin = dp(18)
        }
      })
    } else {
      heroCard.addView(iconWrap)
    }
    heroCard.addView(verse)
    heroCard.addView(reference)
    content.addView(heroCard)

    content.addView(reasonCard)
    if (!blockedPackage.isNullOrBlank()) {
      content.addView(rescueActionCard)
    }
    if (!blockedPackage.isNullOrBlank()) {
      content.addView(unlockCard)
    }
    content.addView(privacy)
    content.addView(secondaryButton)

    root.addView(content)
    setContentView(root)
  }

  private fun renderRescue(sourceIntent: Intent) {
    isRescueScreen = true
    rescueAnimator?.cancel()
    rescueHandler.removeCallbacksAndMessages(null)

    val bg = Color.parseColor("#F8F9FA")
    val surface = Color.WHITE
    val indigo = Color.parseColor("#1A237E")
    val indigoSoft = Color.parseColor("#E8EAF6")
    val gold = Color.parseColor("#F9A825")
    val goldSoft = Color.parseColor("#FFF8E1")
    val slate = Color.parseColor("#334155")
    val muted = Color.parseColor("#64748B")
    val border = Color.parseColor("#D7DCE5")
    val preferences = getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, MODE_PRIVATE)
    val language = preferences.getString(Clean4JesusAccessibilityService.PREF_APP_LANGUAGE, "es") ?: "es"

    window.statusBarColor = bg
    window.navigationBarColor = bg

    val root = ScrollView(this).apply {
      setBackgroundColor(bg)
      isFillViewport = true
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    }

    val content = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL
      setPadding(dp(24), statusBarInset() + dp(24), dp(24), dp(32))
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      )
    }

    val eyebrow = TextView(this).apply {
      text = "CLEAN4JESUS"
      setTextColor(indigo)
      textSize = 14f
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
      gravity = Gravity.CENTER
    }

    val title = TextView(this).apply {
      text = rescueCopy(language, "title")
      setTextColor(slate)
      textSize = 26f
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
      gravity = Gravity.CENTER
      setLineSpacing(0f, 1.08f)
      setPadding(0, dp(14), 0, dp(8))
    }

    val subtitle = TextView(this).apply {
      text = rescueCopy(language, "subtitle")
      setTextColor(muted)
      textSize = 15f
      gravity = Gravity.CENTER
      setLineSpacing(0f, 1.18f)
      setPadding(dp(6), 0, dp(6), dp(18))
    }

    val rescueCard = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL
      setPadding(dp(20), dp(24), dp(20), dp(22))
      background = gradientSurface(
        intArrayOf(Color.WHITE, Color.parseColor("#FFF3C4")),
        gold,
        dp(24)
      )
      layoutParams = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      )
    }

    val phase = TextView(this).apply {
      text = rescueCopy(language, "inhale")
      setTextColor(indigo)
      textSize = 18f
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
      gravity = Gravity.CENTER
    }

    val rescueVisual = FrameLayout(this).apply {
      layoutParams = LinearLayout.LayoutParams(dp(190), dp(190)).apply {
        topMargin = dp(12)
        bottomMargin = dp(8)
      }
    }

    val pulseHalo = View(this).apply {
      background = roundedSurface(Color.argb(34, 26, 35, 126), Color.TRANSPARENT, dp(999))
      alpha = 0.72f
      layoutParams = FrameLayout.LayoutParams(dp(184), dp(184), Gravity.CENTER)
    }

    val circle = TextView(this).apply {
      text = "60 s"
      setTextColor(Color.WHITE)
      textSize = 24f
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
      gravity = Gravity.CENTER
      background = gradientSurface(
        intArrayOf(indigo, Color.parseColor("#3949AB")),
        indigo,
        dp(999)
      )
      contentDescription = rescueCopy(language, "action")
      layoutParams = FrameLayout.LayoutParams(dp(156), dp(156), Gravity.CENTER)
    }

    rescueVisual.addView(pulseHalo)
    rescueVisual.addView(circle)

    val instruction = TextView(this).apply {
      text = "4 s  ·  2 s  ·  6 s"
      setTextColor(muted)
      textSize = 14f
      gravity = Gravity.CENTER
    }

    val timer = TextView(this).apply {
      text = "60 s"
      setTextColor(gold)
      textSize = 17f
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
      gravity = Gravity.CENTER
      setPadding(0, dp(14), 0, 0)
    }

    val doneTitle = TextView(this).apply {
      text = rescueCopy(language, "done")
      setTextColor(indigo)
      textSize = 18f
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
      gravity = Gravity.CENTER
      visibility = View.GONE
    }

    val doneSubtitle = TextView(this).apply {
      text = rescueCopy(language, "doneSubtitle")
      setTextColor(muted)
      textSize = 14f
      gravity = Gravity.CENTER
      setLineSpacing(0f, 1.16f)
      setPadding(dp(8), dp(8), dp(8), 0)
      visibility = View.GONE
    }

    rescueCard.addView(phase)
    rescueCard.addView(rescueVisual)
    rescueCard.addView(instruction)
    rescueCard.addView(timer)
    rescueCard.addView(doneTitle)
    rescueCard.addView(doneSubtitle)

    val backButton = actionButton(
      text = rescueCopy(language, "back"),
      backgroundColor = indigoSoft,
      textColor = indigo,
      borderColor = border
    ) {
      rescueAnimator?.cancel()
      renderInterruption(sourceIntent)
    }

    content.addView(eyebrow)
    content.addView(title)
    content.addView(subtitle)
    content.addView(rescueCard)
    content.addView(backButton)
    root.addView(content)
    setContentView(root)

    val duration = 60_000L
    rescueAnimator = ValueAnimator.ofFloat(0f, 1f).apply {
      this.duration = duration
      addUpdateListener { animation ->
        val progress = animation.animatedValue as Float
        val elapsed = (progress * duration).toLong()
        val remaining = ((duration - elapsed + 999L) / 1000L).coerceAtLeast(0L)
        timer.text = "$remaining s"
        circle.text = "$remaining s"

        val cycleElapsed = elapsed % 12_000L
        val scale: Float
        when {
          cycleElapsed < 4_000L -> {
            phase.text = rescueCopy(language, "inhale")
            scale = 0.86f + (cycleElapsed / 4_000f) * 0.32f
          }
          cycleElapsed < 6_000L -> {
            phase.text = rescueCopy(language, "hold")
            scale = 1.18f
          }
          else -> {
            phase.text = rescueCopy(language, "exhale")
            scale = 1.18f - ((cycleElapsed - 6_000L) / 6_000f) * 0.32f
          }
        }
        circle.scaleX = scale
        circle.scaleY = scale
        val haloScale = scale + 0.12f
        pulseHalo.scaleX = haloScale
        pulseHalo.scaleY = haloScale
        pulseHalo.alpha = 0.34f + ((scale - 0.86f) / 0.32f).coerceIn(0f, 1f) * 0.3f
      }
      addListener(object : android.animation.AnimatorListenerAdapter() {
        override fun onAnimationEnd(animation: android.animation.Animator) {
          if (!isRescueScreen) return
          phase.visibility = View.GONE
          instruction.visibility = View.GONE
          timer.visibility = View.GONE
          circle.text = "OK"
          circle.scaleX = 1f
          circle.scaleY = 1f
          pulseHalo.scaleX = 1f
          pulseHalo.scaleY = 1f
          pulseHalo.alpha = 0.72f
          doneTitle.visibility = View.VISIBLE
          doneSubtitle.visibility = View.VISIBLE
        }
      })
      start()
    }
  }

  private fun actionButton(
    text: String,
    backgroundColor: Int,
    textColor: Int,
    borderColor: Int,
    onClick: () -> Unit
  ): TextView {
    return TextView(this).apply {
      this.text = text
      contentDescription = text
      isFocusable = true
      setTextColor(textColor)
      textSize = 16f
      gravity = Gravity.CENTER
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
      setPadding(dp(20), dp(16), dp(20), dp(16))
      background = roundedSurface(backgroundColor, borderColor, dp(18))
      layoutParams = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      ).apply {
        topMargin = dp(14)
      }
      setOnClickListener { onClick() }
      minimumHeight = dp(56)
    }
  }

  private fun chip(
    text: String,
    textColor: Int,
    backgroundColor: Int,
    borderColor: Int
  ): TextView {
    return TextView(this).apply {
      this.text = text
      setTextColor(textColor)
      textSize = 13f
      gravity = Gravity.CENTER
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
      setPadding(dp(14), dp(10), dp(14), dp(10))
      background = roundedSurface(backgroundColor, borderColor, dp(999))
      layoutParams = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.WRAP_CONTENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      ).apply {
        gravity = Gravity.CENTER_HORIZONTAL
        bottomMargin = dp(14)
      }
    }
  }

  private fun roundedSurface(backgroundColor: Int, strokeColor: Int, radius: Int): GradientDrawable {
    return GradientDrawable().apply {
      shape = GradientDrawable.RECTANGLE
      cornerRadius = radius.toFloat()
      setColor(backgroundColor)
      setStroke(dp(1), strokeColor)
    }
  }

  private fun gradientSurface(colors: IntArray, strokeColor: Int, radius: Int): GradientDrawable {
    return GradientDrawable(GradientDrawable.Orientation.TL_BR, colors).apply {
      shape = GradientDrawable.RECTANGLE
      cornerRadius = radius.toFloat()
      setStroke(dp(1), strokeColor)
    }
  }

  private fun dp(value: Int): Int {
    return TypedValue.applyDimension(
      TypedValue.COMPLEX_UNIT_DIP,
      value.toFloat(),
      resources.displayMetrics
    ).toInt()
  }

  private fun statusBarInset(): Int {
    val resourceId = resources.getIdentifier("status_bar_height", "dimen", "android")
    return if (resourceId > 0) resources.getDimensionPixelSize(resourceId) else 0
  }

  private fun closeBlockedAppBestEffort() {
    moveTaskToBack(true)
    val home = Intent(Intent.ACTION_MAIN).apply {
      addCategory(Intent.CATEGORY_HOME)
      flags = Intent.FLAG_ACTIVITY_NEW_TASK
    }
    startActivity(home)
  }

  private fun unlockPackageTemporarily(packageName: String) {
    val until = SystemClock.elapsedRealtime() + TEMPORARY_UNLOCK_DURATION_MS
    val bootCount = try {
      Settings.Global.getInt(contentResolver, Settings.Global.BOOT_COUNT)
    } catch (_: Exception) {
      -1
    }
    getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, MODE_PRIVATE)
      .edit()
      .putLong("${Clean4JesusAccessibilityService.PREF_APP_UNLOCK_PREFIX}$packageName", until)
      .putInt(Clean4JesusAccessibilityService.temporaryUnlockBootKey(packageName), bootCount)
      .apply()
    Clean4JesusAccessibilityService.scheduleTemporaryRelock(packageName, until)
  }

  private fun approveFalsePositive(packageName: String, fingerprint: String) {
    val until = SystemClock.elapsedRealtime() + FALSE_POSITIVE_APPROVAL_DURATION_MS
    val bootCount = try {
      Settings.Global.getInt(contentResolver, Settings.Global.BOOT_COUNT)
    } catch (_: Exception) {
      -1
    }
    getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, MODE_PRIVATE)
      .edit()
      .putString(Clean4JesusAccessibilityService.falsePositiveFingerprintKey(packageName), fingerprint)
      .putLong(Clean4JesusAccessibilityService.falsePositiveUntilKey(packageName), until)
      .putInt(Clean4JesusAccessibilityService.falsePositiveBootKey(packageName), bootCount)
      .apply()
  }

  private fun reportFalsePositiveAsync(packageName: String, fingerprint: String) {
    val prefs = getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, MODE_PRIVATE)
    val endpoint = prefs.getString(Clean4JesusAccessibilityService.PREF_FALSE_POSITIVE_ENDPOINT, null) ?: return
    val apiKey = prefs.getString(Clean4JesusAccessibilityService.PREF_FALSE_POSITIVE_API_KEY, null) ?: return
    val installId = prefs.getString(Clean4JesusAccessibilityService.PREF_FALSE_POSITIVE_INSTALL_ID, null)
      ?: UUID.randomUUID().toString().also {
        prefs.edit().putString(Clean4JesusAccessibilityService.PREF_FALSE_POSITIVE_INSTALL_ID, it).apply()
      }
    val language = prefs.getString(Clean4JesusAccessibilityService.PREF_APP_LANGUAGE, "es") ?: "es"
    Thread {
      try {
        val payload = JSONObject()
          .put("device_id_hash", sha256(installId))
          .put("app_package", packageName)
          .put("rule_fingerprint", fingerprint.lowercase(Locale.US))
          .put("locale", language)
          .put("app_version", BuildConfig.VERSION_NAME)
          .put("source", "native_interruption")
        val connection = URL(endpoint).openConnection() as HttpURLConnection
        connection.requestMethod = "POST"
        connection.connectTimeout = 5_000
        connection.readTimeout = 5_000
        connection.doOutput = true
        connection.setRequestProperty("apikey", apiKey)
        connection.setRequestProperty("Content-Type", "application/json")
        connection.outputStream.use { it.write(payload.toString().toByteArray(Charsets.UTF_8)) }
        connection.responseCode
        connection.disconnect()
      } catch (_: Exception) {
        // Reporting is best-effort and must never interrupt the local protection flow.
      }
    }.start()
  }

  private fun sha256(value: String): String = MessageDigest.getInstance("SHA-256")
    .digest(value.toByteArray(Charsets.UTF_8))
    .joinToString("") { "%02x".format(it) }

  private fun openBlockedPackage(packageName: String) {
    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
    if (launchIntent == null) {
      val language = getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, MODE_PRIVATE)
        .getString(Clean4JesusAccessibilityService.PREF_APP_LANGUAGE, "es") ?: "es"
      Toast.makeText(this, localized(language, "openFailed", "No pudimos abrir esa app automáticamente."), Toast.LENGTH_SHORT).show()
      return
    }

    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    startActivity(launchIntent)
  }

  private fun decodeSampledBitmap(path: String, requestedWidth: Int, requestedHeight: Int): Bitmap? {
    val file = File(path)
    if (!file.exists() || !file.isFile) return null
    return try {
      val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
      BitmapFactory.decodeFile(path, bounds)
      var sampleSize = 1
      while (bounds.outWidth / sampleSize > requestedWidth * 2 || bounds.outHeight / sampleSize > requestedHeight * 2) {
        sampleSize *= 2
      }
      BitmapFactory.decodeFile(path, BitmapFactory.Options().apply { inSampleSize = sampleSize })
    } catch (_: Exception) {
      null
    }
  }
}
