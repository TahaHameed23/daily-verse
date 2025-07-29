import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';

import { storageService } from '../services/storage';
import { verseManager } from '../services/verseManager';
import { AppSettings } from '../types';

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
        <View>
            <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setIsOpen(true)}
            >
                <Text style={styles.pickerText}>
                    {selectedOption?.props.label || selectedValue}
                </Text>
                <Text style={styles.pickerArrow}>▼</Text>
            </TouchableOpacity>

            {isOpen && (
                <View style={styles.pickerOptions}>
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.pickerOption,
                                option.props.value === selectedValue && styles.selectedOption
                            ]}
                            onPress={() => {
                                onValueChange(option.props.value);
                                setIsOpen(false);
                            }}
                        >
                            <Text style={[
                                styles.pickerOptionText,
                                option.props.value === selectedValue && styles.selectedOptionText
                            ]}>
                                {option.props.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const PickerItem: React.FC<{ label: string; value: string }> = ({ label, value }) => null;

const Settings: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
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
                <View style={styles.header}>
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
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
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
                </View>

                {/* Widget Settings */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Widget Settings</Text>

                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Show Arabic in Widget</Text>
                        <Switch
                            value={settings.showArabic}
                            onValueChange={(value) => updateSetting('showArabic', value)}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={settings.showArabic ? '#0066cc' : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Show Translation in Widget</Text>
                        <Switch
                            value={settings.showTranslation}
                            onValueChange={(value) => updateSetting('showTranslation', value)}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={settings.showTranslation ? '#0066cc' : '#f4f3f4'}
                        />
                    </View>
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
                    <Text style={styles.aboutText}>Data source: QuranAPI</Text>
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
    pickerOptions: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        zIndex: 1000,
        elevation: 5,
    },
    pickerOption: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedOption: {
        backgroundColor: '#e3f2fd',
    },
    pickerOptionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedOptionText: {
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
});

export default Settings;
