import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Dimensions
} from 'react-native';

import { storageService } from '../services/storage';
import { verseManager } from '../services/verseManager';
import { QuranVerse, Chapter, AppSettings } from '../types';

const { width: screenWidth } = Dimensions.get('window');

interface WidgetProps {
    size?: 'small' | 'medium' | 'large';
    theme?: 'light' | 'dark' | 'auto';
}

const Widget: React.FC<WidgetProps> = ({ size = 'medium', theme = 'light' }) => {
    const [verse, setVerse] = useState<QuranVerse | null>(null);
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWidget();
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const appSettings = await storageService.getSettings();
            setSettings(appSettings);
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const loadWidget = async () => {
        try {
            setLoading(true);
            const currentVerse = await verseManager.getCurrentOrNextVerse();
            if (currentVerse) {
                setVerse(currentVerse.verse);
                setChapter(currentVerse.chapter);
            }
        } catch (error) {
            console.error('Failed to load widget verse:', error);
            Alert.alert('Error', 'Failed to load verse');
        } finally {
            setLoading(false);
        }
    };

    const refreshVerse = async () => {
        try {
            const newVerse = await verseManager.getNextVerse();
            if (newVerse) {
                setVerse(newVerse.verse);
                setChapter(newVerse.chapter);
            }
        } catch (error) {
            console.error('Failed to refresh verse:', error);
            Alert.alert('Error', 'Failed to refresh verse');
        }
    };

    const addToFavorites = async () => {
        if (!verse || !chapter) return;
        
        try {
            await storageService.addToFavorites(verse, chapter);
            Alert.alert('Success', 'Added to favorites');
        } catch (error) {
            console.error('Failed to add to favorites:', error);
            Alert.alert('Error', 'Failed to add to favorites');
        }
    };

    const getWidgetStyles = () => {
        const baseStyle = theme === 'dark' ? styles.widgetDark : styles.widgetLight;
        
        switch (size) {
            case 'small':
                return [baseStyle, styles.widgetSmall];
            case 'large':
                return [baseStyle, styles.widgetLarge];
            default:
                return [baseStyle, styles.widgetMedium];
        }
    };

    const getTextStyles = () => {
        return theme === 'dark' ? styles.textDark : styles.textLight;
    };

    if (loading) {
        return (
            <View style={getWidgetStyles()}>
                <Text style={[styles.loadingText, getTextStyles()]}>Loading...</Text>
            </View>
        );
    }

    if (!verse || !chapter) {
        return (
            <View style={getWidgetStyles()}>
                <Text style={[styles.errorText, getTextStyles()]}>No verse available</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={loadWidget}>
                    <Text style={styles.refreshButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={getWidgetStyles()}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.chapterInfo, getTextStyles()]}>
                    {chapter.surahName} {verse.surahNo}:{verse.ayahNo}
                </Text>
                <TouchableOpacity onPress={refreshVerse} style={styles.refreshIcon}>
                    <Text style={[styles.iconText, getTextStyles()]}>🔄</Text>
                </TouchableOpacity>
            </View>

            {/* Arabic Text */}
            {settings?.showArabic && (
                <Text style={[styles.arabicText, getTextStyles()]}>
                    {verse.arabic1}
                </Text>
            )}

            {/* Translation */}
            {settings?.showTranslation && (
                <Text style={[styles.translationText, getTextStyles()]}>
                    {verse.english}
                </Text>
            )}

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity onPress={addToFavorites} style={styles.favoriteButton}>
                    <Text style={styles.favoriteIcon}>❤️</Text>
                </TouchableOpacity>
                <Text style={[styles.timestamp, getTextStyles()]}>
                    Daily Verse
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // Widget base styles
    widgetLight: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        margin: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    widgetDark: {
        backgroundColor: '#1e1e1e',
        borderRadius: 16,
        padding: 16,
        margin: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#333',
    },
    
    // Widget sizes
    widgetSmall: {
        minHeight: 120,
        maxWidth: screenWidth * 0.4,
    },
    widgetMedium: {
        minHeight: 180,
        maxWidth: screenWidth * 0.9,
    },
    widgetLarge: {
        minHeight: 250,
        maxWidth: screenWidth * 0.95,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    chapterInfo: {
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.7,
    },
    refreshIcon: {
        padding: 4,
    },
    iconText: {
        fontSize: 16,
    },

    // Text styles
    textLight: {
        color: '#333',
    },
    textDark: {
        color: '#fff',
    },
    arabicText: {
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'right',
        lineHeight: 28,
        marginBottom: 12,
        fontFamily: 'System', // Will use system Arabic font
    },
    translationText: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
        opacity: 0.8,
    },

    // Footer
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    favoriteButton: {
        padding: 4,
    },
    favoriteIcon: {
        fontSize: 18,
    },
    timestamp: {
        fontSize: 10,
        opacity: 0.6,
    },

    // Loading and error states
    loadingText: {
        textAlign: 'center',
        fontSize: 14,
        opacity: 0.6,
    },
    errorText: {
        textAlign: 'center',
        fontSize: 12,
        opacity: 0.6,
        marginBottom: 8,
    },
    refreshButton: {
        backgroundColor: '#0066cc',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'center',
    },
    refreshButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
});

export default Widget;
