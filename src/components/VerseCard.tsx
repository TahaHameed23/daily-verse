import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
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

    const formatShareText = () => {
        let shareText = '';

        // Add Arabic text if available and shown
        if (showArabic && verse.arabic1) {
            shareText += `${verse.arabic1}\n\n`;
        }

        // Add translation if available and shown
        if (showTranslation) {
            shareText += `${getTranslationText()}\n\n`;
        }

        // Add verse reference
        shareText += `- ${chapter.surahName} ${verse.surahNo}:${verse.ayahNo}`;

        return shareText;
    };

    const handleShare = async () => {
        try {
            const shareText = formatShareText();
            const result = await Share.share({
                message: shareText,
                title: `Quran Verse - ${chapter.surahName} ${verse.surahNo}:${verse.ayahNo}`
            });
        } catch (error) {
            console.error('Error sharing verse:', error);
            Alert.alert('Error', 'Failed to share verse');
        }
    };

    const handleCopy = async () => {
        try {
            const shareText = formatShareText();
            await Clipboard.setStringAsync(shareText);
            Alert.alert('Copied', 'Verse copied to clipboard');
        } catch (error) {
            console.error('Error copying verse:', error);
            Alert.alert('Error', 'Failed to copy verse');
        }
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
                    {/* <Text style={styles.bold}>Verse:</Text> {verse.ayahNo} • {' '} */}
                    <Text style={styles.bold}>Place:</Text> {verse.revelationPlace}
                </Text>
            </View>

            {/* Share Actions */}
            <View style={styles.shareContainer}>
                <TouchableOpacity style={styles.shareButton} onPress={handleCopy}>
                    <Text style={styles.shareButtonText}>📋 Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Text style={styles.shareButtonText}>📤 Share</Text>
                </TouchableOpacity>
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
    shareContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    shareButton: {
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    shareButtonText: {
        fontSize: 14,
        color: '#495057',
        fontWeight: '500',
    },
});

export default VerseCard;