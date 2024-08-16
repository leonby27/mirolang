import React, {useEffect, useMemo, useState, useRef, useCallback} from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  Text,
  Modal,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import RateApp from '../src/components/RateApp';
import MirolangPro from './MirolangPro';

import {BottomSheetModal, BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';

function AccountMain({navigation}) {
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
      var progress = await AsyncStorage.getItem('progress');

      if (progress !== null) {
        setProgress(JSON.parse(progress));
      } else {
        console.log('error progress', progress);
      }
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
    <View style={{backgroundColor: '#000000', flex: 1, alignItems: 'center'}}>
      {progress?.user && !progress?.user?.pro ? (
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
              Попробуйте Pro версию
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
              ? 'Войти в аккаунт'
              : progress.user?.email.toString().length > 24
              ? progress.user?.email.toString().slice(0, 24) + '...'
              : progress.user?.email.toString()}
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.50)',
              fontFamily: 'Inter-Regular',
              fontSize: 14,
              lineHeight: 16,
            }}>
            {progress.user == null
              ? 'Чтобы восстановить покупки'
              : 'Настройки аккаунта'}
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
        Дополнительно
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
            Оцените приложение
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.50)',
              fontFamily: 'Inter-Regular',
              fontSize: 14,
              lineHeight: 16,
            }}>
            Нам важна обратная связь
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

      {progress.user ? (
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
              Поддержка
            </Text>
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.50)',
                fontFamily: 'Inter-Regular',
                fontSize: 14,
                lineHeight: 16,
              }}>
              Контакты разработчика
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

      <Modal
        transparent={true}
        visible={showProScreen}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
        }}>
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
