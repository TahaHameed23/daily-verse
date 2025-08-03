import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { QuranWidget } from "./src/components/QuranWidget";
import AsyncStorage from "@react-native-async-storage/async-storage";

const nameToWidget = {
    // QuranVerse will be the name with which we will reference our widget
    QuranVerse: QuranWidget,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
    const widgetInfo = props.widgetInfo;
    const Widget =
        nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];

    switch (props.widgetAction) {
        case "WIDGET_ADDED":
            console.log("Widget added, testing with hardcoded data...");

            // First test with hardcoded data to see if widget renders
            props.renderWidget(
                React.createElement(Widget, {
                    chapterInfo: "Al-Fatiha 1:1",
                    arabicText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                    translationText:
                        "In the name of Allah, the Most Gracious, the Most Merciful",
                    showArabic: true,
                    showTranslation: true,
                })
            );
            break;

        case "WIDGET_UPDATE":
            try {
                console.log("Widget update, loading data from AsyncStorage...");
                // Load saved verse data from AsyncStorage
                const savedVerse = await AsyncStorage.getItem("currentVerse");
                const settings = await AsyncStorage.getItem("widgetSettings");

                console.log("Saved verse data:", savedVerse);
                console.log("Widget settings:", settings);

                const verseData = savedVerse ? JSON.parse(savedVerse) : null;
                const widgetSettings = settings
                    ? JSON.parse(settings)
                    : {
                          showArabic: true,
                          showTranslation: true,
                      };

                if (verseData) {
                    props.renderWidget(
                        React.createElement(Widget, {
                            chapterInfo: `${verseData.chapter} ${verseData.verse}`,
                            arabicText: verseData.arabic || "",
                            translationText:
                                verseData.translation ||
                                "No translation available",
                            showArabic: widgetSettings.showArabic,
                            showTranslation: widgetSettings.showTranslation,
                        })
                    );
                } else {
                    // Fallback to hardcoded data if no saved data
                    props.renderWidget(
                        React.createElement(Widget, {
                            chapterInfo: "Al-Fatiha 1:1",
                            arabicText:
                                "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                            translationText:
                                "In the name of Allah, the Most Gracious, the Most Merciful",
                            showArabic: widgetSettings.showArabic,
                            showTranslation: widgetSettings.showTranslation,
                        })
                    );
                }
            } catch (error) {
                console.error("Error updating widget:", error);
                // Fallback widget
                props.renderWidget(
                    React.createElement(Widget, {
                        chapterInfo: "Error",
                        arabicText: "",
                        translationText: "Failed to load verse data",
                        showArabic: true,
                        showTranslation: true,
                    })
                );
            }
            break;

        case "WIDGET_RESIZED":
            // Handle widget resize if needed
            break;

        case "WIDGET_DELETED":
            // Cleanup when widget is removed
            break;

        case "WIDGET_CLICK":
            // Handle widget clicks - maybe open the app
            console.log("Widget clicked");
            break;

        default:
            break;
    }
}
