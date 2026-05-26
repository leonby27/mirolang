/**
 * Shared language settings UI — the two pickers ("Native language" and
 * "Language I'm learning") plus their headers and hints.
 *
 * Lives on AccountMain (visible to every user, logged in or not) and
 * could be reused anywhere else we want to surface the same controls.
 * Keeping it in one component so future changes (extra hints, picker
 * style tweaks, third picker) happen in a single file.
 */

import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {
  SUPPORTED_NATIVE_LANGUAGES,
  setNativeLanguage,
  useNativeLanguage,
  SUPPORTED_TARGET_LANGUAGES,
  setTargetLanguage,
  useTargetLanguage,
} from '../i18n';

export default function LanguageSettings({style}) {
  const {t} = useTranslation();
  const nativeLang = useNativeLanguage();
  const targetLang = useTargetLanguage();

  return (
    <View style={[{width: '100%', alignItems: 'center'}, style]}>
      <Text
        style={{
          color: 'rgba(255, 255, 255, 0.50)',
          fontFamily: 'Inter-Regular',
          fontSize: 16,
          lineHeight: 20,
          marginTop: 8,
          width: '90%',
        }}>
        {t('settings.nativeLanguage')}
      </Text>
      <Text
        style={{
          color: 'rgba(255, 255, 255, 0.30)',
          fontFamily: 'Inter-Regular',
          fontSize: 13,
          lineHeight: 16,
          marginTop: 4,
          width: '90%',
        }}>
        {t('settings.nativeLanguageHint')}
      </Text>
      <View
        style={{
          width: '90%',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          marginTop: 12,
        }}>
        {SUPPORTED_NATIVE_LANGUAGES.map(lang => {
          const isActive = nativeLang === lang;
          return (
            <TouchableOpacity
              key={lang}
              onPress={() => setNativeLanguage(lang)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                alignItems: 'center',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isActive ? '#F1CC06' : '#313843',
                backgroundColor: isActive
                  ? 'rgba(241, 204, 6, 0.1)'
                  : 'rgba(34, 37, 46, 0.5)',
              }}>
              <Text
                style={{
                  fontFamily: isActive ? 'Inter-Bold' : 'Inter-Regular',
                  fontSize: 15,
                  lineHeight: 20,
                  color: isActive ? '#F1CC06' : '#FFFFFF',
                }}>
                {t(`settings.nativeLanguageNames.${lang}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text
        style={{
          color: 'rgba(255, 255, 255, 0.50)',
          fontFamily: 'Inter-Regular',
          fontSize: 16,
          lineHeight: 20,
          marginTop: 24,
          width: '90%',
        }}>
        {t('settings.targetLanguage')}
      </Text>
      <Text
        style={{
          color: 'rgba(255, 255, 255, 0.30)',
          fontFamily: 'Inter-Regular',
          fontSize: 13,
          lineHeight: 16,
          marginTop: 4,
          width: '90%',
        }}>
        {t('settings.targetLanguageHint')}
      </Text>
      <View
        style={{
          width: '90%',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          marginTop: 12,
        }}>
        {SUPPORTED_TARGET_LANGUAGES.map(lang => {
          const isActive = targetLang === lang;
          // Show only the half of the matrix that's currently valid: when
          // the user is learning a foreign language (native=en), the target
          // picker offers every foreign language; when learning English,
          // it offers just "English".
          const isVisible = nativeLang === 'en' ? lang !== 'en' : lang === 'en';
          if (!isVisible) return null;
          return (
            <TouchableOpacity
              key={lang}
              onPress={() => setTargetLanguage(lang)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                alignItems: 'center',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isActive ? '#F1CC06' : '#313843',
                backgroundColor: isActive
                  ? 'rgba(241, 204, 6, 0.1)'
                  : 'rgba(34, 37, 46, 0.5)',
              }}>
              <Text
                style={{
                  fontFamily: isActive ? 'Inter-Bold' : 'Inter-Regular',
                  fontSize: 15,
                  lineHeight: 20,
                  color: isActive ? '#F1CC06' : '#FFFFFF',
                }}>
                {t(`settings.targetLanguageNames.${lang}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
