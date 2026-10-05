package com.clean4jesus.app

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView

class BankReturnActivity : Activity() {
  companion object {
    const val EXTRA_RETURN_ONLY = "clean4jesus.bank_return_only"
    private const val RELAUNCH_DELAY_MS = 550L
  }

  private val handler = Handler(Looper.getMainLooper())
  private lateinit var content: View
  private var bankPackage: String? = null
  private var bankLaunchRequested = false
  private var leftForBank = false
  private var returnOnly = false

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    window.clearFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)

    bankPackage = intent.getStringExtra(BankCompatibilityBridge.EXTRA_BANK_PACKAGE)
      ?: BankCompatibilityBridge.pendingBankPackage(this)
    returnOnly = intent.getBooleanExtra(EXTRA_RETURN_ONLY, false)
    bankLaunchRequested = savedInstanceState?.getBoolean("bank_launch_requested") ?: false
    leftForBank = savedInstanceState?.getBoolean("left_for_bank") ?: false
    content = buildContent()
    content.alpha = if (returnOnly) 1f else 0f
    setContentView(content)
    if (returnOnly) showReturnUi()

    if (!returnOnly && savedInstanceState == null) {
      handler.postDelayed({ reopenBank() }, RELAUNCH_DELAY_MS)
    }
  }

  override fun onStart() {
    super.onStart()
    window.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
  }

  override fun onResume() {
    super.onResume()
    if (returnOnly || leftForBank) {
      if (Clean4JesusAccessibilityService.isServiceEnabled(this)) {
        BankCompatibilityBridge.clearReturnPrompt(this)
        openClean4Jesus()
        return
      }
      showReturnUi()
    }
  }

  override fun onPause() {
    if (bankLaunchRequested) {
      leftForBank = true
      BankCompatibilityBridge.markBankBridgeDeparted(this)
    }
    super.onPause()
  }

  override fun onSaveInstanceState(outState: Bundle) {
    outState.putBoolean("bank_launch_requested", bankLaunchRequested)
    outState.putBoolean("left_for_bank", leftForBank)
    super.onSaveInstanceState(outState)
  }

  override fun onDestroy() {
    handler.removeCallbacksAndMessages(null)
    super.onDestroy()
  }

  private fun reopenBank() {
    val packageName = bankPackage
    if (packageName.isNullOrBlank()) {
      returnOnly = true
      showReturnUi()
      return
    }

    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
    if (launchIntent == null) {
      returnOnly = true
      showReturnUi()
      return
    }

    bankLaunchRequested = true
    launchIntent.addFlags(
      Intent.FLAG_ACTIVITY_NEW_TASK or
        Intent.FLAG_ACTIVITY_REORDER_TO_FRONT or
        Intent.FLAG_ACTIVITY_SINGLE_TOP,
    )
    startActivity(launchIntent)
    overridePendingTransition(0, 0)
  }

  private fun openAccessibility() {
    startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
  }

  private fun showReturnUi() {
    window.setDimAmount(0.58f)
    window.addFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)
    content.animate().alpha(1f).setDuration(160L).start()
  }

  private fun openClean4Jesus() {
    startActivity(
      Intent(this, MainActivity::class.java).apply {
        addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
      }
    )
    finish()
    overridePendingTransition(0, 0)
  }

  private fun buildContent(): View {
    val density = resources.displayMetrics.density
    fun dp(value: Int) = (value * density).toInt()

    val card = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL
      setPadding(dp(26), dp(28), dp(26), dp(24))
      background = GradientDrawable().apply {
        shape = GradientDrawable.RECTANGLE
        cornerRadius = dp(28).toFloat()
        setColor(Color.WHITE)
      }
    }

    card.addView(ImageView(this).apply {
      setImageResource(R.mipmap.ic_launcher)
      contentDescription = "Clean4Jesus"
      layoutParams = LinearLayout.LayoutParams(dp(58), dp(58)).apply { bottomMargin = dp(18) }
    })
    card.addView(TextView(this).apply {
      text = "Todo listo por aquí"
      setTextColor(Color.rgb(7, 31, 82))
      textSize = 25f
      setTypeface(typeface, Typeface.BOLD)
      gravity = Gravity.CENTER
    })
    card.addView(TextView(this).apply {
      text = "Sigue estos pasos para volver al Refugio:\n\n1. Toca “Volver al Refugio”.\n2. Elige Clean4Jesus.\n3. Activa “Usar Clean4Jesus” y regresa."
      setTextColor(Color.rgb(75, 85, 99))
      textSize = 16f
      gravity = Gravity.CENTER
      setLineSpacing(0f, 1.18f)
      layoutParams = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT,
      ).apply {
        topMargin = dp(12)
        bottomMargin = dp(22)
      }
    })
    card.addView(Button(this).apply {
      text = "Volver al Refugio"
      isAllCaps = false
      textSize = 17f
      setTextColor(Color.WHITE)
      setTypeface(typeface, Typeface.BOLD)
      background = GradientDrawable().apply {
        shape = GradientDrawable.RECTANGLE
        cornerRadius = dp(999).toFloat()
        setColor(Color.rgb(7, 31, 82))
      }
      layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(56))
      setOnClickListener { openAccessibility() }
    })

    return LinearLayout(this).apply {
      gravity = Gravity.CENTER
      setPadding(dp(20), dp(20), dp(20), dp(20))
      addView(
        card,
        LinearLayout.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.WRAP_CONTENT,
        ),
      )
    }
  }
}
