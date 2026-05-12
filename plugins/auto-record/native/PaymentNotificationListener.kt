package com.aiaccountbook.app

import android.content.Intent
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

class PaymentNotificationListener : NotificationListenerService() {

    companion object {
        private const val TAG = "PaymentListener"

        private val PAYMENT_PACKAGES = setOf(
            "com.tencent.mm",
            "com.eg.android.AlipayGphone",
            "com.android.mms",
            "com.samsung.android.messaging",
            "com.miui.mms",
            "com.huawei.message"
        )

        private val BANK_PACKAGES = setOf(
            "com.icbc",
            "com.ccb.start",
            "com.chinamworld.main",
            "com.bankcomm.Bankcomm",
            "cmb.pb",
            "com.cmbchina.ccd.pluto.cmbActivity"
        )

        private val AMOUNT_PATTERNS = listOf(
            Regex("""[支付消费付款扣款花费].*?[￥¥](\d+\.?\d*)"""),
            Regex("""[￥¥](\d+\.?\d*)"""),
            Regex("""(\d+\.?\d*)\s*元""")
        )

        private val MERCHANT_PATTERNS = listOf(
            Regex("""在(.+?)[支付消费付款]"""),
            Regex("""向(.+?)[支付转账]"""),
            Regex("""[(（](.+?)[)）]""")
        )
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val packageName = sbn.packageName

        if (packageName !in PAYMENT_PACKAGES && packageName !in BANK_PACKAGES) {
            return
        }

        val extras = sbn.notification.extras
        val title = extras.getString("android.title") ?: ""
        val text = extras.getCharSequence("android.text")?.toString() ?: ""
        val content = "$title $text"

        Log.d(TAG, "收到通知: [$packageName] $content")

        if (!isPaymentNotification(content)) return

        val amount = extractAmount(content) ?: return
        val merchant = extractMerchant(content) ?: "未知商户"
        val source = getSourceName(packageName)
        val timestamp = System.currentTimeMillis()

        Log.d(TAG, "解析成功: ¥$amount - $merchant ($source)")

        // 广播到 RN 层
        val broadcastIntent = Intent("com.aiaccountbook.PAYMENT_DETECTED").apply {
            putExtra("amount", amount)
            putExtra("merchant", merchant)
            putExtra("source", source)
            putExtra("timestamp", timestamp)
            putExtra("rawContent", content)
            setPackage(packageName)
        }
        sendBroadcast(broadcastIntent)

        // 显示灵动岛
        val serviceIntent = Intent(this, FloatingIslandService::class.java).apply {
            putExtra("amount", amount)
            putExtra("merchant", merchant)
            putExtra("source", source)
        }
        startService(serviceIntent)
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {}

    private fun isPaymentNotification(content: String): Boolean {
        val keywords = listOf("支付成功", "付款成功", "消费", "扣款", "收款", "转账", "已支付", "交易成功")
        return keywords.any { content.contains(it) }
    }

    private fun extractAmount(content: String): Double? {
        for (pattern in AMOUNT_PATTERNS) {
            val match = pattern.find(content)
            if (match != null) {
                val amount = match.groupValues[1].toDoubleOrNull()
                if (amount != null && amount > 0) return amount
            }
        }
        return null
    }

    private fun extractMerchant(content: String): String? {
        for (pattern in MERCHANT_PATTERNS) {
            val match = pattern.find(content)
            if (match != null) {
                val m = match.groupValues[1].trim()
                if (m.isNotEmpty() && m.length < 20) return m
            }
        }
        return null
    }

    private fun getSourceName(packageName: String): String {
        return when (packageName) {
            "com.tencent.mm" -> "微信支付"
            "com.eg.android.AlipayGphone" -> "支付宝"
            in BANK_PACKAGES -> "银行卡"
            else -> "短信"
        }
    }
}
