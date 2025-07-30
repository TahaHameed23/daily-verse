import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { WidgetPreview } from 'react-native-android-widget';
import { QuranWidget } from '../components/QuranWidget';

export function WidgetPreviewScreen() {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Widget Preview</Text>

            <Text style={styles.subtitle}>With Arabic and Translation</Text>
            <WidgetPreview
                renderWidget={() => (
                    <QuranWidget
                        chapterInfo="Al-Fatiha 1:1"
                        arabicText="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
                        translationText="In the name of Allah, the Entirely Merciful, the Especially Merciful."
                        showArabic={true}
                        showTranslation={true}
                    />
                )}
                width={320}
                height={140}
            />

            <Text style={styles.subtitle}>Translation Only</Text>
            <WidgetPreview
                renderWidget={() => (
                    <QuranWidget
                        chapterInfo="Al-Fatiha 1:1"
                        arabicText="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
                        translationText="In the name of Allah, the Entirely Merciful, the Especially Merciful."
                        showArabic={false}
                        showTranslation={true}
                    />
                )}
                width={320}
                height={140}
            />

            <Text style={styles.subtitle}>Arabic Only</Text>
            <WidgetPreview
                renderWidget={() => (
                    <QuranWidget
                        chapterInfo="Al-Fatiha 1:1"
                        arabicText="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
                        translationText="In the name of Allah, the Entirely Merciful, the Especially Merciful."
                        showArabic={true}
                        showTranslation={false}
                    />
                )}
                width={320}
                height={140}
            />

            <Text style={styles.subtitle}>Loading State</Text>
            <WidgetPreview
                renderWidget={() => (
                    <QuranWidget
                        chapterInfo="Loading..."
                        arabicText=""
                        translationText="Loading verse..."
                        showArabic={true}
                        showTranslation={true}
                    />
                )}
                width={320}
                height={140}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 10,
        color: '#333',
    },
});
