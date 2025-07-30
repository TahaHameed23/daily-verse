import React from 'react';
import { FlexWidget, TextWidget, ImageWidget } from 'react-native-android-widget';

interface QuranWidgetProps {
    chapterInfo: string;
    arabicText: string;
    translationText: string;
    showArabic: boolean;
    showTranslation: boolean;
}

export function QuranWidget({
    chapterInfo = 'Loading...',
    arabicText = '',
    translationText = 'Loading verse...',
    showArabic = true,
    showTranslation = true,
}: QuranWidgetProps) {
    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                padding: 12,
                backgroundColor: '#ffffff',
                borderRadius: 8,
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            {/* Header */}
            <FlexWidget
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                }}
            >
                <TextWidget
                    text={chapterInfo}
                    style={{
                        fontSize: 10,
                        color: '#666666',
                        fontWeight: '500',
                    }}
                />

                <TextWidget
                    text="↻"
                    style={{
                        fontSize: 16,
                        color: '#0066CC',
                        fontWeight: 'bold',
                    }}
                />
            </FlexWidget>

            {/* Content */}
            <FlexWidget
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                }}
            >
                {/* Arabic Text */}
                {showArabic && arabicText && (
                    <TextWidget
                        text={arabicText}
                        style={{
                            fontSize: 14,
                            color: '#333333',
                            textAlign: 'right',
                            fontFamily: 'serif',
                            marginBottom: 8,
                        }}
                    />
                )}

                {/* Translation */}
                {showTranslation && (
                    <TextWidget
                        text={translationText}
                        style={{
                            fontSize: 12,
                            color: '#333333',
                            textAlign: 'left',
                        }}
                    />
                )}
            </FlexWidget>

            {/* Footer */}
            <FlexWidget
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 8,
                }}
            >
                <TextWidget
                    text="♡"
                    style={{
                        fontSize: 16,
                        color: '#0066CC',
                    }}
                />

                <TextWidget
                    text="Quran Verses"
                    style={{
                        fontSize: 8,
                        color: '#999999',
                    }}
                />
            </FlexWidget>
        </FlexWidget>
    );
}
