import { quranAPI } from "./quranAPI";
import { storageService } from "./storage";
import { QuranVerse, Chapter } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

class VerseManagerService {
    /**
     * Get the next verse in the shuffled sequence
     */
    async getNextVerse(): Promise<{ verse: QuranVerse; chapter: Chapter }> {
        try {
            // Get current sequence and index
            let sequence = await storageService.getVerseSequence();
            let currentIndex = await storageService.getSequenceIndex();

            // If no sequence exists, create a new shuffled sequence
            if (!sequence || sequence.length === 0) {
                console.log("Creating new shuffled sequence...");
                sequence = await quranAPI.getShuffledVerseSequence();
                await storageService.saveVerseSequence(sequence);
                currentIndex = 0;
            }

            // If we've reached the end of the sequence, reshuffle
            if (currentIndex >= sequence.length) {
                console.log("Reached end of sequence, reshuffling...");
                sequence = await quranAPI.getShuffledVerseSequence();
                await storageService.saveVerseSequence(sequence);
                currentIndex = 0;
            }

            // Get the verse at current index
            const verseRef = sequence[currentIndex];
            const verse = await quranAPI.getVerse(
                verseRef.chapter,
                verseRef.verse
            );
            const chapter = await quranAPI.getChapter(verseRef.chapter);

            // Save the verse and increment index
            await storageService.saveCurrentVerse(verse, chapter);
            await storageService.saveSequenceIndex(currentIndex + 1);

            return { verse, chapter };
        } catch (error) {
            console.error("Failed to get next verse:", error);
            throw error;
        }
    }

    /**
     * Get current verse or fetch next if none exists
     */
    async getCurrentOrNextVerse(): Promise<{
        verse: QuranVerse;
        chapter: Chapter;
    }> {
        try {
            const current = await storageService.getCurrentVerse();
            if (current) {
                return current;
            }
            return await this.getNextVerse();
        } catch (error) {
            console.error("Failed to get current or next verse:", error);
            throw error;
        }
    }

    /**
     * Force refresh to get a new verse
     */
    async refreshVerse(): Promise<{ verse: QuranVerse; chapter: Chapter }> {
        try {
            return await this.getNextVerse();
        } catch (error) {
            console.error("Failed to refresh verse:", error);
            throw error;
        }
    }

    /**
     * Check if it's time to update the verse based on settings
     */
    async shouldUpdateVerse(): Promise<boolean> {
        try {
            const settings = await storageService.getSettings();
            const current = await storageService.getCurrentVerse();

            if (!current) {
                return true; // No current verse, should update
            }

            if (settings.refreshFrequency === "manual") {
                return false; // Manual refresh only
            }

            // Check the last auto-refresh timestamp
            const lastAutoRefresh = await AsyncStorage.getItem(
                "lastAutoRefresh"
            );
            if (!lastAutoRefresh) {
                return true; // No previous auto-refresh, should update
            }

            const lastRefreshTime = parseInt(lastAutoRefresh);
            const now = Date.now();
            const timeSinceLastRefresh = now - lastRefreshTime;

            // Calculate refresh interval based on settings
            let refreshInterval: number;
            switch (settings.refreshFrequency) {
                case "hourly":
                    refreshInterval = 60 * 60 * 1000; // 1 hour
                    break;
                case "every2hours":
                    refreshInterval = 2 * 60 * 60 * 1000; // 2 hours
                    break;
                case "daily":
                    refreshInterval = 24 * 60 * 60 * 1000; // 24 hours
                    break;
                case "weekly":
                    refreshInterval = 7 * 24 * 60 * 60 * 1000; // 7 days
                    break;
                default:
                    refreshInterval = 2 * 60 * 60 * 1000; // Default to 2 hours
            }

            return timeSinceLastRefresh >= refreshInterval;
        } catch (error) {
            console.error("Failed to check if should update verse:", error);
            return true; // Default to updating on error
        }
    }

    /**
     * Get a random verse (bypass sequence)
     */
    async getRandomVerse(): Promise<{ verse: QuranVerse; chapter: Chapter }> {
        try {
            const result = await quranAPI.getRandomVerse();
            await storageService.saveCurrentVerse(result.verse, result.chapter);
            return result;
        } catch (error) {
            console.error("Failed to get random verse:", error);
            throw error;
        }
    }

    /**
     * Reset the sequence (useful for testing or user request)
     */
    async resetSequence(): Promise<void> {
        try {
            const newSequence = await quranAPI.getShuffledVerseSequence();
            await storageService.saveVerseSequence(newSequence);
            await storageService.saveSequenceIndex(0);
        } catch (error) {
            console.error("Failed to reset sequence:", error);
            throw error;
        }
    }
}

export const verseManager = new VerseManagerService();
