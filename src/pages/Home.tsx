import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    ActivityIndicator,
    Switch,
    Animated,
    Linking,
    AppState
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { verseManager } from '../services/verseManager';
import { storageService } from '../services/storage';
import { widgetService } from '../services/widgetService';
import { backgroundRefreshService } from '../services/backgroundRefreshService';
import { QuranVerse, Chapter, AppSettings } from '../types';

import VerseCard from '../components/VerseCard';

const Home: React.FC = () => {
    const [currentVerse, setCurrentVerse] = useState<QuranVerse | null>(null);
    const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [nextRefreshTime, setNextRefreshTime] = useState<{ hours: number; minutes: number } | null>(null);
    const insets = useSafeAreaInsets();

    // Header animation
    const headerHeight = 80;
    const headerAnimatedValue = useRef(new Animated.Value(0)).current;
    const lastScrollY = useRef(0);

    const headerTranslateY = headerAnimatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -headerHeight],
        extrapolate: 'clamp',
    });

    useEffect(() => {
        loadInitialData();

        // Initialize background refresh service
        backgroundRefreshService.initialize();

        // Handle deep links from app shortcuts
        const handleDeepLink = (url: string) => {
            if (url.includes('verses://refresh')) {
                // Trigger a refresh when coming from "Fresh Verse" shortcut
                setTimeout(() => handleRefresh(), 500); // Small delay to ensure app is loaded
            } else if (url.includes('verses://widget')) {
                // Show widget instructions when coming from "Add Widget" shortcut
                setTimeout(() => {
                    Alert.alert(
                        'Add Widget',
                        'To add the Quran Verses widget:\n\n1. Long press on your home screen\n2. Tap "Widgets"\n3. Find "Quran Verses Widget"\n4. Drag it to your home screen',
                        [{ text: 'Got it!' }]
                    );
                }, 500);
            }
        };

        // Check if app was opened via deep link
        Linking.getInitialURL().then((url) => {
            if (url) {
                handleDeepLink(url);
            }
        });

        // Listen for deep link events while app is running
        const linkingSubscription = Linking.addEventListener('url', (event) => {
            handleDeepLink(event.url);
        });

        // Handle app state changes to check for widget refresh
        const handleAppStateChange = async (nextAppState: string) => {
            if (nextAppState === 'active') {
                console.log('App became active, checking for widget refresh...');
                const widgetRefreshRequested = await widgetService.checkWidgetRefreshRequest();
                if (widgetRefreshRequested) {
                    console.log("Widget refresh detected - triggering verse refresh");
                    // Inline refresh logic
                    try {
                        setRefreshing(true);
                        const verseData = await verseManager.refreshVerse();
                        setCurrentVerse(verseData.verse);
                        setCurrentChapter(verseData.chapter);

                        // Update native widget with new verse
                        if (settings) {
                            await updateNativeWidget(verseData.verse, verseData.chapter, settings);
                        }

                        // Check if new verse is in favorites
                        const favorites = await storageService.getFavoriteVerses();
                        const isInFavorites = favorites.some(fav => fav.verse.surahNo === verseData.verse.surahNo && fav.verse.ayahNo === verseData.verse.ayahNo);
                        setIsFavorite(isInFavorites);
                    } catch (error) {
                        console.error('Failed to refresh verse from widget:', error);
                        Alert.alert('Error', 'Failed to load new verse.');
                    } finally {
                        setRefreshing(false);
                    }
                }

                // Check if auto-refresh occurred while app was in background
                const autoRefreshOccurred = await backgroundRefreshService.checkAutoRefreshOccurred();
                if (autoRefreshOccurred) {
                    console.log("Auto-refresh occurred - reloading current verse");
                    // Reload the current verse to reflect auto-refresh changes
                    const current = await storageService.getCurrentVerse();
                    if (current) {
                        setCurrentVerse(current.verse);
                        setCurrentChapter(current.chapter);

                        // Check if new verse is in favorites
                        const favorites = await storageService.getFavoriteVerses();
                        const isInFavorites = favorites.some(fav => fav.verse.surahNo === current.verse.surahNo && fav.verse.ayahNo === current.verse.ayahNo);
                        setIsFavorite(isInFavorites);
                    }
                }
            }
        };

        // Listen for app state changes
        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            linkingSubscription?.remove();
            appStateSubscription?.remove();
            backgroundRefreshService.cleanup();
        };
    }, []);

    // Update widget when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            const updateWidgetOnFocus = async () => {
                if (currentVerse && currentChapter && settings) {
                    await updateNativeWidget(currentVerse, currentChapter, settings);
                }

                // Also check for widget refresh when screen comes into focus
                const widgetRefreshRequested = await widgetService.checkWidgetRefreshRequest();
                if (widgetRefreshRequested) {
                    console.log("Widget refresh detected on focus - triggering verse refresh");
                    // Call handleRefresh directly without adding to deps
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
                        console.error('Failed to refresh verse from widget:', error);
                        Alert.alert('Error', 'Failed to load new verse.');
                    } finally {
                        setRefreshing(false);
                    }
                }
            };
            updateWidgetOnFocus();
        }, [currentVerse, currentChapter, settings])
    );

    // Update next refresh time periodically
    useEffect(() => {
        const updateNextRefreshTime = async () => {
            const time = await backgroundRefreshService.getTimeUntilNextRefresh();
            setNextRefreshTime(time);
        };

        updateNextRefreshTime();
        const interval = setInterval(updateNextRefreshTime, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [settings]);

    // Update next refresh time periodically
    useEffect(() => {
        const updateNextRefreshTime = async () => {
            const time = await backgroundRefreshService.getTimeUntilNextRefresh();
            setNextRefreshTime(time);
        };

        updateNextRefreshTime();
        const interval = setInterval(updateNextRefreshTime, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [settings]);

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

            // Reset the background refresh timer since user manually refreshed
            await backgroundRefreshService.resetRefreshTimer();

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
            await widgetService.updateWidget(verse, chapter, appSettings);
            console.log('Widget updated successfully');
        } catch (error) {
            console.error('Failed to update widget:', error);
            // Don't show error to user as widget might not be available on all devices
        }
    };

    const handleScroll = (event: any) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const scrollDiff = currentScrollY - lastScrollY.current;

        if (scrollDiff > 5 && currentScrollY > headerHeight) {
            // Scrolling down - hide header
            Animated.timing(headerAnimatedValue, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else if (scrollDiff < -5) {
            // Scrolling up - show header
            Animated.timing(headerAnimatedValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }

        lastScrollY.current = currentScrollY;
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
        <View style={styles.container}>
            <Animated.View style={[
                styles.header,
                {
                    paddingTop: Math.max(insets.top, 20) + 20,
                    transform: [{ translateY: headerTranslateY }],
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                }
            ]}>
                <Text style={styles.title}>Quran Verses</Text>
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{
                    paddingTop: headerHeight + Math.max(insets.top, 20) + 20,
                    paddingBottom: Math.max(insets.bottom, 16)
                }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >

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

                        {/* Next Refresh Time */}
                        {nextRefreshTime && settings.refreshFrequency !== 'manual' && (
                            <View style={styles.nextRefreshContainer}>
                                <Text style={styles.nextRefreshText}>
                                    Next auto refresh in: {nextRefreshTime.hours}h {nextRefreshTime.minutes}m
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
    nextRefreshContainer: {
        backgroundColor: '#e8f5e8',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        alignItems: 'center',
    },
    nextRefreshText: {
        fontSize: 14,
        color: '#2dd36f',
        fontWeight: '500',
    },
});

export default Home;
