package com.aiaccountbook.app

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.content.Intent
import android.util.Log

/**
 * 通知监听服务 - 自动捕获支付通知
 */
class PaymentNotificationListener : NotificationListenerService() {

    companion object {
        private const val TAG = "PaymentListener"

        private val PAYMENT_PACKAGES = setOf(
            "com.tencent.mm",                    // 微信
            "com.eg.android.AlipayGphone",       // 支付宝
            "com.android.mms",                   // 系统短信
            "com.samsung.android.messaging",     // 三星短信
            "com.miui.mms",                      // 小米短信
            "com.huawei.message",                // 华为短信
        )

        private val BANK_PACKAGES = setOf(
            "com.icbc",                          // 工商银行
            "com.ccb.start",                     // 建设银行
            "com.chinamworld.main",              // 农业银行
            "com.bankcomm.Bankcomm",             // 交通银行
            "cmb.pb",                            // 招商银行
            "com.cmbchina.ccd.pluto.cmbActivity",// 招行信用卡
        )

        private val AMOUNT_PATTERNS = listOf(
            Regex("""[支付|消费|付款|扣款|花费].*?[￥¥](\d+\.?\d*)"""),
            Regex("""[￥¥](\d+\.?\d*).*?[支付|消费|付款]"""),
            Regex("""(\d+\.?\d*)\s*元"""),
            Regex("""[支付|消费|付款].*?(\d+\.?\d*)\s*元"""),
        )

        private val MERCHANT_PATTERNS = listOf(
            Regex("""在(.+?)[支付|消费|付款]"""),
            Regex("""向(.+?)[支付|转账]"""),
            Regex("""[(（](.+?)[)）]"""),
        )
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val packageName = sbn.packageName

        if (packageName !in PAYMENT_PACKAGES && packageName !in BANK_PACKAGES) {
            return
        }

        val notification = sbn.notification
        val extras = notification.extras
        val title = extras.getString("android.title") ?: ""
        val text = extras.getCharSequence("android.text")?.toString() ?: ""
        val content = "$title $text"

        Log.d(TAG, "收到支付通知: [$packageName] $content")

        val paymentInfo = parsePaymentInfo(content, packageName)

        if (paymentInfo != null) {
            Log.d(TAG, "解析成功: 金额=${paymentInfo.amount}, 商户=${paymentInfo.merchant}")
            showFloatingIsland(paymentInfo)
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {}

    private fun parsePaymentInfo(content: String, packageName: String): PaymentInfo? {
        if (!isPaymentNotification(content)) return null

        var amount: Double? = null
        var merchant: String? = null

        for (pattern in AMOUNT_PATTERNS) {
            val match = pattern.find(content)
            if (match != null) {
                amount = match.groupValues[1].toDoubleOrNull()
                if (amount != null && amount > 0) break
            }
        }

        for (pattern in MERCHANT_PATTERNS) {
            val match = pattern.find(content)
            if (match != null) {
                merchant = match.groupValues[1].trim()
                if (merchant.isNotEmpty()) break
            }
        }

        if (amount == null || amount <= 0) return null

        return PaymentInfo(
            amount = amount,
            merchant = merchant ?: "未知商户",
            source = getSourceName(packageName),
            rawContent = content,
            timestamp = System.currentTimeMillis()
        )
    }

    private fun isPaymentNotification(content: String): Boolean {
        val keywords = listOf(
            "支付成功", "付款成功", "消费", "扣款", "收款",
            "转账", "已支付", "支出", "花费", "交易成功"
        )
        return keywords.any { content.contains(it) }
    }

    private fun getSourceName(packageName: String): String {
        return when (packageName) {
            "com.tencent.mm" -> "微信支付"
            "com.eg.android.AlipayGphone" -> "支付宝"
            in BANK_PACKAGES -> "银行卡"
            else -> "短信"
        }
    }

    private fun showFloatingIsland(info: PaymentInfo) {
        // 1. 通过广播通知 RN 层（避免直接引用 ReactContext 导致的循环依赖）
        val broadcastIntent = Intent("com.aiaccountbook.PAYMENT_DETECTED").apply {
            putExtra("amount", info.amount)
            putExtra("merchant", info.merchant)
            putExtra("source", info.source)
            putExtra("timestamp", info.timestamp)
            putExtra("rawContent", info.rawContent)
            setPackage(packageName)
        }
        sendBroadcast(broadcastIntent)

        // 2. 触发灵动岛悬浮窗
        val intent = Intent(this, FloatingIslandService::class.java).apply {
            putExtra("amount", info.amount)
            putExtra("merchant", info.merchant)
            putExtra("source", info.source)
        }
        startService(intent)
    }
}

data class PaymentInfo(
    val amount: Double,
    val merchant: String,
    val source: String,
    val rawContent: String,
    val timestamp: Long
)
