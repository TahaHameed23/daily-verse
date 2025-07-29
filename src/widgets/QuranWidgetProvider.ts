import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { storageService } from '../services/storage';
import { verseManager } from '../services/verseManager';
import { QuranVerse, Chapter, AppSettings } from '../types';

// This is a simplified widget component for actual home screen widgets
// It would be used by native widget providers on Android/iOS

export class QuranWidgetProvider {
    static async getWidgetData() {
        try {
            const settings = await storageService.getSettings();
            const verseData = await verseManager.getCurrentOrNextVerse();
            
            return {
                verse: verseData.verse,
                chapter: verseData.chapter,
                settings: settings,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Failed to get widget data:', error);
            return null;
        }
    }

    static async refreshWidget() {
        try {
            const newVerse = await verseManager.getNextVerse();
            return {
                verse: newVerse.verse,
                chapter: newVerse.chapter,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Failed to refresh widget:', error);
            return null;
        }
    }

    static formatWidgetText(verse: QuranVerse, chapter: Chapter, settings: AppSettings) {
        let text = '';
        
        // Add chapter info
        text += `${chapter.surahName} ${verse.surahNo}:${verse.ayahNo}\n\n`;
        
        // Add Arabic if enabled
        if (settings.showArabic) {
            text += `${verse.arabic1}\n\n`;
        }
        
        // Add translation if enabled
        if (settings.showTranslation) {
            text += verse.english;
        }
        
        return text.trim();
    }
}

// Simple widget configuration
export const WidgetConfig = {
    sizes: {
        small: { width: 160, height: 160 },
        medium: { width: 320, height: 160 },
        large: { width: 320, height: 320 }
    },
    
    themes: {
        light: {
            backgroundColor: '#ffffff',
            textColor: '#333333',
            headerColor: '#666666',
            borderColor: '#e0e0e0'
        },
        dark: {
            backgroundColor: '#1e1e1e',
            textColor: '#ffffff',
            headerColor: '#cccccc',
            borderColor: '#333333'
        }
    },
    
    fonts: {
        arabic: {
            fontSize: 16,
            fontWeight: '500',
            textAlign: 'right' as const
        },
        translation: {
            fontSize: 14,
            fontWeight: 'normal',
            textAlign: 'left' as const
        },
        header: {
            fontSize: 12,
            fontWeight: '600',
            opacity: 0.7
        }
    }
};

export default QuranWidgetProvider;
