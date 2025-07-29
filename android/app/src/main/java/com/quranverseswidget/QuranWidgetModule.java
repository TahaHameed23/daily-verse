package com.quranverseswidget;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class QuranWidgetModule extends ReactContextBaseJavaModule {
    private static final String NAME = "QuranWidget";

    public QuranWidgetModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void updateWidget(String chapterInfo, String arabicText, String translationText, 
                           boolean showArabic, boolean showTranslation, Promise promise) {
        try {
            QuranWidgetProvider.updateWidgetData(
                getReactApplicationContext(), 
                chapterInfo, 
                arabicText, 
                translationText, 
                showArabic, 
                showTranslation
            );
            promise.resolve("Widget updated successfully");
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to update widget: " + e.getMessage());
        }
    }
}
