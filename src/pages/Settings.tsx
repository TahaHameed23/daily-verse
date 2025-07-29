import React, { useState, useEffect } from 'react';
import {
    IonContent,
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonLabel,
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonList,
    IonText,
    useIonToast,
    useIonAlert
} from '@ionic/react';
import {
    refreshOutline,
    trashOutline,
    shuffleOutline,
    homeOutline
} from 'ionicons/icons';

import { storageService } from '../services/storage';
import { verseManager } from '../services/verseManager';
import { AppSettings } from '../types';

const Settings: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [presentToast] = useIonToast();
    const [presentAlert] = useIonAlert();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const appSettings = await storageService.getSettings();
            setSettings(appSettings);
        } catch (error) {
            console.error('Failed to load settings:', error);
            presentToast({
                message: 'Failed to load settings',
                duration: 3000,
                color: 'danger'
            });
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
            presentToast({
                message: 'Settings saved',
                duration: 2000,
                color: 'success'
            });
        } catch (error) {
            console.error('Failed to save setting:', error);
            presentToast({
                message: 'Failed to save settings',
                duration: 3000,
                color: 'danger'
            });
        }
    };

    const resetSequence = async () => {
        presentAlert({
            header: 'Reset Sequence',
            message: 'This will shuffle the verse order and start from the beginning. Are you sure?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Reset',
                    handler: async () => {
                        try {
                            await verseManager.resetSequence();
                            presentToast({
                                message: 'Verse sequence reset and shuffled',
                                duration: 3000,
                                color: 'success'
                            });
                        } catch (error) {
                            presentToast({
                                message: 'Failed to reset sequence',
                                duration: 3000,
                                color: 'danger'
                            });
                        }
                    }
                }
            ]
        });
    };

    const clearAllData = async () => {
        presentAlert({
            header: 'Clear All Data',
            message: 'This will delete all your settings, favorites, and verse history. This action cannot be undone.',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: async () => {
                        try {
                            await storageService.clearAllData();
                            // Reload default settings
                            await loadSettings();
                            presentToast({
                                message: 'All data cleared',
                                duration: 3000,
                                color: 'success'
                            });
                        } catch (error) {
                            presentToast({
                                message: 'Failed to clear data',
                                duration: 3000,
                                color: 'danger'
                            });
                        }
                    }
                }
            ]
        });
    };

    if (!settings) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar color="primary">
                        <IonTitle>Settings</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <div style={{ padding: '16px' }}>
                        <IonText>Loading settings...</IonText>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>Settings</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <div style={{ padding: '16px' }}>
                    {/* Display Settings */}
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>Display Settings</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonList>
                                <IonItem>
                                    <IonLabel>Show Arabic Text</IonLabel>
                                    <IonToggle
                                        checked={settings.showArabic}
                                        onIonChange={(e) => updateSetting('showArabic', e.detail.checked)}
                                    />
                                </IonItem>
                                <IonItem>
                                    <IonLabel>Show Translation</IonLabel>
                                    <IonToggle
                                        checked={settings.showTranslation}
                                        onIonChange={(e) => updateSetting('showTranslation', e.detail.checked)}
                                    />
                                </IonItem>
                                <IonItem>
                                    <IonLabel>Widget Theme</IonLabel>
                                    <IonSelect
                                        value={settings.widgetTheme}
                                        onSelectionChange={(e) => updateSetting('widgetTheme', e.detail.value)}
                                    >
                                        <IonSelectOption value="light">Light</IonSelectOption>
                                        <IonSelectOption value="dark">Dark</IonSelectOption>
                                        <IonSelectOption value="auto">Auto</IonSelectOption>
                                    </IonSelect>
                                </IonItem>
                            </IonList>
                        </IonCardContent>
                    </IonCard>

                    {/* Refresh Settings */}
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>Refresh Settings</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonList>
                                <IonItem>
                                    <IonLabel>Refresh Frequency</IonLabel>
                                    <IonSelect
                                        value={settings.refreshFrequency}
                                        onSelectionChange={(e) => updateSetting('refreshFrequency', e.detail.value)}
                                    >
                                        <IonSelectOption value="daily">Daily</IonSelectOption>
                                        <IonSelectOption value="weekly">Weekly</IonSelectOption>
                                        <IonSelectOption value="manual">Manual Only</IonSelectOption>
                                    </IonSelect>
                                </IonItem>
                            </IonList>
                        </IonCardContent>
                    </IonCard>

                    {/* Actions */}
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>Actions</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonButton
                                expand="block"
                                fill="outline"
                                onClick={resetSequence}
                                style={{ marginBottom: '8px' }}
                            >
                                <IonIcon icon={shuffleOutline} slot="start" />
                                Reset Verse Sequence
                            </IonButton>

                            <IonButton
                                expand="block"
                                fill="outline"
                                color="danger"
                                onClick={clearAllData}
                            >
                                <IonIcon icon={trashOutline} slot="start" />
                                Clear All Data
                            </IonButton>
                        </IonCardContent>
                    </IonCard>

                    {/* About */}
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>About</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonText>
                                <p>Quran Verses Widget v1.0.0</p>
                                <p>A beautiful way to read random Quran verses daily.</p>
                                <p>Data source: <a href="https://quranapi.pages.dev" target="_blank" rel="noopener">QuranAPI</a></p>
                            </IonText>
                        </IonCardContent>
                    </IonCard>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Settings;
