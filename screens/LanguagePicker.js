/**
 * LanguagePicker — dedicated screen for choosing one side of the language
 * pair. Opens via `navigation.push('LanguagePicker', { axis })` from
 * AccountMain's row tiles, where `axis` is 'native' or 'target'.
 *
 * Shows the chip-style picker for just the requested axis. Tapping a chip
 * applies the change immediately and pops back to AccountMain — that's
 * the pattern modern iOS/Android settings screens use (single-tap commit,
 * no separate "Save" button).
 */

import React from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';
import {
  SUPPORTED_NATIVE_LANGUAGES,
  setNativeLanguage,
  useNativeLanguage,
  SUPPORTED_TARGET_LANGUAGES,
  setTargetLanguage,
  useTargetLanguage,
} from '../src/i18n';

export default function LanguagePicker({navigation, route}) {
  const axis = route.params?.axis === 'target' ? 'target' : 'native';
  const {t} = useTranslation();
  const nativeLang = useNativeLanguage();
  const targetLang = useTargetLanguage();

  const options =
    axis === 'native' ? SUPPORTED_NATIVE_LANGUAGES : SUPPORTED_TARGET_LANGUAGES;
  const current = axis === 'native' ? nativeLang : targetLang;
  const setLang = axis === 'native' ? setNativeLanguage : setTargetLanguage;
  const headerKey = axis === 'native' ? 'nativeLanguage' : 'targetLanguage';
  const hintKey =
    axis === 'native' ? 'nativeLanguageHint' : 'targetLanguageHint';
  const nameMap =
    axis === 'native' ? 'nativeLanguageNames' : 'targetLanguageNames';
  // Hide the option that's already chosen on the *other* axis — native
  // ≠ target is enforced by applyLanguagePair anyway, but the UI also
  // shouldn't offer an obviously-invalid pick.
  const excluded = axis === 'native' ? targetLang : nativeLang;

  const handlePick = async lang => {
    await setLang(lang);
    navigation.goBack();
  };

  return (
    <ScrollView
      style={{flex: 1, backgroundColor: '#000000'}}
      contentContainerStyle={{paddingTop: 16, paddingBottom: 32, alignItems: 'center'}}>
      <Text
        style={{
          color: 'rgba(255, 255, 255, 0.30)',
          fontFamily: 'Inter-Regular',
          fontSize: 13,
          lineHeight: 16,
          width: '90%',
        }}>
        {t(`settings.${hintKey}`)}
      </Text>

      <View style={{width: '90%', marginTop: 16, gap: 8}}>
        {options.map(lang => {
          if (lang === excluded) return null;
          const isActive = current === lang;
          return (
            <TouchableOpacity
              key={lang}
              onPress={() => handlePick(lang)}
              style={{
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: isActive ? '#F1CC06' : '#313843',
                backgroundColor: isActive
                  ? 'rgba(241, 204, 6, 0.1)'
                  : '#1C1F26',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  fontFamily: isActive ? 'Inter-Bold' : 'Inter-Regular',
                  fontSize: 16,
                  lineHeight: 20,
                  color: isActive ? '#F1CC06' : '#FFFFFF',
                }}>
                {t(`settings.${nameMap}.${lang}`)}
              </Text>
              {isActive ? (
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: '#F1CC06',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      color: '#14161B',
                      fontFamily: 'Inter-Bold',
                      fontSize: 14,
                      lineHeight: 14,
                    }}>
                    ✓
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
