import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { requestWidgetUpdate } from "react-native-android-widget";
import { QuranVerse, Chapter, AppSettings } from "../types";
import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

// Create the widget component that matches the one in widget-task-handler
const createQuranWidget = (
    chapterInfo: string,
    arabicText: string,
    translationText: string,
    showArabic: boolean,
    showTranslation: boolean
) => {
    const children = [];

    // Header with chapter info and refresh button
    children.push(
        React.createElement(
            FlexWidget,
            {
                key: "header-row",
                style: {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                    width: "match_parent",
                },
            },
            [
                React.createElement(TextWidget, {
                    key: "chapter-info",
                    text: chapterInfo,
                    style: {
                        fontSize: 13,
                        color: "#666666",
                        fontWeight: "bold",
                    },
                }),
                React.createElement(TextWidget, {
                    key: "refresh-button",
                    text: "↻", // Unicode refresh symbol that's more reliable than emoji
                    clickAction: "REFRESH_VERSE",
                    style: {
                        fontSize: 18,
                        color: "#2dd36f",
                        fontWeight: "bold",
                        padding: 6,
                        backgroundColor: "#f8f9fa",
                        borderRadius: 16,
                        textAlign: "center",
                    },
                }),
            ]
        )
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

    // Main container with click to open app
    return React.createElement(
        FlexWidget,
        {
            clickAction: "OPEN_APP", // Opens the app when widget is tapped
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

            // Request immediate widget update using the proper API
            requestWidgetUpdate({
                widgetName: "QuranVerse",
                renderWidget: () => {
                    return createQuranWidget(
                        `${verseData.chapter} ${verseData.verse}`,
                        verseData.arabic || "",
                        verseData.translation || "",
                        widgetSettings.showArabic,
                        widgetSettings.showTranslation
                    );
                },
                widgetNotFound: () => {
                    console.log("No QuranVerse widget found on home screen");
                },
            });

            console.log("Widget update requested successfully");
        } catch (error) {
            console.error("Failed to update widget data:", error);
            throw error;
        }
    },

    // Handle refresh action triggered from widget
    handleWidgetRefresh: async (): Promise<void> => {
        try {
            console.log("Widget refresh action triggered");

            // Store a flag that the widget requested a refresh
            await AsyncStorage.setItem("widgetRefreshRequested", "true");
            await AsyncStorage.setItem(
                "widgetRefreshTimestamp",
                Date.now().toString()
            );

            console.log("Widget refresh request stored");
        } catch (error) {
            console.error("Failed to handle widget refresh:", error);
        }
    },

    // Check if widget requested a refresh
    checkWidgetRefreshRequest: async (): Promise<boolean> => {
        try {
            const refreshRequested = await AsyncStorage.getItem(
                "widgetRefreshRequested"
            );
            const lastTimestamp = await AsyncStorage.getItem(
                "widgetRefreshTimestamp"
            );
            const lastChecked = await AsyncStorage.getItem(
                "lastWidgetRefreshCheck"
            );

            if (refreshRequested === "true" && lastTimestamp) {
                // Check if this is a new request (timestamp is newer than last check)
                const timestampNum = parseInt(lastTimestamp);
                const lastCheckedNum = parseInt(lastChecked || "0");

                if (timestampNum > lastCheckedNum) {
                    // Clear the flag and update last checked
                    await AsyncStorage.removeItem("widgetRefreshRequested");
                    await AsyncStorage.setItem(
                        "lastWidgetRefreshCheck",
                        timestampNum.toString()
                    );
                    console.log("New widget refresh request detected");
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error("Failed to check widget refresh request:", error);
            return false;
        }
    },
};
