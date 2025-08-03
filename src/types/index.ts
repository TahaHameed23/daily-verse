export interface QuranVerse {
    surahName: string;
    surahNameArabic: string;
    surahNameArabicLong: string;
    surahNameTranslation: string;
    revelationPlace: string;
    totalAyah: number;
    surahNo: number;
    ayahNo: number;
    audio: {
        [key: string]: {
            reciter: string;
            url: string;
            originalUrl: string;
        };
    };
    english: string;
    arabic1: string; // With Tashkeel
    arabic2: string; // Without Tashkeel
    bengali: string;
    urdu: string;
}

export interface Chapter {
    surahName: string;
    surahNameArabic: string;
    surahNameArabicLong: string;
    surahNameTranslation: string;
    revelationPlace: string;
    totalAyah: number;
    surahNo?: number;
    audio?: {
        [key: string]: {
            reciter: string;
            url: string;
            originalUrl: string;
        };
    };
    english?: string[];
    arabic1?: string[];
    arabic2?: string[];
    bengali?: string[];
    urdu?: string[];
}

export interface VerseDisplayData {
    verse: QuranVerse;
    chapter: Chapter;
    showArabic: boolean;
    showTranslation: boolean;
}

export interface AppSettings {
    refreshFrequency: "hourly" | "every2hours" | "daily" | "weekly" | "manual";
    showArabic: boolean;
    showTranslation: boolean;
    widgetTheme: "light" | "dark" | "auto";
    preferredTranslation: string;
}
