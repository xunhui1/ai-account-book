import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import android.app.PendingIntent
import android.net.Uri

/**
 * 桌面小组件 - 一键记账 Widget
 * 
 * 功能：
 * 1. 显示今日支出总额
 * 2. 点击「记支出」按钮直接跳转快速记账
 * 3. 点击「记收入」按钮直接跳转快速记账（收入模式）
 * 
 * 配置步骤：
 * 1. 将此文件放到 android/app/src/main/java/com/aiaccountbook/app/
 * 2. 在 AndroidManifest.xml 注册 receiver
 * 3. 创建 res/layout/widget_layout.xml 布局
 * 4. 创建 res/xml/widget_info.xml 配置
 */
class QuickAddWidget : AppWidgetProvider() {
    
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        internal fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_layout)

            // 点击「快速记支出」→ 打开 App 快速记账页（支出模式）
            val expenseIntent = Intent(Intent.ACTION_VIEW, Uri.parse("aiaccountbook://quick-add/expense"))
            val expensePending = PendingIntent.getActivity(
                context, 0, expenseIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.btn_quick_expense, expensePending)

            // 点击「快速记收入」→ 打开 App 快速记账页（收入模式）
            val incomeIntent = Intent(Intent.ACTION_VIEW, Uri.parse("aiaccountbook://quick-add/income"))
            val incomePending = PendingIntent.getActivity(
                context, 1, incomeIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.btn_quick_income, incomeIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
