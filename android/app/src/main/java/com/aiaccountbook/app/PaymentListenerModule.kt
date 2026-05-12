package com.aiaccountbook.app

import android.content.ComponentName
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.text.TextUtils
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * React Native Bridge Module
 * 
 * 提供给 JS 层的接口：
 * - isNotificationListenerEnabled() : 检查通知监听权限
 * - isOverlayPermissionGranted() : 检查悬浮窗权限
 * - openNotificationListenerSettings() : 跳转通知监听设置
 * - openOverlaySettings() : 跳转悬浮窗设置
 * 
 * 事件（原生 → JS）：
 * - "onPaymentDetected" : 检测到支付通知
 */
class PaymentListenerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "PaymentListenerModule"

    companion object {
        private var instance: PaymentListenerModule? = null

        fun getInstance(): PaymentListenerModule? = instance

        /**
         * 从原生服务调用，向 JS 层发送支付事件
         */
        fun emitPaymentEvent(context: ReactApplicationContext?, info: PaymentInfo) {
            context?.let { ctx ->
                if (ctx.hasActiveReactInstance()) {
                    val params = Arguments.createMap().apply {
                        putDouble("amount", info.amount)
                        putString("merchant", info.merchant)
                        putString("source", info.source)
                        putDouble("timestamp", info.timestamp.toDouble())
                        putString("rawContent", info.rawContent)
                    }
                    ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit("onPaymentDetected", params)
                }
            }
        }
    }

    init {
        instance = this
    }

    /**
     * 检查通知监听权限是否已开启
     */
    @ReactMethod
    fun isNotificationListenerEnabled(promise: Promise) {
        val pkgName = reactContext.packageName
        val flat = Settings.Secure.getString(
            reactContext.contentResolver,
            "enabled_notification_listeners"
        )
        if (!TextUtils.isEmpty(flat)) {
            val names = flat.split(":")
            for (name in names) {
                val cn = ComponentName.unflattenFromString(name)
                if (cn != null && cn.packageName == pkgName) {
                    promise.resolve(true)
                    return
                }
            }
        }
        promise.resolve(false)
    }

    /**
     * 检查悬浮窗权限
     */
    @ReactMethod
    fun isOverlayPermissionGranted(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            promise.resolve(Settings.canDrawOverlays(reactContext))
        } else {
            promise.resolve(true)
        }
    }

    /**
     * 打开通知监听设置页
     */
    @ReactMethod
    fun openNotificationListenerSettings() {
        val intent = Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS")
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        reactContext.startActivity(intent)
    }

    /**
     * 打开悬浮窗权限设置页
     */
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

    /**
     * 手动测试灵动岛效果（开发调试用）
     */
    @ReactMethod
    fun testFloatingIsland(amount: Double, merchant: String, source: String) {
        val intent = Intent(reactContext, FloatingIslandService::class.java).apply {
            putExtra("amount", amount)
            putExtra("merchant", merchant)
            putExtra("source", source)
        }
        reactContext.startService(intent)
    }
}
