const {
    withAndroidManifest,
    withMainApplication,
} = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

const withQuranWidget = (config) => {
    // Add Android Manifest entries
    config = withAndroidManifest(config, (config) => {
        const androidManifest = config.modResults;

        // Add widget receiver to application
        const application = androidManifest.manifest.application[0];

        // Add widget receiver
        const widgetReceiver = {
            $: {
                "android:name": ".QuranWidgetProvider",
                "android:exported": "true",
            },
            "intent-filter": [
                {
                    action: [
                        {
                            $: {
                                "android:name":
                                    "android.appwidget.action.APPWIDGET_UPDATE",
                            },
                        },
                        {
                            $: {
                                "android:name": "com.quranwidget.app.REFRESH",
                            },
                        },
                        {
                            $: {
                                "android:name": "com.quranwidget.app.FAVORITE",
                            },
                        },
                    ],
                },
            ],
            "meta-data": [
                {
                    $: {
                        "android:name": "android.appwidget.provider",
                        "android:resource": "@xml/quran_widget_info",
                    },
                },
            ],
        };

        if (!application.receiver) {
            application.receiver = [];
        }
        application.receiver.push(widgetReceiver);

        return config;
    });

    // Add MainApplication modifications
    config = withMainApplication(config, (config) => {
        const mainApplication = config.modResults;

        // Add import for QuranWidgetPackage
        if (
            !mainApplication.contents.includes(
                "com.quranwidget.app.QuranWidgetPackage"
            )
        ) {
            mainApplication.contents = mainApplication.contents.replace(
                /import expo\.modules\.ReactNativeHostWrapper/,
                "import expo.modules.ReactNativeHostWrapper\nimport com.quranwidget.app.QuranWidgetPackage"
            );
        }

        // Add package to the packages list
        if (
            !mainApplication.contents.includes(
                "packages.add(QuranWidgetPackage())"
            )
        ) {
            mainApplication.contents = mainApplication.contents.replace(
                /packages\.add\(MyReactNativePackage\(\)\)/,
                "packages.add(QuranWidgetPackage())"
            );
        }

        return config;
    });

    return config;
};

module.exports = withQuranWidget;
