import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QuranVerse, Chapter } from '../types';

interface VerseCardProps {
    verse: QuranVerse;
    chapter: Chapter;
    showArabic: boolean;
    showTranslation: boolean;
}

const VerseCard: React.FC<VerseCardProps> = ({
    verse,
    chapter,
    showArabic,
    showTranslation
}) => {
    const getTranslationText = () => {
        return verse.english || 'Translation not available';
    };

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.chapterName}>{chapter.surahName}</Text>
                <View style={styles.verseTag}>
                    <Text style={styles.verseTagText}>{verse.surahNo}:{verse.ayahNo}</Text>
                </View>
            </View>

            {/* Arabic Text */}
            {showArabic && (
                <View style={styles.arabicContainer}>
                    <Text style={styles.arabicText}>
                        {verse.arabic1}
                    </Text>
                </View>
            )}

            {/* Translation */}
            {showTranslation && (
                <View style={styles.translationContainer}>
                    <Text style={styles.translationText}>
                        {getTranslationText()}
                    </Text>
                </View>
            )}

            {/* Chapter Info */}
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                    <Text style={styles.bold}>Surah:</Text> {chapter.surahNameArabic} ({chapter.surahName}) • {' '}
                    <Text style={styles.bold}>Verse:</Text> {verse.ayahNo} • {' '}
                    <Text style={styles.bold}>Place:</Text> {verse.revelationPlace}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    chapterName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    verseTag: {
        backgroundColor: '#2dd36f',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    verseTagText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    arabicContainer: {
        marginBottom: 16,
    },
    arabicText: {
        fontSize: 24,
        lineHeight: 40,
        textAlign: 'right',
        color: '#2dd36f',
        fontFamily: 'serif', // Fallback for Arabic font
        writingDirection: 'rtl',
    },
    translationContainer: {
        marginBottom: 16,
    },
    translationText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#666',
        textAlign: 'left',
    },
    infoContainer: {
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    infoText: {
        fontSize: 14,
        color: '#999',
        lineHeight: 20,
    },
    bold: {
        fontWeight: 'bold',
        color: '#666',
    },
});

export default VerseCard;