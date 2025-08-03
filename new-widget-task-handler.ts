import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Dynamic widget function that accepts props
const createQuranWidget = (
    chapterInfo: string,
    arabicText: string,
    translationText: string,
    showArabic: boolean,
    showTranslation: boolean
) => {
    const children = [];

    // Header with chapter info
    children.push(
        React.createElement(TextWidget, {
            key: "chapter-info",
            text: chapterInfo,
            style: {
                fontSize: 13,
                color: "#666666",
                textAlign: "center",
                fontWeight: "bold",
                marginBottom: 8,
            },
        })
    );

    // Arabic text (if enabled)
    if (showArabic && arabicText) {
        children.push(
            React.createElement(TextWidget, {
                key: "arabic-text",
                text: arabicText,
                style: {
                    fontSize: 16,
                    color: "#2c3e50",
                    textAlign: "center",
                    marginBottom: 8,
                    fontWeight: "500",
                },
            })
        );
    }

    // Translation (if enabled)
    if (showTranslation && translationText) {
        children.push(
            React.createElement(TextWidget, {
                key: "translation-text",
                text: translationText,
                style: {
                    fontSize: 14,
                    color: "#34495e",
                    textAlign: "center",
                    marginBottom: 4,
                },
            })
        );
    }

    return React.createElement(
        FlexWidget,
        {
            style: {
                height: "match_parent",
                width: "match_parent",
                padding: 16,
                backgroundColor: "#ffffff",
                borderRadius: 8,
                flexDirection: "column",
                justifyContent: "flex-start",
            },
        },
        children
    );
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
    console.log("Widget action:", props.widgetAction);

    try {
        // Load saved verse data from AsyncStorage
        const savedVerse = await AsyncStorage.getItem("currentVerse");
        const settings = await AsyncStorage.getItem("widgetSettings");
        const lastUpdate = await AsyncStorage.getItem("lastWidgetUpdate");

        console.log("Saved verse data:", savedVerse);
        console.log("Widget settings:", settings);
        console.log("Last update timestamp:", lastUpdate);

        const verseData = savedVerse ? JSON.parse(savedVerse) : null;
        const widgetSettings = settings
            ? JSON.parse(settings)
            : { showArabic: true, showTranslation: true };

        if (verseData) {
            // Show real verse data
            props.renderWidget(
                createQuranWidget(
                    `${verseData.chapter} ${verseData.verse}`,
                    verseData.arabic || "",
                    verseData.translation || "",
                    widgetSettings.showArabic,
                    widgetSettings.showTranslation
                )
            );
        } else {
            // Show fallback verse
            props.renderWidget(
                createQuranWidget(
                    "Al-Fatiha 1:1",
                    "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                    "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
                    widgetSettings.showArabic,
                    widgetSettings.showTranslation
                )
            );
        }
    } catch (error) {
        console.error("Failed to load widget data:", error);
        // Show error state
        props.renderWidget(
            createQuranWidget(
                "Error",
                "",
                "Failed to load verse data",
                false,
                true
            )
        );
    }
}
