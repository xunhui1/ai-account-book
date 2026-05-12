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

class FloatingIslandService : Service() {

    companion object {
        private const val TAG = "FloatingIsland"
        private const val AUTO_DISMISS_MS = 5000L
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
            showIsland(amount, merchant, source)
        }
        return START_NOT_STICKY
    }

    private fun showIsland(amount: Double, merchant: String, source: String) {
        removeView()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        floatingView = buildView(amount, merchant, source)

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
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
            y = getStatusBarHeight() + dp(8)
        }

        windowManager?.addView(floatingView, params)
        floatingView?.alpha = 0f
        floatingView?.animate()?.alpha(1f)?.setDuration(300)?.start()

        handler.postDelayed({ dismiss() }, AUTO_DISMISS_MS)
        Log.d(TAG, "显示: ¥$amount - $merchant")
    }

    private fun buildView(amount: Double, merchant: String, source: String): View {
        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(14), dp(20), dp(14))
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dp(22).toFloat()
                setColor(0xEE1B1B30.toInt())
                setStroke(1, 0x33FFFFFF.toInt())
            }
            elevation = dp(10).toFloat()
            minimumWidth = dp(280)
        }

        // Header row
        val header = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }

        header.addView(TextView(this).apply {
            text = getEmoji(merchant)
            textSize = 20f
            setPadding(0, 0, dp(8), 0)
        })

        header.addView(TextView(this).apply {
            text = merchant
            textSize = 14f
            setTextColor(0xFFFFFFFF.toInt())
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        })

        header.addView(TextView(this).apply {
            text = "¥${String.format("%.2f", amount)}"
            textSize = 17f
            setTextColor(0xFFFFFFFF.toInt())
            typeface = Typeface.DEFAULT_BOLD
            setPadding(dp(8), 0, dp(6), 0)
        })

        header.addView(TextView(this).apply {
            text = source
            textSize = 11f
            setTextColor(0xAAFFFFFF.toInt())
        })

        container.addView(header)

        // Action row (hidden initially)
        val actions = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(0, dp(10), 0, 0)
            visibility = View.GONE
        }

        actions.addView(makeBtn("✓ 确认", 0xFF4CAF50.toInt()) {
            val i = Intent(Intent.ACTION_VIEW, Uri.parse("aiaccountbook://quick-add/expense?amount=$amount&merchant=$merchant"))
            i.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            startActivity(i)
            dismiss()
        })

        actions.addView(makeBtn("✏️ 修改", 0xFF2196F3.toInt()) {
            val i = Intent(Intent.ACTION_VIEW, Uri.parse("aiaccountbook://quick-add/expense?amount=$amount&merchant=$merchant&edit=true"))
            i.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            startActivity(i)
            dismiss()
        })

        actions.addView(makeBtn("✕ 忽略", 0xFF616161.toInt()) { dismiss() })

        container.addView(actions)

        container.setOnClickListener {
            if (!isExpanded) {
                actions.visibility = View.VISIBLE
                isExpanded = true
                handler.removeCallbacksAndMessages(null)
                handler.postDelayed({ dismiss() }, AUTO_DISMISS_MS + 3000L)
            } else {
                actions.visibility = View.GONE
                isExpanded = false
            }
        }

        return container
    }

    private fun makeBtn(label: String, color: Int, onClick: () -> Unit): TextView {
        return TextView(this).apply {
            text = label
            textSize = 12f
            setTextColor(0xFFFFFFFF.toInt())
            setPadding(dp(12), dp(7), dp(12), dp(7))
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dp(10).toFloat()
                setColor(color)
            }
            setOnClickListener { onClick() }
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { setMargins(dp(5), 0, dp(5), 0) }
        }
    }

    private fun getEmoji(merchant: String): String = when {
        listOf("外卖", "美团", "饿了么", "餐", "食").any { merchant.contains(it) } -> "🍜"
        listOf("滴滴", "打车", "地铁", "公交").any { merchant.contains(it) } -> "🚗"
        listOf("超市", "便利", "盒马", "购物").any { merchant.contains(it) } -> "🛒"
        listOf("咖啡", "奶茶", "星巴克").any { merchant.contains(it) } -> "☕"
        else -> "💰"
    }

    private fun dismiss() {
        floatingView?.animate()?.alpha(0f)?.setDuration(200)?.withEndAction {
            removeView()
            stopSelf()
        }?.start()
    }

    private fun removeView() {
        floatingView?.let { try { windowManager?.removeView(it) } catch (_: Exception) {} }
        floatingView = null
        isExpanded = false
    }

    private fun getStatusBarHeight(): Int {
        val id = resources.getIdentifier("status_bar_height", "dimen", "android")
        return if (id > 0) resources.getDimensionPixelSize(id) else dp(24)
    }

    private fun dp(v: Int): Int = (v * resources.displayMetrics.density).toInt()

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacksAndMessages(null)
        removeView()
    }
}
