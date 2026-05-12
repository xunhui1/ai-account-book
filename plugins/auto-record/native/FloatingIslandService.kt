package com.aiaccountbook.app

import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.TextView

/**
 * 灵动岛悬浮窗服务
 *
 * 支付完成后在屏幕顶部弹出圆角卡片：
 * - 收起态：显示图标 + 商户 + 金额 + 来源
 * - 展开态：增加操作按钮（确认/修改/忽略）
 * - 5秒自动消失，带淡出动画
 */
class FloatingIslandService : Service() {

    companion object {
        private const val TAG = "FloatingIsland"
        private const val AUTO_DISMISS_DELAY = 5000L
        private const val EXPAND_EXTRA_DELAY = 3000L
    }

    private var windowManager: WindowManager? = null
    private var floatingView: View? = null
    private var isExpanded = false
    private val handler = Handler(Looper.getMainLooper())

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val amount = intent?.getDoubleExtra("amount", 0.0) ?: 0.0
        val merchant = intent?.getStringExtra("merchant") ?: "未知"
        val source = intent?.getStringExtra("source") ?: ""

        if (amount > 0) {
            showFloatingIsland(amount, merchant, source)
        }

        return START_NOT_STICKY
    }

    private fun showFloatingIsland(amount: Double, merchant: String, source: String) {
        removeFloatingView()

        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        floatingView = createFloatingView(amount, merchant, source)

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        else
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
            y = getStatusBarHeight() + dp(12)
        }

        windowManager?.addView(floatingView, params)

        // 入场动画
        floatingView?.translationY = -dp(60).toFloat()
        floatingView?.alpha = 0f
        floatingView?.animate()
            ?.alpha(1f)
            ?.translationY(0f)
            ?.setDuration(350)
            ?.setInterpolator(android.view.animation.OvershootInterpolator(1.2f))
            ?.start()

        // 自动消失
        handler.postDelayed({ dismissFloatingIsland() }, AUTO_DISMISS_DELAY)

        Log.d(TAG, "灵动岛显示: ¥$amount - $merchant ($source)")
    }

    private fun createFloatingView(amount: Double, merchant: String, source: String): View {
        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(14), dp(20), dp(14))
            background = createRoundedBackground()
            elevation = dp(12).toFloat()
            minimumWidth = dp(300)
        }

        // === 第一行：图标 + 商户 + 金额 + 来源 ===
        val headerRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }

        val categoryIcon = TextView(this).apply {
            text = getCategoryEmoji(merchant)
            textSize = 22f
            setPadding(0, 0, dp(10), 0)
        }

        val merchantText = TextView(this).apply {
            text = merchant
            textSize = 15f
            setTextColor(0xFFFFFFFF.toInt())
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }

        val amountText = TextView(this).apply {
            text = "¥${String.format("%.2f", amount)}"
            textSize = 18f
            setTextColor(0xFFFFFFFF.toInt())
            typeface = Typeface.DEFAULT_BOLD
            setPadding(dp(8), 0, dp(8), 0)
        }

        val sourceText = TextView(this).apply {
            text = source
            textSize = 11f
            setTextColor(0xAAFFFFFF.toInt())
        }

        headerRow.addView(categoryIcon)
        headerRow.addView(merchantText)
        headerRow.addView(amountText)
        headerRow.addView(sourceText)
        container.addView(headerRow)

        // === 第二行：操作按钮（点击展开时显示）===
        val actionRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(0, dp(10), 0, 0)
            visibility = View.GONE
        }

        val confirmBtn = createActionButton("✓ 确认", 0xFF4CAF50.toInt()) {
            val intent = Intent(Intent.ACTION_VIEW,
                Uri.parse("aiaccountbook://quick-add/expense?amount=$amount&merchant=$merchant"))
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            startActivity(intent)
            dismissFloatingIsland()
        }

        val editBtn = createActionButton("✏️ 修改", 0xFF2196F3.toInt()) {
            val intent = Intent(Intent.ACTION_VIEW,
                Uri.parse("aiaccountbook://quick-add/expense?amount=$amount&merchant=$merchant&edit=true"))
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            startActivity(intent)
            dismissFloatingIsland()
        }

        val dismissBtn = createActionButton("✕ 忽略", 0xFF616161.toInt()) {
            dismissFloatingIsland()
        }

        actionRow.addView(confirmBtn)
        actionRow.addView(editBtn)
        actionRow.addView(dismissBtn)
        container.addView(actionRow)

        // 点击展开/收起
        container.setOnClickListener {
            if (!isExpanded) {
                actionRow.visibility = View.VISIBLE
                isExpanded = true
                handler.removeCallbacksAndMessages(null)
                handler.postDelayed({ dismissFloatingIsland() }, AUTO_DISMISS_DELAY + EXPAND_EXTRA_DELAY)
            } else {
                actionRow.visibility = View.GONE
                isExpanded = false
            }
        }

        return container
    }

    private fun createActionButton(text: String, bgColor: Int, onClick: () -> Unit): TextView {
        return TextView(this).apply {
            this.text = text
            textSize = 13f
            setTextColor(0xFFFFFFFF.toInt())
            setPadding(dp(14), dp(8), dp(14), dp(8))
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dp(12).toFloat()
                setColor(bgColor)
            }
            setOnClickListener { onClick() }
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { setMargins(dp(6), 0, dp(6), 0) }
        }
    }

    private fun createRoundedBackground(): GradientDrawable {
        return GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dp(24).toFloat()
            setColor(0xEE1A1A2E.toInt())  // 深色半透明
            setStroke(1, 0x22FFFFFF.toInt()) // 微光边框
        }
    }

    private fun getCategoryEmoji(merchant: String): String {
        return when {
            merchant.contains("外卖") || merchant.contains("美团") || merchant.contains("饿了么") -> "🍜"
            merchant.contains("超市") || merchant.contains("便利") || merchant.contains("盒马") -> "🛒"
            merchant.contains("滴滴") || merchant.contains("打车") || merchant.contains("地铁") || merchant.contains("公交") -> "🚗"
            merchant.contains("电影") || merchant.contains("游戏") || merchant.contains("娱乐") -> "🎮"
            merchant.contains("医") || merchant.contains("药") -> "💊"
            merchant.contains("咖啡") || merchant.contains("奶茶") || merchant.contains("星巴克") -> "☕"
            merchant.contains("淘宝") || merchant.contains("京东") || merchant.contains("拼多多") -> "📦"
            else -> "💰"
        }
    }

    private fun dismissFloatingIsland() {
        floatingView?.animate()
            ?.alpha(0f)
            ?.translationY(-dp(40).toFloat())
            ?.setDuration(250)
            ?.withEndAction {
                removeFloatingView()
                stopSelf()
            }
            ?.start()
    }

    private fun removeFloatingView() {
        floatingView?.let {
            try { windowManager?.removeView(it) } catch (_: Exception) {}
        }
        floatingView = null
        isExpanded = false
    }

    private fun getStatusBarHeight(): Int {
        val id = resources.getIdentifier("status_bar_height", "dimen", "android")
        return if (id > 0) resources.getDimensionPixelSize(id) else dp(24)
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacksAndMessages(null)
        removeFloatingView()
    }
}
