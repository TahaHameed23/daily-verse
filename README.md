# Quran Verses Widget

A React Native app that displays daily Quran verses with an Android home screen widget. Built with Expo and featuring Arabic text support.

![App Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20Web-lightgrey.svg)
![Framework](https://img.shields.io/badge/framework-React%20Native%20%7C%20Expo-61dafb.svg)

## Features

### Mobile App

-   Daily random Quran verses with Arabic text and English translations
-   Save and manage favorite verses
-   Customizable display settings (toggle Arabic/English)
-   Share verses via clipboard or Android share system
-   Clean UI with scroll-hiding headers
-   Pull-to-refresh functionality

### Android Widget

-   Live verse display on home screen
-   Auto-sync with app changes
-   Interactive buttons (refresh, favorite)
-   Responsive 4x2 grid layout
-   RTL support for Arabic text

## Quick Start

### Prerequisites

-   Node.js 18+
-   Android Studio (for Android development)
-   EAS CLI

### Installation

1. Clone the repository

    ```bash
    git clone https://github.com/TahaHameed23/daily-verse.git
    cd daily-verse
    ```

2. Install dependencies

    ```bash
    npm install
    npm install -g @expo/cli eas-cli
    ```

3. Generate native code

    ```bash
    expo prebuild
    ```

4. Start development
    ```bash
    npm start
    ```

## Project Structure

```
src/
├── components/
│   ├── VerseCard.tsx          # Verse display with share functionality
│   └── Widget.tsx             # Widget preview
├── pages/
│   ├── Home.tsx               # Main verse display
│   ├── Favorites.tsx          # Saved verses
│   └── Settings.tsx           # App configuration
├── services/
│   ├── verseManager.ts        # Verse loading and caching
│   ├── storage.ts             # Data persistence
│   └── widgetService.ts       # Native widget bridge
└── types/
    └── index.ts               # TypeScript definitions
```

## Building

### Development

```bash
npm run web      # Web development
npm run android  # Android development
```

### Production

```bash
eas build --platform android --profile preview     # APK
eas build --platform android --profile production  # AAB for Play Store
```

## Architecture

**Data Flow:**

1. Verse Manager handles loading and caching
2. Storage Service manages favorites and settings
3. Widget Service bridges React Native with Android widget
4. Native Widget displays verses on home screen

**Technologies:**

-   React Native with Expo SDK 53
-   React Navigation for tabs
-   AsyncStorage for persistence
-   Custom Kotlin modules for widget
-   Animated API for UI effects

## Widget Implementation

The Android widget uses:

-   Kotlin native provider
-   React Native bridge for communication
-   SharedPreferences for data sharing
-   Standard Android widget lifecycle

## Configuration

Key files:

-   `app.json` - Expo configuration
-   `eas.json` - Build profiles
-   `.gitignore` - Excludes `android/` and `ios/` folders

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes following TypeScript best practices
4. Test on both web and Android
5. Submit pull request

## License

MIT License - see LICENSE file for details.

## Data Source

Verses provided by QuranAPI (https://quranapi.pages.dev/)
