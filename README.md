# 📖 Quran Verses Widget

A React Native app that displays daily Quran verses with an Android home screen widget. Built with Expo and featuring a clean, modern interface with Arabic text support.

![App Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20Web-lightgrey.svg)
![Framework](https://img.shields.io/badge/framework-React%20Native%20%7C%20Expo-61dafb.svg)

## ✨ Features

### 📱 **Mobile App**

-   🎯 **Daily Verses**: Random Quran verses with Arabic text and English translations
-   ❤️ **Favorites**: Save and manage your favorite verses
-   🎨 **Customizable Display**: Toggle Arabic text and translations
-   📤 **Share Function**: Copy verses to clipboard or share via Android system

### 🏠 **Android Home Screen Widget**

-   📖 **Live Verse Display**: Shows current verse directly on home screen
-   🔄 **Auto-sync**: Updates automatically with app changes
-   🎛️ **Customizable**: Respects app settings for Arabic/English display
-   🖱️ **Interactive**: Tap to refresh or open app
-   ❤️ **Quick Favorite**: Favorite button directly on widget
-   🎨 **Responsive Design**: 4x2 grid, resizable

## 🚀 Quick Start

### Prerequisites

-   Node.js 18+
-   npm or yarn
-   Android Studio (for Android development)
-   EAS CLI for building

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/TahaHameed23/daily-verse.git
    cd daily-verse
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Install global tools**

    ```bash
    npm install -g @expo/cli eas-cli
    ```

4. **Generate native code**

    ```bash
    expo prebuild
    ```

5. **Start development server**
    ```bash
    npm start
    ```

## 📁 Project Structure

```
src/
├── components/
│   ├── VerseCard.tsx          # Verse display component with share functionality
│   └── Widget.tsx             # Widget preview component
├── pages/
│   ├── Home.tsx               # Main verse display with scroll-hiding header
│   ├── Favorites.tsx          # Saved verses management
│   └── Settings.tsx           # App configuration with expandable sections
├── services/
│   ├── verseManager.ts        # Verse loading and caching logic
│   ├── storage.ts             # AsyncStorage wrapper for data persistence
│   └── widgetService.ts       # Native widget bridge service
└── types/
    └── index.ts               # TypeScript type definitions
```

## 🛠️ Building the App

### Development Build

```bash
# Web development
npm run web

# Android development
npm run android
```

### Production Build (APK)

```bash
# Build APK using EAS
eas build --platform android --profile preview
```

### Production Build (AAB for Play Store)

```bash
# Build AAB for Google Play
eas build --platform android --profile production
```

## 🏗️ Architecture

### **Data Flow**

1. **Verse Manager**: Handles verse loading, caching, and sequencing
2. **Storage Service**: Manages favorites, settings, and app state
3. **Widget Service**: Bridges React Native app with Android widget
4. **Native Widget**: Displays verses on Android home screen

### **Key Technologies**

-   **Frontend**: React Native, Expo SDK 53
-   **Navigation**: React Navigation with bottom tabs
-   **State Management**: React hooks with AsyncStorage
-   **Styling**: StyleSheet with safe area context
-   **Animation**: React Native Animated API for scroll effects
-   **Native Integration**: Custom Kotlin modules for widget functionality

## 📱 Widget Implementation

The Android widget is implemented using:

-   **Kotlin**: Native Android widget provider
-   **React Native Bridge**: Communication between JS and native code
-   **SharedPreferences**: Data sharing between app and widget
-   **AppWidget Provider**: Standard Android widget lifecycle

### Widget Features

-   Auto-updates when app data changes
-   Clickable refresh and favorite buttons
-   Proper RTL support for Arabic text
-   Responsive layout with proper sizing
-   Deep linking to open main app

## 🎨 UI/UX Features

### **Design System**

-   Material Design principles
-   Consistent color scheme (Green primary: #2dd36f)
-   Typography hierarchy with Arabic font support
-   Shadow and elevation for depth
-   Responsive layouts for different screen sizes

### **Accessibility**

-   Screen reader support
-   High contrast text
-   Touch target sizing
-   Semantic markup

### **Performance**

-   Lazy loading for large text content
-   Efficient re-renders with React.memo
-   Optimized image assets
-   Minimal bundle size

## 🔧 Configuration

### App Settings (`app.json`)

```json
{
    "expo": {
        "name": "Quran Verses Widget",
        "slug": "quran-verses-widget",
        "version": "1.0.0",
        "android": {
            "package": "com.quranwidget.app"
        }
    }
}
```

### EAS Build (`eas.json`)

-   **Preview**: Generates APK for testing
-   **Production**: Generates AAB for Play Store
-   **Development**: Development client builds

## 📊 Data Sources

-   **Quran API**: Verses and translations from QuranAPI
-   **Local Storage**: Favorites and settings cached locally
-   **SQLite**: Verse caching for offline functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

-   Follow TypeScript best practices
-   Use React hooks over class components
-   Implement proper error handling
-   Add comments for complex logic
-   Test on both web and Android platforms

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

-   **QuranAPI** for providing verse data and translations
-   **Expo Team** for the excellent React Native framework
-   **React Native Community** for libraries and tools
-   **Islamic community** for inspiration and feedback

## 🐛 Known Issues

-   Widget may not update immediately on some Android versions
-   Large Arabic text may overflow on small widgets
-   iOS widget implementation pending

## 🔮 Roadmap

-   [ ] iOS widget implementation
-   [ ] Multiple widget sizes (2x1, 4x1, 4x4)
-   [ ] Verse of the day notifications
-   [ ] Audio recitation integration
-   [ ] Multiple translation languages
-   [ ] Dark mode for widget
-   [ ] Widget themes and customization
-   [ ] Backup and sync across devices

## 📞 Support

For support, issues, or feature requests:

-   Open an issue on GitHub
-   Contact: [Your contact information]
-   Documentation: [Link to detailed docs]

---

Made with ❤️ for the Muslim community
