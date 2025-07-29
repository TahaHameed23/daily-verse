import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    ActivityIndicator,
    Switch
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { verseManager } from '../services/verseManager';
import { storageService } from '../services/storage';
import { QuranVerse, Chapter, AppSettings } from '../types';

import VerseCard from '../components/VerseCard';
import Widget from '../components/Widget';

const Home: React.FC = () => {
    const [currentVerse, setCurrentVerse] = useState<QuranVerse | null>(null);
    const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);

            // Load settings
            const appSettings = await storageService.getSettings();
            setSettings(appSettings);

            // Load current verse
            const verseData = await verseManager.getCurrentOrNextVerse();
            setCurrentVerse(verseData.verse);
            setCurrentChapter(verseData.chapter);

            // Check if verse is in favorites
            const favorites = await storageService.getFavoriteVerses();
            const isInFavorites = favorites.some(fav => fav.verse.surahNo === verseData.verse.surahNo && fav.verse.ayahNo === verseData.verse.ayahNo);
            setIsFavorite(isInFavorites);

            // Update native widget
            await updateNativeWidget(verseData.verse, verseData.chapter, appSettings);

        } catch (error) {
            console.error('Failed to load initial data:', error);
            Alert.alert('Error', 'Failed to load verse. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            const verseData = await verseManager.refreshVerse();
            setCurrentVerse(verseData.verse);
            setCurrentChapter(verseData.chapter);

            // Update native widget with new verse
            await updateNativeWidget(verseData.verse, verseData.chapter, settings);

            // Check if new verse is in favorites
            const favorites = await storageService.getFavoriteVerses();
            const isInFavorites = favorites.some(fav => fav.verse.surahNo === verseData.verse.surahNo && fav.verse.ayahNo === verseData.verse.ayahNo);
            setIsFavorite(isInFavorites);

        } catch (error) {
            console.error('Failed to refresh verse:', error);
            Alert.alert('Error', 'Failed to load new verse.');
        } finally {
            setRefreshing(false);
        }
    };

    const toggleFavorite = async () => {
        if (!currentVerse || !currentChapter) return;

        try {
            if (isFavorite) {
                await storageService.removeFromFavorites(currentVerse.surahNo, currentVerse.ayahNo);
                setIsFavorite(false);
                Alert.alert('Success', 'Removed from favorites');
            } else {
                await storageService.addToFavorites(currentVerse, currentChapter);
                setIsFavorite(true);
                Alert.alert('Success', 'Added to favorites');
            }

            // Update native widget to reflect favorite status change
            await updateNativeWidget(currentVerse, currentChapter, settings);

        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            Alert.alert('Error', 'Failed to update favorites');
        }
    };

    const toggleWidgetTheme = async () => {
        if (!settings) return;

        const themeOrder: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto'];
        const currentIndex = themeOrder.indexOf(settings.widgetTheme);
        const nextIndex = (currentIndex + 1) % themeOrder.length;
        const newTheme = themeOrder[nextIndex];

        const newSettings = {
            ...settings,
            widgetTheme: newTheme
        };

        try {
            await storageService.saveSettings(newSettings);
            setSettings(newSettings);

            // Update widget with new theme
            await updateNativeWidget(currentVerse, currentChapter, newSettings);
        } catch (error) {
            console.error('Failed to save theme setting:', error);
            Alert.alert('Error', 'Failed to change theme');
        }
    };

    const updateNativeWidget = async (verse: QuranVerse | null, chapter: Chapter | null, appSettings: AppSettings | null) => {
        if (!verse || !chapter || !appSettings) return;

        try {
            // Native widget functionality would go here
            // For now, just log that we would update the widget
            console.log('Would update native widget with:', {
                chapter: `${chapter.surahName} ${verse.surahNo}:${verse.ayahNo}`,
                arabic: verse.arabic1,
                english: verse.english,
                showArabic: appSettings.showArabic,
                showTranslation: appSettings.showTranslation
            });
        } catch (error) {
            console.error('Failed to update widget:', error);
            // Don't show error to user as widget might not be available on all devices
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2dd36f" />
                <Text style={styles.loadingText}>Loading verse...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{
                paddingBottom: Math.max(insets.bottom, 16)
            }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
        >
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 20 }]}>
                <Text style={styles.title}>Quran Verses</Text>
            </View>

            {currentVerse && currentChapter && settings && (
                <View style={styles.content}>
                    <VerseCard
                        verse={currentVerse}
                        chapter={currentChapter}
                        showArabic={settings.showArabic}
                        showTranslation={settings.showTranslation}
                    />

                    {/* Action Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton]}
                            onPress={handleRefresh}
                        >
                            <Text style={styles.buttonText}>Next Verse</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                isFavorite ? styles.favoriteButton : styles.secondaryButton
                            ]}
                            onPress={toggleFavorite}
                        >
                            <Text style={[
                                styles.buttonText,
                                isFavorite ? styles.favoriteButtonText : styles.secondaryButtonText
                            ]}>
                                {isFavorite ? '♥ Favorited' : '♡ Favorite'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    header: {
        backgroundColor: '#2dd36f',
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
    },
    content: {
        padding: 16,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 16,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        flex: 0.48,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#2dd36f',
    },
    secondaryButton: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#2dd36f',
    },
    favoriteButton: {
        backgroundColor: '#e74c3c',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    secondaryButtonText: {
        color: '#2dd36f',
    },
    favoriteButtonText: {
        color: '#ffffff',
    },
    widgetSection: {
        padding: 16,
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    widgetInfo: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
    widgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    themeToggle: {
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 16,
    },
    themeToggleText: {
        fontSize: 20,
    },
});

export default Home;
