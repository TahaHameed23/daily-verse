import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    ActivityIndicator,
    Platform,
    Modal,
    Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { storageService } from '../services/storage';
import { verseManager } from '../services/verseManager';
import { widgetService } from '../services/widgetService';
import { AppSettings } from '../types';
import Widget from '../components/Widget';

// Simple picker component for React Native
const SimplePicker: React.FC<{
    selectedValue: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
}> = ({ selectedValue, onValueChange, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const options = React.Children.toArray(children) as React.ReactElement<{ label: string; value: string }>[];

    const selectedOption = options.find(option => option.props.value === selectedValue);

    return (
        <>
            <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setIsOpen(true)}
            >
                <Text style={styles.pickerText}>
                    {selectedOption?.props.label || selectedValue}
                </Text>
                <Text style={styles.pickerArrow}>▼</Text>
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Option</Text>
                        {options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.modalOption,
                                    option.props.value === selectedValue && styles.selectedModalOption
                                ]}
                                onPress={() => {
                                    onValueChange(option.props.value);
                                    setIsOpen(false);
                                }}
                            >
                                <Text style={[
                                    styles.modalOptionText,
                                    option.props.value === selectedValue && styles.selectedModalOptionText
                                ]}>
                                    {option.props.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const PickerItem: React.FC<{ label: string; value: string }> = ({ label, value }) => null;

const Settings: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [widgetSectionExpanded, setWidgetSectionExpanded] = useState(false);
    const insets = useSafeAreaInsets();

    // Header animation
    const headerHeight = 80;
    const headerAnimatedValue = useRef(new Animated.Value(0)).current;
    const lastScrollY = useRef(0);

    const headerTranslateY = headerAnimatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -headerHeight],
        extrapolate: 'clamp',
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const showToast = (message: string) => {
        Alert.alert('Info', message);
    };

    const showAlert = (title: string, message: string, buttons: any[]) => {
        Alert.alert(title, message, buttons);
    };

    const loadSettings = async () => {
        try {
            const appSettings = await storageService.getSettings();
            setSettings(appSettings);
        } catch (error) {
            console.error('Failed to load settings:', error);
            showToast('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (key: keyof AppSettings, value: any) => {
        if (!settings) return;

        const newSettings = { ...settings, [key]: value };
        try {
            await storageService.saveSettings(newSettings);
            setSettings(newSettings);
            showToast('Settings saved');

            // Update widget if Arabic/Translation settings changed
            if (key === 'showArabic' || key === 'showTranslation') {
                try {
                    const currentVerse = await verseManager.getCurrentOrNextVerse();
                    if (currentVerse) {
                        await widgetService.updateWidget(currentVerse.verse, currentVerse.chapter, newSettings);
                    }
                } catch (error) {
                    console.error('Failed to update widget:', error);
                    // Don't show error to user as widget might not be available
                }
            }
        } catch (error) {
            console.error('Failed to save setting:', error);
            showToast('Failed to save settings');
        }
    };

    const resetSequence = async () => {
        showAlert(
            'Reset Sequence',
            'This will shuffle the verse order and start from the beginning. Are you sure?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Reset',
                    onPress: async () => {
                        try {
                            await verseManager.resetSequence();
                            showToast('Verse sequence reset and shuffled');
                        } catch (error) {
                            showToast('Failed to reset sequence');
                        }
                    }
                }
            ]
        );
    };

    const clearAllData = async () => {
        showAlert(
            'Clear All Data',
            'This will delete all your settings, favorites, and verse history. This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await storageService.clearAllData();
                            // Reload default settings
                            await loadSettings();
                            showToast('All data cleared');
                        } catch (error) {
                            showToast('Failed to clear data');
                        }
                    }
                }
            ]
        );
    };

    const handleScroll = (event: any) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const scrollDiff = currentScrollY - lastScrollY.current;

        if (scrollDiff > 5 && currentScrollY > headerHeight) {
            // Scrolling down - hide header
            Animated.timing(headerAnimatedValue, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else if (scrollDiff < -5) {
            // Scrolling up - show header
            Animated.timing(headerAnimatedValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }

        lastScrollY.current = currentScrollY;
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 15 }]}>
                    <Text style={styles.headerTitle}>Settings</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0066cc" />
                    <Text style={styles.loadingText}>Loading settings...</Text>
                </View>
            </View>
        );
    }

    if (!settings) {
        return (
            <View style={styles.container}>
                <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 15 }]}>
                    <Text style={styles.headerTitle}>Settings</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorText}>Failed to load settings</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Animated.View style={[
                styles.header,
                {
                    paddingTop: Math.max(insets.top, 20) + 15,
                    transform: [{ translateY: headerTranslateY }],
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                }
            ]}>
                <Text style={styles.headerTitle}>Settings</Text>
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.content,
                    { paddingTop: headerHeight + Math.max(insets.top, 20) + 15 }
                ]}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {/* Display Settings */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Display Settings</Text>

                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Show Arabic Text</Text>
                        <Switch
                            value={settings.showArabic}
                            onValueChange={(value) => updateSetting('showArabic', value)}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={settings.showArabic ? '#0066cc' : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Show Translation</Text>
                        <Switch
                            value={settings.showTranslation}
                            onValueChange={(value) => updateSetting('showTranslation', value)}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={settings.showTranslation ? '#0066cc' : '#f4f3f4'}
                        />
                    </View>

                </View>

                {/* Widget Settings */}
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.expandableHeader}
                        onPress={() => setWidgetSectionExpanded(!widgetSectionExpanded)}
                    >
                        <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Widget Settings</Text>
                        <Text style={styles.expandArrow}>
                            {widgetSectionExpanded ? '▼' : '▶'}
                        </Text>
                    </TouchableOpacity>

                    {widgetSectionExpanded && (
                        <View style={styles.expandableContent}>
                            <View style={styles.settingItem}>
                                <Text style={styles.settingLabel}>Widget Theme</Text>
                                <SimplePicker
                                    selectedValue={settings.widgetTheme}
                                    onValueChange={(value) => updateSetting('widgetTheme', value)}
                                >
                                    <PickerItem label="Light" value="light" />
                                    <PickerItem label="Dark" value="dark" />
                                    <PickerItem label="Auto" value="auto" />
                                </SimplePicker>
                            </View>

                            <View style={styles.settingItem}>
                                <Text style={styles.settingLabel}>Show Arabic Text in Widget</Text>
                                <Switch
                                    value={settings.showArabic}
                                    onValueChange={(value) => updateSetting('showArabic', value)}
                                    trackColor={{ false: '#767577', true: '#2dd36f' }}
                                    thumbColor={settings.showArabic ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>

                            <View style={styles.settingItem}>
                                <Text style={styles.settingLabel}>Show Translation in Widget</Text>
                                <Switch
                                    value={settings.showTranslation}
                                    onValueChange={(value) => updateSetting('showTranslation', value)}
                                    trackColor={{ false: '#767577', true: '#2dd36f' }}
                                    thumbColor={settings.showTranslation ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>

                            <Text style={styles.sectionSubtitle}>Widget Preview</Text>

                            <View style={styles.widgetContainer}>
                                <Text style={styles.widgetLabel}>Small Widget</Text>
                                <Widget size="small" theme={settings.widgetTheme} />

                                <Text style={styles.widgetLabel}>Medium Widget</Text>
                                <Widget size="medium" theme={settings.widgetTheme} />

                                <Text style={styles.widgetLabel}>Large Widget</Text>
                                <Widget size="large" theme={settings.widgetTheme} />
                            </View>

                            <TouchableOpacity
                                style={[styles.button, styles.buttonOutline]}
                                onPress={() => {
                                    if (Platform.OS === 'android') {
                                        Alert.alert(
                                            'Android Widget Setup',
                                            '1. Long press on your home screen\n2. Tap "Widgets"\n3. Find "Quran Verses" widget\n4. Drag it to your home screen\n5. Choose your preferred size'
                                        );
                                    } else if (Platform.OS === 'ios') {
                                        Alert.alert(
                                            'iOS Widget Setup',
                                            '1. Long press on your home screen\n2. Tap the "+" button\n3. Search for "Quran Verses"\n4. Choose your widget size\n5. Tap "Add Widget"'
                                        );
                                    }
                                }}
                            >
                                <Text style={styles.buttonText}>📱 How to Add Widget</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Refresh Settings */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Refresh Settings</Text>

                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Refresh Frequency</Text>
                        <SimplePicker
                            selectedValue={settings.refreshFrequency}
                            onValueChange={(value) => updateSetting('refreshFrequency', value)}
                        >
                            <PickerItem label="Daily" value="daily" />
                            <PickerItem label="Weekly" value="weekly" />
                            <PickerItem label="Manual Only" value="manual" />
                        </SimplePicker>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Actions</Text>

                    <TouchableOpacity
                        style={[styles.button, styles.buttonOutline]}
                        onPress={resetSequence}
                    >
                        <Text style={styles.buttonText}>🔀 Reset Verse Sequence</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.buttonDanger]}
                        onPress={clearAllData}
                    >
                        <Text style={styles.buttonTextDanger}>🗑️ Clear All Data</Text>
                    </TouchableOpacity>
                </View>

                {/* About */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>About</Text>
                    <Text style={styles.aboutText}>Quran Verses Widget v1.0.0</Text>
                    <Text style={styles.aboutText}>A beautiful way to read random Quran verses daily.</Text>
                    <TouchableOpacity
                        onPress={() => {
                            import('react-native').then(({ Linking }) => {
                                Linking.openURL('https://quranapi.pages.dev/');
                            });
                        }}
                    >
                        <Text>
                            Source:
                            <Text style={[styles.aboutText, { color: '#0066cc', textDecorationLine: 'underline' }]}>
                                QuranAPI
                            </Text>

                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
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
        paddingBottom: 15,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#d32f2f',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    settingLabel: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        backgroundColor: 'white',
        minWidth: 120,
    },
    pickerText: {
        fontSize: 16,
        color: '#333',
    },
    pickerArrow: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        minWidth: 200,
        maxWidth: 300,
        marginHorizontal: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 4,
        marginBottom: 4,
    },
    selectedModalOption: {
        backgroundColor: '#e3f2fd',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    selectedModalOptionText: {
        color: '#0066cc',
        fontWeight: '500',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 6,
        marginBottom: 8,
        alignItems: 'center',
    },
    buttonOutline: {
        borderWidth: 1,
        borderColor: '#0066cc',
        backgroundColor: 'white',
    },
    buttonDanger: {
        borderWidth: 1,
        borderColor: '#d32f2f',
        backgroundColor: 'white',
    },
    buttonText: {
        fontSize: 16,
        color: '#0066cc',
        fontWeight: '500',
    },
    buttonTextDanger: {
        fontSize: 16,
        color: '#d32f2f',
        fontWeight: '500',
    },
    aboutText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
        lineHeight: 20,
    },
    expandableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    expandArrow: {
        fontSize: 18,
        color: '#666',
        fontWeight: 'bold',
        lineHeight: 22,
    },
    expandableContent: {
        marginTop: 16,
    },
    sectionSubtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginVertical: 12,
    },
    widgetContainer: {
        marginVertical: 8,
    },
    widgetLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
});

export default Settings;
