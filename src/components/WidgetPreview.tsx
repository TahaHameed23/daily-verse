import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QuranVerse, Chapter, AppSettings } from '../types';

interface WidgetPreviewProps {
    verse: QuranVerse;
    chapter: Chapter;
    settings: AppSettings;
}

const WidgetPreview: React.FC<WidgetPreviewProps> = ({ verse, chapter, settings }) => {
    return (
        <View style={styles.widget}>
            <Text style={styles.label}>Widget Preview (350dp x 250dp - Resizable)</Text>
            <View style={styles.widgetContent}>
                {/* Chapter info */}
                <Text style={styles.chapterInfo}>
                    {chapter.surahName} {verse.surahNo}:{verse.ayahNo}
                </Text>

                {/* Arabic text */}
                {settings.showArabic && verse.arabic1 && (
                    <Text
                        style={styles.arabicText}
                        numberOfLines={8}
                        ellipsizeMode="tail"
                    >
                        {verse.arabic1}
                    </Text>
                )}

                {/* Translation */}
                {settings.showTranslation && (
                    <Text
                        style={styles.translationText}
                        numberOfLines={6}
                        ellipsizeMode="tail"
                    >
                        {verse.english || "Translation not available"}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    widget: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        textAlign: 'center',
    },
    widgetContent: {
        // Simulating 350dp x 250dp widget size
        width: 350,
        height: 250,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
        justifyContent: 'flex-start',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignSelf: 'center',
        overflow: 'hidden',
    },
    chapterInfo: {
        fontSize: 13,
        color: '#666666',
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 8,
        flexShrink: 0,
    },
    arabicText: {
        fontSize: 16,
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '500',
        lineHeight: 22,
        flex: 1,
    },
    translationText: {
        fontSize: 14,
        color: '#34495e',
        textAlign: 'center',
        marginBottom: 4,
        lineHeight: 18,
        flex: 1,
    },
});

export default WidgetPreview;
