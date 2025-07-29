package com.quranwidget.app

import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class QuranWidgetModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName(): String {
        return "QuranWidget"
    }

    @ReactMethod
    fun updateWidget(
        chapterInfo: String,
        arabicText: String,
        translationText: String,
        showArabic: Boolean,
        showTranslation: Boolean,
        promise: Promise
    ) {
        try {
            QuranWidgetProvider.updateWidgetData(
                reactApplicationContext,
                chapterInfo,
                arabicText,
                translationText,
                showArabic,
                showTranslation
            )
            promise.resolve("Widget updated successfully")
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to update widget: ${e.message}")
        }
    }
}
