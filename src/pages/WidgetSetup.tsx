import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Platform
} from 'react-native';

import Widget from '../components/Widget';

const WidgetSetup: React.FC = () => {
    const openWidgetSettings = () => {
        if (Platform.OS === 'android') {
            // Android widget setup instructions
            alert('Android Widget Setup:\n\n1. Long press on your home screen\n2. Tap "Widgets"\n3. Find "Quran Verses" widget\n4. Drag it to your home screen\n5. Choose your preferred size');
        } else if (Platform.OS === 'ios') {
            // iOS widget setup instructions
            alert('iOS Widget Setup:\n\n1. Long press on your home screen\n2. Tap the "+" button\n3. Search for "Quran Verses"\n4. Choose your widget size\n5. Tap "Add Widget"');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Widget Setup</Text>
                <Text style={styles.subtitle}>Add Quran verses to your home screen</Text>
            </View>

            {/* Widget Preview */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preview</Text>
                <Text style={styles.sectionSubtitle}>How your widget will look</Text>
                
                <View style={styles.widgetContainer}>
                    <Text style={styles.widgetLabel}>Small Widget</Text>
                    <Widget size="small" theme="light" />
                    
                    <Text style={styles.widgetLabel}>Medium Widget</Text>
                    <Widget size="medium" theme="light" />
                    
                    <Text style={styles.widgetLabel}>Large Widget</Text>
                    <Widget size="large" theme="light" />
                </View>
            </View>

            {/* Dark Theme Preview */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dark Theme</Text>
                
                <View style={styles.widgetContainer}>
                    <Widget size="medium" theme="dark" />
                </View>
            </View>

            {/* Setup Instructions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Setup Instructions</Text>
                
                <View style={styles.instructionCard}>
                    <Text style={styles.stepNumber}>1</Text>
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Long press on home screen</Text>
                        <Text style={styles.stepDescription}>
                            Press and hold on an empty area of your home screen
                        </Text>
                    </View>
                </View>

                <View style={styles.instructionCard}>
                    <Text style={styles.stepNumber}>2</Text>
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Find widgets</Text>
                        <Text style={styles.stepDescription}>
                            Look for "Widgets" option or "+" button
                        </Text>
                    </View>
                </View>

                <View style={styles.instructionCard}>
                    <Text style={styles.stepNumber}>3</Text>
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Add Quran Verses widget</Text>
                        <Text style={styles.stepDescription}>
                            Search for "Quran Verses" and drag to your home screen
                        </Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.setupButton}
                    onPress={openWidgetSettings}
                >
                    <Text style={styles.setupButtonText}>📱 Open Widget Settings</Text>
                </TouchableOpacity>
            </View>

            {/* Features */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Widget Features</Text>
                
                <View style={styles.featureList}>
                    <Text style={styles.feature}>📖 Daily verse updates</Text>
                    <Text style={styles.feature}>🌙 Arabic text display</Text>
                    <Text style={styles.feature}>🔤 English translation</Text>
                    <Text style={styles.feature}>🔄 Tap to refresh</Text>
                    <Text style={styles.feature}>❤️ Add to favorites</Text>
                    <Text style={styles.feature}>🌓 Light & dark themes</Text>
                    <Text style={styles.feature}>📏 Multiple sizes</Text>
                </View>
            </View>

            {/* Settings Note */}
            <View style={styles.noteCard}>
                <Text style={styles.noteIcon}>⚙️</Text>
                <Text style={styles.noteText}>
                    Customize what appears in your widget by adjusting the display settings in the Settings tab
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#0066cc',
        paddingTop: Platform.OS === 'ios' ? 44 : 25,
        paddingBottom: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#e3f2fd',
    },
    section: {
        backgroundColor: 'white',
        margin: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    widgetContainer: {
        alignItems: 'center',
    },
    widgetLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    instructionCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    stepNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: '#0066cc',
        width: 32,
        height: 32,
        textAlign: 'center',
        lineHeight: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    stepDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    setupButton: {
        backgroundColor: '#0066cc',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    setupButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    featureList: {
        gap: 8,
    },
    feature: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    noteCard: {
        backgroundColor: '#fff3cd',
        margin: 16,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffeaa7',
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    noteIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    noteText: {
        flex: 1,
        fontSize: 14,
        color: '#856404',
        lineHeight: 20,
    },
});

export default WidgetSetup;
