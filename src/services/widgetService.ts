import { NativeModules } from "react-native";

interface QuranWidgetInterface {
    updateWidget(
        chapterInfo: string,
        arabicText: string,
        translationText: string,
        showArabic: boolean,
        showTranslation: boolean
    ): Promise<string>;
}

const { QuranWidget } = NativeModules;

export const widgetService: QuranWidgetInterface = {
    updateWidget: async (
        chapterInfo: string,
        arabicText: string,
        translationText: string,
        showArabic: boolean,
        showTranslation: boolean
    ): Promise<string> => {
        if (QuranWidget) {
            return QuranWidget.updateWidget(
                chapterInfo,
                arabicText,
                translationText,
                showArabic,
                showTranslation
            );
        }
        throw new Error("QuranWidget native module not available");
    },
};

export default widgetService;
