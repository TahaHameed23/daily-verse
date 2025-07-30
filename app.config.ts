import type { ConfigContext, ExpoConfig } from "expo/config";
import type { WithAndroidWidgetsParams } from "react-native-android-widget";

const widgetConfig: WithAndroidWidgetsParams = {
    // No custom fonts needed for now
    fonts: [],
    widgets: [
        {
            name: "QuranVerse", // This name will be the name with which we reference our widget
            label: "Quran Verses Widget", // Label shown in the widget picker
            minWidth: "250dp",
            minHeight: "110dp",
            // This means the widget's default size is 4x2 cells
            targetCellWidth: 4,
            targetCellHeight: 2,
            description: "Display daily Quran verses on your home screen", // Description shown in the widget picker
            previewImage: "./assets/widget-preview/widget_preview.png", // Path to widget preview image
            // Update every 30 minutes (minimum allowed)
            updatePeriodMillis: 1800000,
        },
    ],
};

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: "Quran Verses Widget",
    slug: "quran-verses-widget",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    assetBundlePatterns: ["assets/**/*"],
    splash: {
        image: "./assets/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#2dd36f",
    },
    ios: {
        supportsTablet: true,
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#2dd36f",
        },
        package: "com.quranwidget.app",
        edgeToEdgeEnabled: false,
    },
    web: {
        favicon: "./assets/favicon.png",
    },
    platforms: ["ios", "android", "web"],
    extra: {
        eas: {
            projectId: "c8279202-d550-48ae-bfcf-82ca66a7b44b",
        },
    },
    plugins: [["react-native-android-widget", widgetConfig]],
});
