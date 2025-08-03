import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QuranVerse, Chapter, AppSettings } from "../types";

export const widgetService = {
    updateWidget: async (
        verse: QuranVerse,
        chapter: Chapter,
        settings: AppSettings
    ): Promise<void> => {
        if (Platform.OS !== "android") {
            console.log("Widget service not available on this platform");
            return;
        }

        try {
            // Prepare verse data for the widget
            const verseData = {
                chapter: chapter.surahName || "",
                verse: `${verse.surahNo}:${verse.ayahNo}`,
                arabic: verse.arabic1 || "",
                translation: verse.english || "Translation not available",
            };

            const widgetSettings = {
                showArabic: settings.showArabic,
                showTranslation: settings.showTranslation,
            };

            console.log("Saving widget data:", verseData);
            console.log("Saving widget settings:", widgetSettings);

            // Save to AsyncStorage so the widget task handler can access it
            await AsyncStorage.setItem(
                "currentVerse",
                JSON.stringify(verseData)
            );
            await AsyncStorage.setItem(
                "widgetSettings",
                JSON.stringify(widgetSettings)
            );

            console.log("Widget data saved successfully to AsyncStorage");
        } catch (error) {
            console.error("Failed to update widget data:", error);
            throw error;
        }
    },
};
