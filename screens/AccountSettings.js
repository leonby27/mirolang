import {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import Svg, {Path} from 'react-native-svg';

function AccountSettings({navigation, route}) {
  const [showOptions, setShowOptions] = useState(false);
  const [progress, setProgress] = useState({
    user: null,
    data: {},
  });

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

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setShowOptions(!showOptions)}
          style={{
            backgroundColor: '#22252E',
            height: 32,
            width: 32,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <Path
              d="M9.99967 5.83333C10.9201 5.83333 11.6663 5.08714 11.6663 4.16667C11.6663 3.24619 10.9201 2.5 9.99967 2.5C9.0792 2.5 8.33301 3.24619 8.33301 4.16667C8.33301 5.08714 9.0792 5.83333 9.99967 5.83333Z"
              fill="white"
            />
            <Path
              d="M9.99967 17.5013C10.9201 17.5013 11.6663 16.7551 11.6663 15.8346C11.6663 14.9142 10.9201 14.168 9.99967 14.168C9.0792 14.168 8.33301 14.9142 8.33301 15.8346C8.33301 16.7551 9.0792 17.5013 9.99967 17.5013Z"
              fill="white"
            />
            <Path
              d="M9.99967 11.6654C10.9201 11.6654 11.6663 10.9192 11.6663 9.9987C11.6663 9.07822 10.9201 8.33203 9.99967 8.33203C9.0792 8.33203 8.33301 9.07822 8.33301 9.9987C8.33301 10.9192 9.0792 11.6654 9.99967 11.6654Z"
              fill="white"
            />
          </Svg>
        </TouchableOpacity>
      ),
    });
  }, [navigation, showOptions]);

  const logOutApple = async () =>
    Alert.alert(
      'Выйти из аккаунта?',
      'Вы уверены, что хотите выйти из своего аккаунта?',
      [
        {
          text: 'Да',
          style: 'dark',
          onPress: async () => {
            await auth()
              .signOut()
              .then(() => {
                AsyncStorage.setItem(
                  'progress',
                  JSON.stringify({
                    user: null,
                    data: {},
                  }),
                );
                navigation.goBack();
              })
              .catch(error => {
                console.error(error);
              });
          },
        },
        {
          text: 'Нет',
          style: 'default',
        },
      ],
      {cancelable: false, userInterfaceStyle: 'dark'},
    );

  const logOutAndroid = async () =>
    Alert.alert(
      'Выйти из аккаунта?',
      'Вы уверены, что хотите выйти из своего аккаунта?',
      [
        {
          text: 'Да',
          style: 'default',
          onPress: async () => {
            try {
              const currentUser = await GoogleSignin.currentUser();
              if (currentUser) {
                await GoogleSignin.signOut();
              }
            } catch (error) {
              console.error('Error during sign out:', error);
            }
          },
        },
        {
          text: 'Нет',
          style: 'default',
        },
      ],
      {cancelable: false, userInterfaceStyle: 'dark'},
    );

  async function deleteDataFirestore() {
    const progress = await AsyncStorage.getItem('progress');
    const userData = JSON.parse(progress);

    await firestore().collection('users').doc(userData.user.id).delete();
  }

  const deleteAccount = async () =>
    Alert.alert(
      'Удалить аккаунт',
      'Вы уверены? Это действие нельзя будет отменить',
      [
        {
          text: 'Нет',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDataFirestore();
              await AsyncStorage.setItem(
                'progress',
                JSON.stringify({
                  user: null,
                  data: {},
                }),
              );
              navigation.goBack();
            } catch {}
          },
        },
      ],
      {cancelable: false, userInterfaceStyle: 'dark'},
    );

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: '#000000', alignItems: 'center'}}>
      <View
        style={{
          width: '90%',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        {showOptions && (
          <TouchableOpacity
            onPress={() => setShowOptions(false)}
            style={{
              position: 'absolute',
              height: 2000,
              width: 2000,
              backgroundColor: 'transparent',
            }}></TouchableOpacity>
        )}
        {showOptions && (
          <View style={{position: 'absolute', right: 0, top: 0, zIndex: 2}}>
            <TouchableOpacity
              onPress={deleteAccount}
              style={{
                padding: 12,
                zIndex: 2,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
                borderWidth: 1,
                borderColor: '#313843',
                backgroundColor: '#22252E',
                borderRadius: 12,
              }}>
              <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <Path
                  d="M17.4993 4.16797H2.49935C2.27834 4.16797 2.06637 4.25577 1.91009 4.41205C1.75381 4.56833 1.66602 4.78029 1.66602 5.0013C1.66602 5.22232 1.75381 5.43428 1.91009 5.59056C2.06637 5.74684 2.27834 5.83464 2.49935 5.83464H4.16602V15.8346C4.16621 16.4976 4.42967 17.1334 4.89847 17.6022C5.36727 18.071 6.00304 18.3344 6.66602 18.3346H13.3327C13.9957 18.3345 14.6315 18.071 15.1003 17.6022C15.5691 17.1334 15.8325 16.4976 15.8327 15.8346V5.83464H17.4993C17.7204 5.83464 17.9323 5.74684 18.0886 5.59056C18.2449 5.43428 18.3327 5.22232 18.3327 5.0013C18.3327 4.78029 18.2449 4.56833 18.0886 4.41205C17.9323 4.25577 17.7204 4.16797 17.4993 4.16797ZM9.16602 13.3346C9.16602 13.5556 9.07822 13.7676 8.92194 13.9239C8.76566 14.0802 8.5537 14.168 8.33268 14.168C8.11167 14.168 7.89971 14.0802 7.74343 13.9239C7.58715 13.7676 7.49935 13.5556 7.49935 13.3346V9.16797C7.49935 8.94696 7.58715 8.73499 7.74343 8.57871C7.89971 8.42243 8.11167 8.33464 8.33268 8.33464C8.5537 8.33464 8.76566 8.42243 8.92194 8.57871C9.07822 8.73499 9.16602 8.94696 9.16602 9.16797V13.3346ZM12.4993 13.3346C12.4993 13.5556 12.4116 13.7676 12.2553 13.9239C12.099 14.0802 11.887 14.168 11.666 14.168C11.445 14.168 11.233 14.0802 11.0768 13.9239C10.9205 13.7676 10.8327 13.5556 10.8327 13.3346V9.16797C10.8327 8.94696 10.9205 8.73499 11.0768 8.57871C11.233 8.42243 11.445 8.33464 11.666 8.33464C11.887 8.33464 12.099 8.42243 12.2553 8.57871C12.4116 8.73499 12.4993 8.94696 12.4993 9.16797V13.3346Z"
                  fill="#FF5858"
                />
                <Path
                  d="M8.33333 3.33464H11.6667C11.8877 3.33464 12.0996 3.24684 12.2559 3.09056C12.4122 2.93428 12.5 2.72232 12.5 2.5013C12.5 2.28029 12.4122 2.06833 12.2559 1.91205C12.0996 1.75577 11.8877 1.66797 11.6667 1.66797H8.33333C8.11232 1.66797 7.90036 1.75577 7.74408 1.91205C7.5878 2.06833 7.5 2.28029 7.5 2.5013C7.5 2.72232 7.5878 2.93428 7.74408 3.09056C7.90036 3.24684 8.11232 3.33464 8.33333 3.33464Z"
                  fill="#FF5858"
                />
              </Svg>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 16,
                  lineHeight: 20,
                  color: '#FF5858',
                }}>
                Удалить аккаунт
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Image
        style={{height: 48, width: 48, marginTop: 20, zIndex: -1}}
        source={
          progress?.user?.pro
            ? require('../src/pro.png')
            : route.params.provider == 'google'
            ? require('../src/google.png')
            : require('../src/apple.png')
        }
      />
      <Text
        style={{
          fontSize: 20,
          lineHeight: 28,
          color: 'white',
          fontFamily: 'Inter-Bold',
          marginTop: 4,
        }}>
        {route.params.email}
      </Text>
      <Text
        style={{
          fontSize: 16,
          lineHeight: 20,
          color: 'rgba(255,255,255,0.5)',
          fontFamily: 'Inter-Regular',
          marginTop: 4,
        }}>
        Вы авторизованы через{' '}
        {route.params.provider == 'google' ? 'Google' : 'Apple'}
      </Text>
      {progress?.user?.pro ? (
        <>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.50)',
              fontFamily: 'Inter-Regular',
              fontSize: 16,
              lineHeight: 20,
              marginTop: 24,
              width: '90%',
            }}>
            Доступно с MiroLang Pro
          </Text>
          <View
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
              source={require('../src/block.png')}
            />
            <View style={{gap: 4, marginLeft: 12}}>
              <Text
                style={{
                  color: 'white',
                  fontFamily: 'Inter-Bold',
                  fontSize: 16,
                  lineHeight: 20,
                }}>
                Открытие уровней
              </Text>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.50)',
                  fontFamily: 'Inter-Regular',
                  fontSize: 14,
                  lineHeight: 16,
                }}>
                {'Откройте доступ к закрытым\nуровням прямо сейчас.'}
              </Text>
            </View>
          </View>
          <View
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
              source={require('../src/unlim.png')}
            />
            <View style={{gap: 4, marginLeft: 12}}>
              <Text
                style={{
                  color: 'white',
                  fontFamily: 'Inter-Bold',
                  fontSize: 16,
                  lineHeight: 20,
                }}>
                Безлимит слов в день
              </Text>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.50)',
                  fontFamily: 'Inter-Regular',
                  fontSize: 14,
                  lineHeight: 16,
                }}>
                {'Учите неограниченное количество\nновых слов каждый день.'}
              </Text>
            </View>
          </View>
        </>
      ) : null}

      <TouchableOpacity
        onPress={Platform.OS === 'android' ? logOutAndroid : logOutApple}
        style={{
          width: '90%',
          padding: 18,
          top: 20,
          alignItems: 'center',
          borderRadius: 16,
          borderWidth: 1,
          backgroundColor: 'rgba(34, 37, 46, 0.5)',
        }}>
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 16,
            lineHeight: 20,
            color: '#FFFFFF',
            opacity: 0.7,
          }}>
          Выйти из аккаунта
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default AccountSettings;
