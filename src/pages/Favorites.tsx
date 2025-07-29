import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';

import { storageService } from '../services/storage';
import { QuranVerse, Chapter } from '../types';
import VerseCard from '../components/VerseCard';

const Favorites: React.FC = () => {
    const [favorites, setFavorites] = useState<Array<{ verse: QuranVerse; chapter: Chapter }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const favoriteVerses = await storageService.getFavoriteVerses();
            setFavorites(favoriteVerses);
        } catch (error) {
            console.error('Failed to load favorites:', error);
            Alert.alert('Error', 'Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    const removeFromFavorites = async (surahNo: number, ayahNo: number) => {
        try {
            await storageService.removeFromFavorites(surahNo, ayahNo);
            setFavorites(favorites.filter(fav => !(fav.verse.surahNo === surahNo && fav.verse.ayahNo === ayahNo)));
            Alert.alert('Success', 'Removed from favorites');
        } catch (error) {
            console.error('Failed to remove from favorites:', error);
            Alert.alert('Error', 'Failed to remove from favorites');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
            {/* Header */}
            <View style={{
                backgroundColor: '#2196F3',
                padding: 16,
                paddingTop: 40,
                alignItems: 'center'
            }}>
                <Text style={{
                    color: 'white',
                    fontSize: 20,
                    fontWeight: 'bold'
                }}>
                    Favorite Verses
                </Text>
            </View>

            {/* Content */}
            <ScrollView style={{ flex: 1, padding: 16 }}>
                {loading ? (
                    <Text style={{ textAlign: 'center', marginTop: 20 }}>
                        Loading favorites...
                    </Text>
                ) : favorites.length === 0 ? (
                    <View style={{
                        backgroundColor: 'white',
                        padding: 32,
                        margin: 16,
                        borderRadius: 8,
                        alignItems: 'center'
                    }}>
                        <Text style={{
                            fontSize: 64,
                            color: '#ccc',
                            marginBottom: 16
                        }}>
                            ♥
                        </Text>
                        <Text style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            marginBottom: 8
                        }}>
                            No Favorite Verses Yet
                        </Text>
                        <Text style={{
                            color: '#666',
                            textAlign: 'center'
                        }}>
                            Tap the heart icon on any verse to add it to your favorites.
                        </Text>
                    </View>
                ) : (
                    <View>
                        <Text style={{
                            color: '#666',
                            marginBottom: 16
                        }}>
                            {favorites.length} favorite verse{favorites.length !== 1 ? 's' : ''}
                        </Text>

                        {favorites.map((favorite, index) => (
                            <View key={`${favorite.verse.surahNo}-${favorite.verse.ayahNo}`} style={{ marginBottom: 16 }}>
                                <VerseCard
                                    verse={favorite.verse}
                                    chapter={favorite.chapter}
                                    showArabic={true}
                                    showTranslation={true}
                                />

                                {/* Remove Button */}
                                <View style={{
                                    backgroundColor: 'white',
                                    marginTop: 8,
                                    borderRadius: 8,
                                    padding: 8
                                }}>
                                    <TouchableOpacity
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: 8
                                        }}
                                        onPress={() => removeFromFavorites(favorite.verse.surahNo, favorite.verse.ayahNo)}
                                    >
                                        <Text style={{
                                            color: '#f44336',
                                            marginLeft: 8
                                        }}>
                                            🗑 Remove from Favorites
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default Favorites;
