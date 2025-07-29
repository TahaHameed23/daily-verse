import { NativeModules, Platform } from "react-native";
import { QuranVerse, Chapter, AppSettings } from "../types";

const { QuranWidget } = NativeModules;

export const widgetService = {
    updateWidget: async (
        verse: QuranVerse,
        chapter: Chapter,
        settings: AppSettings
    ): Promise<void> => {
        if (Platform.OS !== "android" || !QuranWidget) {
            console.log("Widget service not available on this platform");
            return;
        }

        try {
            const chapterInfo = `${chapter.surahName} ${verse.surahNo}:${verse.ayahNo}`;
            const arabicText = verse.arabic1 || "";
            const translationText =
                verse.english || "Translation not available";

            await QuranWidget.updateWidget(
                chapterInfo,
                arabicText,
                translationText,
                settings.showArabic,
                settings.showTranslation
            );

            console.log("Widget updated successfully");
        } catch (error) {
            console.error("Failed to update widget:", error);
            throw error;
        }
    },
};
