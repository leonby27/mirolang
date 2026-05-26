import React, {useEffect, useMemo, useState, useRef, useCallback} from 'react';
import {TouchableOpacity, View, ScrollView, StyleSheet, Image, Text, Modal, Alert} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import RateApp from '../src/components/RateApp';
import MirolangPro from './MirolangPro';
import {useTranslation} from 'react-i18next';
import {useNativeLanguage, useTargetLanguage} from '../src/i18n';

import {BottomSheetModal, BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import {loadProgress} from '../src/progress';
import {restorePurchases} from '../src/components/iap';

function AccountMain({navigation}) {
  const {t} = useTranslation();
  const nativeLang = useNativeLanguage();
  const targetLang = useTargetLanguage();
  const RateBottomSheetModalRef = useRef(null);
  const ProBottomSheetModalRef = useRef(null);
  const RateSnapPoints = useMemo(() => ['60%'], []);
  const ProSnapPoints = useMemo(() => ['40%'], []);
  const [progress, setProgress] = useState({
    user: null,
    data: {},
  });
  const [showProScreen, setShowProScreen] = useState(false);

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      getProgress();
    });
    return focusHandler;
  }, [navigation]);

  const getProgress = async () => {
    try {
      setProgress(await loadProgress());
    } catch (e) {
      console.warn(e);
    }
  };

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        color="black"
        opacity={0.8}
      />
    ),
    [],
  );

  const renderBackdropPro = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        color="black"
        opacity={1}
      />
    ),
    [],
  );
  return (
    <View style={{backgroundColor: '#000000', flex: 1}}>
      <ScrollView
        contentContainerStyle={{alignItems: 'center', paddingBottom: 32}}
        showsVerticalScrollIndicator={false}>
      {!progress?.user?.pro ? (
        <TouchableOpacity
          onPress={() => setShowProScreen(true)}
          style={{
            width: '90%',
            padding: 16,
            backgroundColor: '#1C1F26',
            alignItems: 'center',
            borderRadius: 16,
            marginTop: 10,
            flexDirection: 'row',
          }}>
          <Image
            style={{width: 48, height: 48}}
            source={require('../src/pro.png')}
          />

          <View style={{gap: 4, marginLeft: 12}}>
            <Text
              style={{
                color: 'white',
                fontFamily: 'Inter-Bold',
                fontSize: 16,
                lineHeight: 20,
                fontWeight: '700',
              }}>
              MiroLang Pro
            </Text>
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.50)',
                fontFamily: 'Inter-Regular',
                fontSize: 14,
                lineHeight: 16,
              }}>
              {t('account.upgradeToProSubtitle')}
            </Text>
          </View>
          <Svg
            style={{position: 'absolute', right: 16}}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none">
            <Path
              d="M16.4989 12.0165C16.4996 12.3662 16.3776 12.7052 16.1539 12.9745L10.1539 20.4592C9.89934 20.7649 9.53347 20.9572 9.13683 20.9937C8.74019 21.0302 8.34527 20.9079 8.03895 20.6538C7.73262 20.3997 7.53999 20.0346 7.50342 19.6388C7.46685 19.243 7.58934 18.8488 7.84395 18.5431L13.0639 12.0165L8.08395 5.48979C7.95935 5.33667 7.8663 5.16049 7.81015 4.97136C7.75401 4.78224 7.73587 4.58391 7.75677 4.38777C7.77768 4.19163 7.83723 4.00154 7.93199 3.82844C8.02675 3.65534 8.15486 3.50263 8.30895 3.3791C8.46318 3.24201 8.64412 3.13819 8.84043 3.07413C9.03674 3.01007 9.24419 2.98716 9.44979 3.00684C9.65538 3.02651 9.85469 3.08834 10.0352 3.18846C10.2158 3.28858 10.3736 3.42484 10.4989 3.58868L16.2439 11.0734C16.4322 11.3505 16.522 11.6825 16.4989 12.0165Z"
              fill="white"
              opacity={0.2}
            />
          </Svg>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        onPress={() => {
          progress.user == null
            ? navigation.push('Login')
            : navigation.push('AccountSettings', {
                userId: progress.user.id,
                provider: progress.user.provider,
                email: progress.user.email,
              });
        }}
        style={{
          width: '90%',
          padding: 16,
          backgroundColor: '#1C1F26',
          alignItems: 'center',
          borderRadius: 16,
          marginTop: 10,
          flexDirection: 'row',
        }}>
        <Image
          style={{width: 48, height: 48}}
          source={
            progress.user == null
              ? require('../src/profile.png')
              : progress?.user?.pro
              ? require('../src/pro.png')
              : progress.user.provider == 'google'
              ? require('../src/google.png')
              : require('../src/apple.png')
          }
        />

        <View style={{gap: 4, marginLeft: 12}}>
          <Text
            style={{
              color: 'white',
              fontFamily: 'Inter-Bold',
              fontSize: 16,
              lineHeight: 20,
            }}>
            {!progress.user?.email
              ? t('nav.loginTitle')
              : String(progress.user.email).length > 25
              ? String(progress.user.email).slice(0, 24) + '…'
              : String(progress.user.email)}
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.50)',
              fontFamily: 'Inter-Regular',
              fontSize: 14,
              lineHeight: 16,
            }}>
            {progress.user == null
              ? t('account.signInHint')
              : t('account.accountSettingsHint')}
          </Text>
        </View>
        <Svg
          style={{position: 'absolute', right: 16}}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none">
          <Path
            d="M16.4989 12.0165C16.4996 12.3662 16.3776 12.7052 16.1539 12.9745L10.1539 20.4592C9.89934 20.7649 9.53347 20.9572 9.13683 20.9937C8.74019 21.0302 8.34527 20.9079 8.03895 20.6538C7.73262 20.3997 7.53999 20.0346 7.50342 19.6388C7.46685 19.243 7.58934 18.8488 7.84395 18.5431L13.0639 12.0165L8.08395 5.48979C7.95935 5.33667 7.8663 5.16049 7.81015 4.97136C7.75401 4.78224 7.73587 4.58391 7.75677 4.38777C7.77768 4.19163 7.83723 4.00154 7.93199 3.82844C8.02675 3.65534 8.15486 3.50263 8.30895 3.3791C8.46318 3.24201 8.64412 3.13819 8.84043 3.07413C9.03674 3.01007 9.24419 2.98716 9.44979 3.00684C9.65538 3.02651 9.85469 3.08834 10.0352 3.18846C10.2158 3.28858 10.3736 3.42484 10.4989 3.58868L16.2439 11.0734C16.4322 11.3505 16.522 11.6825 16.4989 12.0165Z"
            fill="white"
            opacity={0.2}
          />
        </Svg>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.push('LanguagePicker', {axis: 'native'})}
        style={{
          width: '90%',
          padding: 16,
          backgroundColor: '#1C1F26',
          alignItems: 'center',
          borderRadius: 16,
          marginTop: 10,
          flexDirection: 'row',
        }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: 'rgba(241, 204, 6, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="9" stroke="#F1CC06" strokeWidth="1.5" />
            <Path
              d="M3 12h18M12 3c2.5 2.7 4 5.8 4 9s-1.5 6.3-4 9c-2.5-2.7-4-5.8-4-9s1.5-6.3 4-9z"
              stroke="#F1CC06"
              strokeWidth="1.5"
            />
          </Svg>
        </View>
        <View style={{gap: 4, marginLeft: 12}}>
          <Text
            style={{
              color: 'white',
              fontFamily: 'Inter-Bold',
              fontSize: 16,
              lineHeight: 20,
            }}>
            {t('settings.nativeLanguage')}
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.50)',
              fontFamily: 'Inter-Regular',
              fontSize: 14,
              lineHeight: 16,
            }}>
            {t(`settings.nativeLanguageNames.${nativeLang}`)}
          </Text>
        </View>
        <Svg
          style={{position: 'absolute', right: 16}}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none">
          <Path
            d="M16.4989 12.0165C16.4996 12.3662 16.3776 12.7052 16.1539 12.9745L10.1539 20.4592C9.89934 20.7649 9.53347 20.9572 9.13683 20.9937C8.74019 21.0302 8.34527 20.9079 8.03895 20.6538C7.73262 20.3997 7.53999 20.0346 7.50342 19.6388C7.46685 19.243 7.58934 18.8488 7.84395 18.5431L13.0639 12.0165L8.08395 5.48979C7.95935 5.33667 7.8663 5.16049 7.81015 4.97136C7.75401 4.78224 7.73587 4.58391 7.75677 4.38777C7.77768 4.19163 7.83723 4.00154 7.93199 3.82844C8.02675 3.65534 8.15486 3.50263 8.30895 3.3791C8.46318 3.24201 8.64412 3.13819 8.84043 3.07413C9.03674 3.01007 9.24419 2.98716 9.44979 3.00684C9.65538 3.02651 9.85469 3.08834 10.0352 3.18846C10.2158 3.28858 10.3736 3.42484 10.4989 3.58868L16.2439 11.0734C16.4322 11.3505 16.522 11.6825 16.4989 12.0165Z"
            fill="white"
            opacity={0.2}
          />
        </Svg>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.push('LanguagePicker', {axis: 'target'})}
        style={{
          width: '90%',
          padding: 16,
          backgroundColor: '#1C1F26',
          alignItems: 'center',
          borderRadius: 16,
          marginTop: 10,
          flexDirection: 'row',
        }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: 'rgba(241, 204, 6, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 6h16M4 12h10M4 18h13M17 8l4 4-4 4"
              stroke="#F1CC06"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <View style={{gap: 4, marginLeft: 12}}>
          <Text
            style={{
              color: 'white',
              fontFamily: 'Inter-Bold',
              fontSize: 16,
              lineHeight: 20,
            }}>
            {t('settings.targetLanguage')}
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.50)',
              fontFamily: 'Inter-Regular',
              fontSize: 14,
              lineHeight: 16,
            }}>
            {t(`settings.targetLanguageNames.${targetLang}`)}
          </Text>
        </View>
        <Svg
          style={{position: 'absolute', right: 16}}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none">
          <Path
            d="M16.4989 12.0165C16.4996 12.3662 16.3776 12.7052 16.1539 12.9745L10.1539 20.4592C9.89934 20.7649 9.53347 20.9572 9.13683 20.9937C8.74019 21.0302 8.34527 20.9079 8.03895 20.6538C7.73262 20.3997 7.53999 20.0346 7.50342 19.6388C7.46685 19.243 7.58934 18.8488 7.84395 18.5431L13.0639 12.0165L8.08395 5.48979C7.95935 5.33667 7.8663 5.16049 7.81015 4.97136C7.75401 4.78224 7.73587 4.58391 7.75677 4.38777C7.77768 4.19163 7.83723 4.00154 7.93199 3.82844C8.02675 3.65534 8.15486 3.50263 8.30895 3.3791C8.46318 3.24201 8.64412 3.13819 8.84043 3.07413C9.03674 3.01007 9.24419 2.98716 9.44979 3.00684C9.65538 3.02651 9.85469 3.08834 10.0352 3.18846C10.2158 3.28858 10.3736 3.42484 10.4989 3.58868L16.2439 11.0734C16.4322 11.3505 16.522 11.6825 16.4989 12.0165Z"
            fill="white"
            opacity={0.2}
          />
        </Svg>
      </TouchableOpacity>

      <Text
        style={{
          color: 'rgba(255, 255, 255, 0.50)',
          fontFamily: 'Inter-Regular',
          fontSize: 16,
          lineHeight: 20,
          marginTop: 24,
          width: '90%',
        }}>
        {t('account.moreSection')}
      </Text>

      <TouchableOpacity
        onPress={() => RateBottomSheetModalRef.current?.present()}
        style={{
          width: '90%',
          padding: 16,
          backgroundColor: '#1C1F26',
          alignItems: 'center',
          borderRadius: 16,
          marginTop: 12,
          flexDirection: 'row',
        }}>
        <Image
          style={{width: 48, height: 48}}
          source={require('../src/like.png')}
        />
        <View style={{gap: 4, marginLeft: 12}}>
          <Text
            style={{
              color: 'white',
              fontFamily: 'Inter-Bold',
              fontSize: 16,
              lineHeight: 20,
            }}>
            {t('account.rateApp')}
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.50)',
              fontFamily: 'Inter-Regular',
              fontSize: 14,
              lineHeight: 16,
            }}>
            {t('account.rateAppHint')}
          </Text>
        </View>
        <Svg
          style={{position: 'absolute', right: 16}}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none">
          <Path
            d="M16.4989 12.0165C16.4996 12.3662 16.3776 12.7052 16.1539 12.9745L10.1539 20.4592C9.89934 20.7649 9.53347 20.9572 9.13683 20.9937C8.74019 21.0302 8.34527 20.9079 8.03895 20.6538C7.73262 20.3997 7.53999 20.0346 7.50342 19.6388C7.46685 19.243 7.58934 18.8488 7.84395 18.5431L13.0639 12.0165L8.08395 5.48979C7.95935 5.33667 7.8663 5.16049 7.81015 4.97136C7.75401 4.78224 7.73587 4.58391 7.75677 4.38777C7.77768 4.19163 7.83723 4.00154 7.93199 3.82844C8.02675 3.65534 8.15486 3.50263 8.30895 3.3791C8.46318 3.24201 8.64412 3.13819 8.84043 3.07413C9.03674 3.01007 9.24419 2.98716 9.44979 3.00684C9.65538 3.02651 9.85469 3.08834 10.0352 3.18846C10.2158 3.28858 10.3736 3.42484 10.4989 3.58868L16.2439 11.0734C16.4322 11.3505 16.522 11.6825 16.4989 12.0165Z"
            fill="white"
            opacity={0.2}
          />
        </Svg>
      </TouchableOpacity>

      {/* Support — visible to logged-out users too. Reaching the dev team
          shouldn't require an account. */}
      <TouchableOpacity
        onPress={() => navigation.push('Support')}
        style={{
          width: '90%',
          padding: 16,
          backgroundColor: '#1C1F26',
          alignItems: 'center',
          borderRadius: 16,
          marginTop: 12,
          flexDirection: 'row',
        }}>
        <Image
          style={{width: 48, height: 48}}
          source={require('../src/info.png')}
        />
        <View style={{gap: 4, marginLeft: 12}}>
          <Text
            style={{
              color: 'white',
              fontFamily: 'Inter-Bold',
              fontSize: 16,
              lineHeight: 20,
            }}>
            {t('nav.supportTitle')}
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.50)',
              fontFamily: 'Inter-Regular',
              fontSize: 14,
              lineHeight: 16,
            }}>
            {t('account.supportHint')}
          </Text>
        </View>
        <Svg
          style={{position: 'absolute', right: 16}}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none">
          <Path
            d="M16.4989 12.0165C16.4996 12.3662 16.3776 12.7052 16.1539 12.9745L10.1539 20.4592C9.89934 20.7649 9.53347 20.9572 9.13683 20.9937C8.74019 21.0302 8.34527 20.9079 8.03895 20.6538C7.73262 20.3997 7.53999 20.0346 7.50342 19.6388C7.46685 19.243 7.58934 18.8488 7.84395 18.5431L13.0639 12.0165L8.08395 5.48979C7.95935 5.33667 7.8663 5.16049 7.81015 4.97136C7.75401 4.78224 7.73587 4.58391 7.75677 4.38777C7.77768 4.19163 7.83723 4.00154 7.93199 3.82844C8.02675 3.65534 8.15486 3.50263 8.30895 3.3791C8.46318 3.24201 8.64412 3.13819 8.84043 3.07413C9.03674 3.01007 9.24419 2.98716 9.44979 3.00684C9.65538 3.02651 9.85469 3.08834 10.0352 3.18846C10.2158 3.28858 10.3736 3.42484 10.4989 3.58868L16.2439 11.0734C16.4322 11.3505 16.522 11.6825 16.4989 12.0165Z"
            fill="white"
            opacity={0.2}
          />
        </Svg>
      </TouchableOpacity>

      {/* Restore Purchases — required by App Store guideline 3.1.1 to be
          one tap from any screen, not gated behind the paywall. */}
      <TouchableOpacity
        onPress={async () => {
          try {
            const restored = await restorePurchases();
            Alert.alert(
              restored
                ? t('paywall.alert.restoredTitle')
                : t('paywall.alert.notRestoredTitle'),
              restored
                ? t('paywall.alert.restoredBody')
                : t('paywall.alert.notRestoredBody'),
            );
            if (restored) getProgress();
          } catch (e) {
            Alert.alert(
              t('paywall.alert.purchaseErrorTitle'),
              e?.message || String(e),
            );
          }
        }}
        style={{
          width: '90%',
          padding: 16,
          backgroundColor: '#1C1F26',
          alignItems: 'center',
          borderRadius: 16,
          marginTop: 12,
          flexDirection: 'row',
        }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: 'rgba(241, 204, 6, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 12a8 8 0 018-8c2.5 0 4.7 1.13 6.16 2.9M20 4v4h-4M20 12a8 8 0 01-8 8c-2.5 0-4.7-1.13-6.16-2.9M4 20v-4h4"
              stroke="#F1CC06"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <View style={{gap: 4, marginLeft: 12}}>
          <Text
            style={{
              color: 'white',
              fontFamily: 'Inter-Bold',
              fontSize: 16,
              lineHeight: 20,
            }}>
            {t('paywall.restore')}
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.50)',
              fontFamily: 'Inter-Regular',
              fontSize: 14,
              lineHeight: 16,
            }}>
            {t('account.restoreHint')}
          </Text>
        </View>
        <Svg
          style={{position: 'absolute', right: 16}}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none">
          <Path
            d="M16.4989 12.0165C16.4996 12.3662 16.3776 12.7052 16.1539 12.9745L10.1539 20.4592C9.89934 20.7649 9.53347 20.9572 9.13683 20.9937C8.74019 21.0302 8.34527 20.9079 8.03895 20.6538C7.73262 20.3997 7.53999 20.0346 7.50342 19.6388C7.46685 19.243 7.58934 18.8488 7.84395 18.5431L13.0639 12.0165L8.08395 5.48979C7.95935 5.33667 7.8663 5.16049 7.81015 4.97136C7.75401 4.78224 7.73587 4.58391 7.75677 4.38777C7.77768 4.19163 7.83723 4.00154 7.93199 3.82844C8.02675 3.65534 8.15486 3.50263 8.30895 3.3791C8.46318 3.24201 8.64412 3.13819 8.84043 3.07413C9.03674 3.01007 9.24419 2.98716 9.44979 3.00684C9.65538 3.02651 9.85469 3.08834 10.0352 3.18846C10.2158 3.28858 10.3736 3.42484 10.4989 3.58868L16.2439 11.0734C16.4322 11.3505 16.522 11.6825 16.4989 12.0165Z"
            fill="white"
            opacity={0.2}
          />
        </Svg>
      </TouchableOpacity>

      </ScrollView>

      <Modal
        transparent={true}
        visible={showProScreen}
        onRequestClose={() => setShowProScreen(false)}>
        <MirolangPro
          getProgress={getProgress}
          ProSnapPoints={ProSnapPoints}
          renderBackdropPro={renderBackdropPro}
          ProBottomSheetModalRef={ProBottomSheetModalRef}
          setShowProScreen={setShowProScreen}
          progress={progress}
          navigation={navigation}
          login={true}
        />
      </Modal>
      <BottomSheetModal
        ref={RateBottomSheetModalRef}
        index={0}
        backdropComponent={renderBackdrop}
        snapPoints={RateSnapPoints}
        backgroundStyle={{backgroundColor: '#14161B', borderRadius: 0}}
        handleIndicatorStyle={{backgroundColor: 'white'}}>
        <RateApp
          showDontShowAgainButton={false}
          closeModal={() => RateBottomSheetModalRef.current?.close()}
        />
      </BottomSheetModal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  centeredView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalView: {
    width: '100%',
    borderRadius: 20,
    paddingBottom: 24,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    paddingBottom: 24,
  },
  mainText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  text: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    paddingHorizontal: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -15,
  },
});
export default AccountMain;
