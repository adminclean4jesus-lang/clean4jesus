package com.clean4jesus.app

import android.app.Activity
import android.content.Intent
import android.net.VpnService
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.ResultReceiver

class Clean4JesusVpnPermissionActivity : Activity() {
  companion object {
    private const val VPN_PERMISSION_REQUEST = 4105
    private const val VPN_STATUS_CHECK_DELAY_MS = 100L
    private const val VPN_STATUS_MAX_CHECKS = 50
  }

  private val handler = Handler(Looper.getMainLooper())
  private var statusChecks = 0
  private var resultSent = false
  private val resultReceiver: ResultReceiver? by lazy {
    @Suppress("DEPRECATION")
    intent.getParcelableExtra(Clean4JesusVpnModule.EXTRA_RESULT_RECEIVER) as? ResultReceiver
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val permissionIntent = VpnService.prepare(this)
    if (permissionIntent != null) {
      startActivityForResult(permissionIntent, VPN_PERMISSION_REQUEST)
    } else {
      startVpnAndFinish()
    }
  }

  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    super.onActivityResult(requestCode, resultCode, data)

    if (requestCode == VPN_PERMISSION_REQUEST && resultCode == RESULT_OK) {
      startVpnAndFinish()
    } else {
      sendResult(Clean4JesusVpnModule.RESULT_VPN_INACTIVE)
      finish()
    }
  }

  private fun startVpnAndFinish() {
    startService(Intent(this, Clean4JesusVpnService::class.java).apply {
      action = Clean4JesusVpnService.ACTION_START
    })
    waitForActiveVpn()
  }

  private fun waitForActiveVpn() {
    if (Clean4JesusVpnService.isActive()) {
      sendResult(Clean4JesusVpnModule.RESULT_VPN_ACTIVE)
      finish()
      return
    }

    statusChecks += 1
    if (statusChecks >= VPN_STATUS_MAX_CHECKS) {
      sendResult(Clean4JesusVpnModule.RESULT_VPN_INACTIVE)
      finish()
      return
    }

    handler.postDelayed(::waitForActiveVpn, VPN_STATUS_CHECK_DELAY_MS)
  }

  private fun sendResult(resultCode: Int) {
    if (resultSent) return
    resultSent = true
    resultReceiver?.send(resultCode, Bundle.EMPTY)
  }
}
