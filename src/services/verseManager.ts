import { quranAPI } from "./quranAPI";
import { storageService } from "./storage";
import { QuranVerse, Chapter } from "../types";

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

            // For scheduled updates, check the last update time
            // This would need timestamp tracking - simplified for now
            return true; // For now, always allow update for daily/weekly
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
