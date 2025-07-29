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

import { verseManager } from '../services/verseManager';
import { storageService } from '../services/storage';
import { QuranVerse, Chapter, AppSettings } from '../types';

import VerseCard from '../components/VerseCard';

const Home: React.FC = () => {
    const [currentVerse, setCurrentVerse] = useState<QuranVerse | null>(null);
    const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);

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
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            Alert.alert('Error', 'Failed to update favorites');
        }
    };

    const toggleLanguage = async (field: 'showArabic' | 'showTranslation') => {
        if (!settings) return;

        const newSettings = {
            ...settings,
            [field]: !settings[field]
        };

        try {
            await storageService.saveSettings(newSettings);
            setSettings(newSettings);
        } catch (error) {
            console.error('Failed to save settings:', error);
            Alert.alert('Error', 'Failed to save settings');
        }
    };

    const handleRandomVerse = () => {
        Alert.alert(
            'Random Verse',
            'Get a completely random verse? This will bypass the shuffled sequence.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const verseData = await verseManager.getRandomVerse();
                            setCurrentVerse(verseData.verse);
                            setCurrentChapter(verseData.chapter);

                            // Check if verse is in favorites
                            const favorites = await storageService.getFavoriteVerses();
                            const isInFavorites = favorites.some(fav => fav.verse.surahNo === verseData.verse.surahNo && fav.verse.ayahNo === verseData.verse.ayahNo);
                            setIsFavorite(isInFavorites);

                            Alert.alert('Success', 'Random verse loaded!');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to load random verse');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
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
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
        >
            <View style={styles.header}>
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

                    {/* Language Controls */}
                    <View style={styles.card}>
                        <View style={styles.settingRow}>
                            <Text style={styles.settingLabel}>Show Arabic Text</Text>
                            <Switch
                                value={settings.showArabic}
                                onValueChange={() => toggleLanguage('showArabic')}
                                trackColor={{ false: '#767577', true: '#2dd36f' }}
                                thumbColor={settings.showArabic ? '#ffffff' : '#f4f3f4'}
                            />
                        </View>

                        <View style={styles.settingRow}>
                            <Text style={styles.settingLabel}>Show Translation</Text>
                            <Switch
                                value={settings.showTranslation}
                                onValueChange={() => toggleLanguage('showTranslation')}
                                trackColor={{ false: '#767577', true: '#2dd36f' }}
                                thumbColor={settings.showTranslation ? '#ffffff' : '#f4f3f4'}
                            />
                        </View>
                    </View>

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

                    {/* Random Verse Button */}
                    <TouchableOpacity
                        style={[styles.button, styles.randomButton]}
                        onPress={handleRandomVerse}
                    >
                        <Text style={styles.buttonText}>🔀 Random Verse</Text>
                    </TouchableOpacity>
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
        paddingTop: 50, // Account for status bar
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
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    settingLabel: {
        fontSize: 16,
        color: '#333',
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
    randomButton: {
        backgroundColor: '#3498db',
        flex: 1,
        marginTop: 8,
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
});

export default Home;
