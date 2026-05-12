package com.aiaccountbook.app

import android.content.ComponentName
import android.content.Intent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.IntentFilter
import android.os.Build
import android.provider.Settings
import android.text.TextUtils
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class PaymentListenerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "PaymentListenerModule"

    private val paymentReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            intent ?: return
            val amount = intent.getDoubleExtra("amount", 0.0)
            val merchant = intent.getStringExtra("merchant") ?: ""
            val source = intent.getStringExtra("source") ?: ""
            val timestamp = intent.getLongExtra("timestamp", System.currentTimeMillis())
            val rawContent = intent.getStringExtra("rawContent") ?: ""

            if (amount > 0 && reactContext.hasActiveReactInstance()) {
                val params = Arguments.createMap().apply {
                    putDouble("amount", amount)
                    putString("merchant", merchant)
                    putString("source", source)
                    putDouble("timestamp", timestamp.toDouble())
                    putString("rawContent", rawContent)
                }
                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onPaymentDetected", params)
            }
        }
    }

    init {
        val filter = IntentFilter("com.aiaccountbook.PAYMENT_DETECTED")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            reactContext.registerReceiver(paymentReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            @Suppress("UnspecifiedRegisterReceiverFlag")
            reactContext.registerReceiver(paymentReceiver, filter)
        }
    }

    @ReactMethod
    fun isNotificationListenerEnabled(promise: Promise) {
        val pkgName = reactContext.packageName
        val flat = Settings.Secure.getString(
            reactContext.contentResolver,
            "enabled_notification_listeners"
        ) ?: ""
        val enabled = flat.split(":").any { name ->
            ComponentName.unflattenFromString(name)?.packageName == pkgName
        }
        promise.resolve(enabled)
    }

    @ReactMethod
    fun isOverlayPermissionGranted(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            promise.resolve(Settings.canDrawOverlays(reactContext))
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun openNotificationListenerSettings() {
        val intent = Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS")
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        reactContext.startActivity(intent)
    }

    @ReactMethod
    fun openOverlaySettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                android.net.Uri.parse("package:${reactContext.packageName}")
            )
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactContext.startActivity(intent)
        }
    }

    @ReactMethod
    fun testFloatingIsland(amount: Double, merchant: String, source: String) {
        val intent = Intent(reactContext, FloatingIslandService::class.java).apply {
            putExtra("amount", amount)
            putExtra("merchant", merchant)
            putExtra("source", source)
        }
        reactContext.startService(intent)
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for NativeEventEmitter
    }
}
