import axios from "axios";
import { QuranVerse, Chapter } from "../types";

const BASE_URL = "https://quranapi.pages.dev/api";

class QuranAPIService {
    private async makeRequest<T>(endpoint: string): Promise<T> {
        try {
            const response = await axios.get(`${BASE_URL}${endpoint}`);
            return response.data;
        } catch (error) {
            console.error("API request failed:", error);
            throw new Error("Failed to fetch data from Quran API");
        }
    }

    /**
     * Get a specific verse by chapter and verse number
     */
    async getVerse(
        chapterNumber: number,
        verseNumber: number
    ): Promise<QuranVerse> {
        const endpoint = `/${chapterNumber}/${verseNumber}.json`;
        return this.makeRequest<QuranVerse>(endpoint);
    }

    /**
     * Get all verses from a specific chapter
     */
    async getChapterVerses(chapterNumber: number): Promise<Chapter> {
        const endpoint = `/${chapterNumber}.json`;
        return this.makeRequest<Chapter>(endpoint);
    }

    /**
     * Get chapter information (same as getting all verses)
     */
    async getChapter(chapterNumber: number): Promise<Chapter> {
        const endpoint = `/${chapterNumber}.json`;
        return this.makeRequest<Chapter>(endpoint);
    }

    /**
     * Get all chapters
     */
    async getAllChapters(): Promise<Chapter[]> {
        const endpoint = "/surah.json";
        return this.makeRequest<Chapter[]>(endpoint);
    }

    /**
     * Get a random verse from the entire Quran
     */
    async getRandomVerse(): Promise<{ verse: QuranVerse; chapter: Chapter }> {
        try {
            // Get total number of chapters (114)
            const totalChapters = 114;

            // Generate random chapter number
            const randomChapter = Math.floor(Math.random() * totalChapters) + 1;

            // Get chapter info to know how many verses it has
            const chapter = await this.getChapter(randomChapter);

            // Generate random verse number within the chapter
            const randomVerseNumber =
                Math.floor(Math.random() * chapter.totalAyah) + 1;

            // Get the specific verse
            const verse = await this.getVerse(randomChapter, randomVerseNumber);

            return { verse, chapter };
        } catch (error) {
            console.error("Failed to get random verse:", error);
            throw error;
        }
    }

    /**
     * Get verses in a sequential shuffled order
     * This maintains a sequence but shuffles the order for variety
     */
    async getShuffledVerseSequence(): Promise<
        Array<{ chapter: number; verse: number }>
    > {
        try {
            const chapters = await this.getAllChapters();
            const allVerseReferences: Array<{
                chapter: number;
                verse: number;
            }> = [];

            // Create array of all verse references
            chapters.forEach((chapter, index) => {
                const chapterNumber = index + 1; // Chapters are 1-indexed
                for (let verse = 1; verse <= chapter.totalAyah; verse++) {
                    allVerseReferences.push({ chapter: chapterNumber, verse });
                }
            });

            // Shuffle the array using Fisher-Yates algorithm
            for (let i = allVerseReferences.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allVerseReferences[i], allVerseReferences[j]] = [
                    allVerseReferences[j],
                    allVerseReferences[i],
                ];
            }

            return allVerseReferences;
        } catch (error) {
            console.error("Failed to generate shuffled sequence:", error);
            throw error;
        }
    }
}

export const quranAPI = new QuranAPIService();
