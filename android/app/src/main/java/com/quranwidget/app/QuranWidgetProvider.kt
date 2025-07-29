package com.quranwidget.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.util.Log
import android.widget.RemoteViews
import com.quranwidget.app.R

class QuranWidgetProvider : AppWidgetProvider() {
    
    companion object {
        private const val TAG = "QuranWidgetProvider"
        private const val ACTION_REFRESH = "com.quranwidget.app.REFRESH"
        private const val ACTION_FAVORITE = "com.quranwidget.app.FAVORITE"
        private const val PREFS_NAME = "QuranWidgetPrefs"
        
        fun updateWidgetData(
            context: Context,
            chapterInfo: String,
            arabicText: String,
            translationText: String,
            showArabic: Boolean,
            showTranslation: Boolean
        ) {
            Log.d(TAG, "Updating widget data")
            
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            with(prefs.edit()) {
                putString("current_chapter_info", chapterInfo)
                putString("current_arabic", arabicText)
                putString("current_translation", translationText)
                putBoolean("show_arabic", showArabic)
                putBoolean("show_translation", showTranslation)
                apply()
            }
            
            // Update all widgets
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(
                android.content.ComponentName(context, QuranWidgetProvider::class.java)
            )
            
            val provider = QuranWidgetProvider()
            provider.onUpdate(context, appWidgetManager, appWidgetIds)
        }
    }
    
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        Log.d(TAG, "onUpdate called with ${appWidgetIds.size} widgets")
        
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }
    
    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        
        when (intent.action) {
            ACTION_REFRESH -> {
                Log.d(TAG, "Refresh action received")
                val appWidgetManager = AppWidgetManager.getInstance(context)
                val appWidgetIds = appWidgetManager.getAppWidgetIds(
                    android.content.ComponentName(context, QuranWidgetProvider::class.java)
                )
                onUpdate(context, appWidgetManager, appWidgetIds)
            }
            ACTION_FAVORITE -> {
                Log.d(TAG, "Favorite action received")
                val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
                launchIntent?.let {
                    it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    context.startActivity(it)
                }
            }
        }
    }
    
    private fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        Log.d(TAG, "Updating widget $appWidgetId")
        
        val views = RemoteViews(context.packageName, R.layout.quran_widget)
        
        // Load verse data from SharedPreferences
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val chapterInfo = prefs.getString("current_chapter_info", "Quran Verses") ?: "Quran Verses"
        val arabicText = prefs.getString("current_arabic", "") ?: ""
        val translationText = prefs.getString("current_translation", "Loading verse...") ?: "Loading verse..."
        val showArabic = prefs.getBoolean("show_arabic", true)
        val showTranslation = prefs.getBoolean("show_translation", true)
        
        // Update the widget views
        views.setTextViewText(R.id.widget_chapter_info, chapterInfo)
        
        if (showArabic && arabicText.isNotEmpty()) {
            views.setTextViewText(R.id.widget_arabic_text, arabicText)
            views.setViewVisibility(R.id.widget_arabic_text, android.view.View.VISIBLE)
        } else {
            views.setViewVisibility(R.id.widget_arabic_text, android.view.View.GONE)
        }
        
        if (showTranslation) {
            views.setTextViewText(R.id.widget_translation_text, translationText)
        }
        
        // Set up click handlers
        val refreshIntent = Intent(context, QuranWidgetProvider::class.java).apply {
            action = ACTION_REFRESH
        }
        val refreshPendingIntent = PendingIntent.getBroadcast(
            context, 0, refreshIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_refresh_button, refreshPendingIntent)
        
        val favoriteIntent = Intent(context, QuranWidgetProvider::class.java).apply {
            action = ACTION_FAVORITE
        }
        val favoritePendingIntent = PendingIntent.getBroadcast(
            context, 1, favoriteIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_favorite_button, favoritePendingIntent)
        
        // Set up click to open app
        val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        launchIntent?.let {
            val launchPendingIntent = PendingIntent.getActivity(
                context, 2, it, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_translation_text, launchPendingIntent)
        }
        
        // Update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
}
