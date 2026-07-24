package com.clean4jesus.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.util.concurrent.atomic.AtomicBoolean

class Clean4JesusVpnService : VpnService() {
  private var vpnInterface: ParcelFileDescriptor? = null
  private var worker: Thread? = null
  private val running = AtomicBoolean(false)
  private var consecutiveDnsFailures = 0

  companion object {
    const val ACTION_START = "com.clean4jesus.app.VPN_START"
    const val ACTION_STOP = "com.clean4jesus.app.VPN_STOP"

    private const val CHANNEL_ID = "clean4jesus_vpn"
    private const val NOTIFICATION_ID = 4104
    private const val VPN_ADDRESS = "10.10.10.2"
    private const val VPN_DNS = "10.10.10.1"
    private val UPSTREAM_DNS = listOf("1.1.1.3", "1.0.0.3")
    private const val MAX_CONSECUTIVE_DNS_FAILURES = 3

    @Volatile
    private var active = false

    fun isActive(): Boolean = active

    private fun setActive(value: Boolean) {
      active = value
    }
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_STOP -> {
        stopVpn()
        stopSelf()
        return START_NOT_STICKY
      }
      else -> {
        startForeground(NOTIFICATION_ID, buildNotification())
        startVpn()
      }
    }

    return START_STICKY
  }

  override fun onDestroy() {
    stopVpn()
    super.onDestroy()
  }

  override fun onRevoke() {
    stopVpn()
    stopSelf()
    super.onRevoke()
  }

  private fun startVpn() {
    if (running.get()) return

    val descriptor = Builder()
      .setSession("Clean4Jesus Family DNS")
      .addAddress(VPN_ADDRESS, 32)
      .addDnsServer(VPN_DNS)
      .addRoute(VPN_DNS, 32)
      .setMtu(1500)
      .establish()
      ?: run {
        setActive(false)
        stopSelf()
        return
      }

    vpnInterface = descriptor
    running.set(true)
    consecutiveDnsFailures = 0
    setActive(true)

    worker = Thread({ runDnsProxy(descriptor) }, "Clean4JesusDnsVpn").apply {
      isDaemon = true
      start()
    }
  }

  private fun stopVpn() {
    running.set(false)
    consecutiveDnsFailures = 0
    setActive(false)

    try {
      vpnInterface?.close()
    } catch (_: Exception) {
    }

    vpnInterface = null
    worker = null

    try {
      stopForeground(STOP_FOREGROUND_REMOVE)
    } catch (_: Exception) {
    }
  }

  private fun runDnsProxy(descriptor: ParcelFileDescriptor) {
    val input = FileInputStream(descriptor.fileDescriptor)
    val output = FileOutputStream(descriptor.fileDescriptor)
    val packetBuffer = ByteArray(32767)

    while (running.get()) {
      try {
        val length = input.read(packetBuffer)
        if (length <= 0) continue

        val response = handleDnsPacket(packetBuffer, length)
        if (response != null) {
          output.write(response)
        }
      } catch (_: Exception) {
        if (!running.get()) break
      }
    }
  }

  private fun handleDnsPacket(packet: ByteArray, length: Int): ByteArray? {
    if (length < 28) return null
    val version = (packet[0].toInt() ushr 4) and 0x0f
    if (version != 4) return null

    val headerLength = (packet[0].toInt() and 0x0f) * 4
    if (length < headerLength + 8) return null
    val protocol = packet[9].toInt() and 0xff
    if (protocol != 17) return null

    val udpOffset = headerLength
    val sourcePort = readShort(packet, udpOffset)
    val destinationPort = readShort(packet, udpOffset + 2)
    val udpLength = readShort(packet, udpOffset + 4)
    if (destinationPort != 53 || udpLength < 8 || length < udpOffset + udpLength) return null

    val dnsPayloadOffset = udpOffset + 8
    val dnsPayloadLength = udpLength - 8
    val dnsResponse = forwardDns(packet, dnsPayloadOffset, dnsPayloadLength)
    if (dnsResponse == null) {
      consecutiveDnsFailures += 1
      if (consecutiveDnsFailures >= MAX_CONSECUTIVE_DNS_FAILURES) {
        stopVpn()
        stopSelf()
      }
      return null
    }
    consecutiveDnsFailures = 0

    return buildUdpIpv4Response(
      original = packet,
      originalHeaderLength = headerLength,
      originalSourcePort = sourcePort,
      responsePayload = dnsResponse
    )
  }

  private fun forwardDns(packet: ByteArray, offset: Int, length: Int): ByteArray? {
    for (upstreamAddress in UPSTREAM_DNS) {
      try {
        DatagramSocket().use { socket ->
          protect(socket)
          socket.soTimeout = 2500

          val upstream = InetAddress.getByName(upstreamAddress)
          val query = DatagramPacket(packet, offset, length, upstream, 53)
          socket.send(query)

          val responseBuffer = ByteArray(4096)
          val responsePacket = DatagramPacket(responseBuffer, responseBuffer.size)
          socket.receive(responsePacket)
          return responseBuffer.copyOf(responsePacket.length)
        }
      } catch (_: Exception) {
        if (!running.get()) return null
      }
    }
    return null
  }

  private fun buildUdpIpv4Response(
    original: ByteArray,
    originalHeaderLength: Int,
    originalSourcePort: Int,
    responsePayload: ByteArray
  ): ByteArray {
    val ipHeaderLength = 20
    val udpHeaderLength = 8
    val totalLength = ipHeaderLength + udpHeaderLength + responsePayload.size
    val response = ByteArray(totalLength)

    response[0] = 0x45
    response[1] = 0
    writeShort(response, 2, totalLength)
    writeShort(response, 4, 0)
    writeShort(response, 6, 0x4000)
    response[8] = 64
    response[9] = 17

    // Source becomes the local DNS address, destination becomes the original app.
    original.copyInto(response, 12, 16, 20)
    original.copyInto(response, 16, 12, 16)

    writeShort(response, 10, 0)
    writeShort(response, 10, checksum(response, 0, ipHeaderLength))

    val udpOffset = ipHeaderLength
    writeShort(response, udpOffset, 53)
    writeShort(response, udpOffset + 2, originalSourcePort)
    writeShort(response, udpOffset + 4, udpHeaderLength + responsePayload.size)
    writeShort(response, udpOffset + 6, 0)
    responsePayload.copyInto(response, udpOffset + udpHeaderLength)

    return response
  }

  private fun buildNotification(): Notification {
    createNotificationChannel()

    val language = getSharedPreferences(Clean4JesusAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)
      .getString(Clean4JesusAccessibilityService.PREF_APP_LANGUAGE, "es") ?: "es"
    val status = when (language) {
      "en" -> "Base DNS protection active"
      "fr" -> "Protection DNS de base active"
      "pt" -> "Proteção DNS básica ativa"
      else -> "Protección DNS base activa"
    }

    return Notification.Builder(this, CHANNEL_ID)
      .setSmallIcon(R.drawable.notification_icon)
      .setContentTitle("Clean4Jesus")
      .setContentText(status)
      .setOngoing(true)
      .build()
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

    val manager = getSystemService(NotificationManager::class.java)
    val channel = NotificationChannel(CHANNEL_ID, "Clean4Jesus VPN", NotificationManager.IMPORTANCE_LOW)
    manager.createNotificationChannel(channel)
  }

  private fun readShort(packet: ByteArray, offset: Int): Int {
    return ((packet[offset].toInt() and 0xff) shl 8) or (packet[offset + 1].toInt() and 0xff)
  }

  private fun writeShort(packet: ByteArray, offset: Int, value: Int) {
    packet[offset] = ((value ushr 8) and 0xff).toByte()
    packet[offset + 1] = (value and 0xff).toByte()
  }

  private fun checksum(packet: ByteArray, offset: Int, length: Int): Int {
    var sum = 0
    var index = offset
    while (index < offset + length) {
      val high = packet[index].toInt() and 0xff
      val low = if (index + 1 < offset + length) packet[index + 1].toInt() and 0xff else 0
      sum += (high shl 8) or low
      while ((sum and 0xffff0000.toInt()) != 0) {
        sum = (sum and 0xffff) + (sum ushr 16)
      }
      index += 2
    }

    return sum.inv() and 0xffff
  }
}
