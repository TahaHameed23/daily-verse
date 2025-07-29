import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, QuranVerse, Chapter } from "../types";

class StorageService {
    private readonly SETTINGS_KEY = "app_settings";
    private readonly CURRENT_VERSE_KEY = "current_verse";
    private readonly FAVORITES_KEY = "favorite_verses";
    private readonly VERSE_SEQUENCE_KEY = "verse_sequence";
    private readonly SEQUENCE_INDEX_KEY = "sequence_index";

    /**
     * Get app settings
     */
    async getSettings(): Promise<AppSettings> {
        try {
            const value = await AsyncStorage.getItem(this.SETTINGS_KEY);
            if (value) {
                return JSON.parse(value);
            }

            // Return default settings
            return {
                refreshFrequency: "daily",
                showArabic: true,
                showTranslation: true,
                widgetTheme: "auto",
                preferredTranslation: "en.sahih",
            };
        } catch (error) {
            console.error("Failed to get settings:", error);
            // Return default settings on error
            return {
                refreshFrequency: "daily",
                showArabic: true,
                showTranslation: true,
                widgetTheme: "auto",
                preferredTranslation: "en.sahih",
            };
        }
    }

    /**
     * Save app settings
     */
    async saveSettings(settings: AppSettings): Promise<void> {
        try {
            await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error("Failed to save settings:", error);
            throw error;
        }
    }

    /**
     * Get current verse
     */
    async getCurrentVerse(): Promise<{
        verse: QuranVerse;
        chapter: Chapter;
    } | null> {
        try {
            const value = await AsyncStorage.getItem(this.CURRENT_VERSE_KEY);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error("Failed to get current verse:", error);
            return null;
        }
    }

    /**
     * Save current verse
     */
    async saveCurrentVerse(verse: QuranVerse, chapter: Chapter): Promise<void> {
        try {
            await AsyncStorage.setItem(
                this.CURRENT_VERSE_KEY,
                JSON.stringify({ verse, chapter })
            );
        } catch (error) {
            console.error("Failed to save current verse:", error);
            throw error;
        }
    }

    /**
     * Get favorite verses
     */
    async getFavoriteVerses(): Promise<
        Array<{ verse: QuranVerse; chapter: Chapter }>
    > {
        try {
            const value = await AsyncStorage.getItem(this.FAVORITES_KEY);
            return value ? JSON.parse(value) : [];
        } catch (error) {
            console.error("Failed to get favorites:", error);
            return [];
        }
    }

    /**
     * Add verse to favorites
     */
    async addToFavorites(verse: QuranVerse, chapter: Chapter): Promise<void> {
        try {
            const favorites = await this.getFavoriteVerses();
            const exists = favorites.some(
                (fav) =>
                    fav.verse.surahNo === verse.surahNo &&
                    fav.verse.ayahNo === verse.ayahNo
            );

            if (!exists) {
                favorites.push({ verse, chapter });
                await AsyncStorage.setItem(
                    this.FAVORITES_KEY,
                    JSON.stringify(favorites)
                );
            }
        } catch (error) {
            console.error("Failed to add to favorites:", error);
            throw error;
        }
    }

    /**
     * Remove verse from favorites
     */
    async removeFromFavorites(surahNo: number, ayahNo: number): Promise<void> {
        try {
            const favorites = await this.getFavoriteVerses();
            const filtered = favorites.filter(
                (fav) =>
                    !(
                        fav.verse.surahNo === surahNo &&
                        fav.verse.ayahNo === ayahNo
                    )
            );

            await AsyncStorage.setItem(this.FAVORITES_KEY, JSON.stringify(filtered));
        } catch (error) {
            console.error("Failed to remove from favorites:", error);
            throw error;
        }
    }

    /**
     * Save verse sequence for shuffled order
     */
    async saveVerseSequence(
        sequence: Array<{ chapter: number; verse: number }>
    ): Promise<void> {
        try {
            await AsyncStorage.setItem(
                this.VERSE_SEQUENCE_KEY,
                JSON.stringify(sequence)
            );
        } catch (error) {
            console.error("Failed to save verse sequence:", error);
            throw error;
        }
    }

    /**
     * Get verse sequence
     */
    async getVerseSequence(): Promise<Array<{
        chapter: number;
        verse: number;
    }> | null> {
        try {
            const value = await AsyncStorage.getItem(this.VERSE_SEQUENCE_KEY);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error("Failed to get verse sequence:", error);
            return null;
        }
    }

    /**
     * Get current sequence index
     */
    async getSequenceIndex(): Promise<number> {
        try {
            const value = await AsyncStorage.getItem(this.SEQUENCE_INDEX_KEY);
            return value ? parseInt(value, 10) : 0;
        } catch (error) {
            console.error("Failed to get sequence index:", error);
            return 0;
        }
    }

    /**
     * Save current sequence index
     */
    async saveSequenceIndex(index: number): Promise<void> {
        try {
            await AsyncStorage.setItem(
                this.SEQUENCE_INDEX_KEY,
                index.toString()
            );
        } catch (error) {
            console.error("Failed to save sequence index:", error);
            throw error;
        }
    }

    /**
     * Clear all data
     */
    async clearAllData(): Promise<void> {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error("Failed to clear data:", error);
            throw error;
        }
    }
}

export const storageService = new StorageService();
