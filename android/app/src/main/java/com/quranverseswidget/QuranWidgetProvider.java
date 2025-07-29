package com.quranverseswidget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import android.util.Log;

public class QuranWidgetProvider extends AppWidgetProvider {
    private static final String TAG = "QuranWidgetProvider";
    private static final String ACTION_REFRESH = "com.quranverseswidget.REFRESH";
    private static final String ACTION_FAVORITE = "com.quranverseswidget.FAVORITE";
    private static final String PREFS_NAME = "QuranWidgetPrefs";
    
    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        Log.d(TAG, "onUpdate called with " + appWidgetIds.length + " widgets");
        
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }
    
    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        
        String action = intent.getAction();
        if (ACTION_REFRESH.equals(action)) {
            Log.d(TAG, "Refresh action received");
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(
                new android.content.ComponentName(context, QuranWidgetProvider.class));
            onUpdate(context, appWidgetManager, appWidgetIds);
        } else if (ACTION_FAVORITE.equals(action)) {
            Log.d(TAG, "Favorite action received");
            // Handle favorite action - could open the app or show a toast
            Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(launchIntent);
            }
        }
    }
    
    private void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        Log.d(TAG, "Updating widget " + appWidgetId);
        
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.quran_widget);
        
        // Load verse data from SharedPreferences (this would be populated by the React Native app)
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String chapterInfo = prefs.getString("current_chapter_info", "Quran Verses");
        String arabicText = prefs.getString("current_arabic", "");
        String translationText = prefs.getString("current_translation", "Loading verse...");
        boolean showArabic = prefs.getBoolean("show_arabic", true);
        boolean showTranslation = prefs.getBoolean("show_translation", true);
        
        // Update the widget views
        views.setTextViewText(R.id.widget_chapter_info, chapterInfo);
        
        if (showArabic && !arabicText.isEmpty()) {
            views.setTextViewText(R.id.widget_arabic_text, arabicText);
            views.setViewVisibility(R.id.widget_arabic_text, android.view.View.VISIBLE);
        } else {
            views.setViewVisibility(R.id.widget_arabic_text, android.view.View.GONE);
        }
        
        if (showTranslation) {
            views.setTextViewText(R.id.widget_translation_text, translationText);
        }
        
        // Set up click handlers
        Intent refreshIntent = new Intent(context, QuranWidgetProvider.class);
        refreshIntent.setAction(ACTION_REFRESH);
        PendingIntent refreshPendingIntent = PendingIntent.getBroadcast(
            context, 0, refreshIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_refresh_button, refreshPendingIntent);
        
        Intent favoriteIntent = new Intent(context, QuranWidgetProvider.class);
        favoriteIntent.setAction(ACTION_FAVORITE);
        PendingIntent favoritePendingIntent = PendingIntent.getBroadcast(
            context, 1, favoriteIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_favorite_button, favoritePendingIntent);
        
        // Set up click to open app
        Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        if (launchIntent != null) {
            PendingIntent launchPendingIntent = PendingIntent.getActivity(
                context, 2, launchIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.widget_translation_text, launchPendingIntent);
        }
        
        // Update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
    
    public static void updateWidgetData(Context context, String chapterInfo, String arabicText, 
                                       String translationText, boolean showArabic, boolean showTranslation) {
        Log.d(TAG, "Updating widget data");
        
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("current_chapter_info", chapterInfo);
        editor.putString("current_arabic", arabicText);
        editor.putString("current_translation", translationText);
        editor.putBoolean("show_arabic", showArabic);
        editor.putBoolean("show_translation", showTranslation);
        editor.apply();
        
        // Update all widgets
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(
            new android.content.ComponentName(context, QuranWidgetProvider.class));
        
        QuranWidgetProvider provider = new QuranWidgetProvider();
        provider.onUpdate(context, appWidgetManager, appWidgetIds);
    }
}
