import {useEffect, useState} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import Svg, {Path, G} from 'react-native-svg';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

function Login({navigation}) {
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    GoogleSignin.configure();
    if (logged) {
      navigation.goBack();
      setLogged(false);
    }
  }, [logged]);

  const GoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const user = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(user.idToken);

      // Sign-in the user with the credential
      await auth().signInWithCredential(googleCredential);

      const progress = await AsyncStorage.getItem('progress');

      const parseProgress = JSON.parse(progress);
      await firestore()
        .collection('users')
        .doc(user.user.id)
        .get()
        .then(async snapshot => {
          if (!!snapshot.data()?.data?.data) {
            const initialProgressData = {
              user: {
                id: user.user.id,
                provider: 'google',
                email: user.user.email,
                pro: snapshot.data()?.data?.user?.pro,
              },
              data: snapshot.data()?.data?.data,
            };
            navigation.goBack();
            await AsyncStorage.setItem(
              'progress',
              JSON.stringify(initialProgressData),
            );
          } else {
            const initialProgressData = {
              user: {
                id: user.user.id,
                provider: 'google',
                email: user.user.email,
                pro: false,
              },
              data: parseProgress?.data,
            };
            navigation.goBack();
            await AsyncStorage.setItem(
              'progress',
              JSON.stringify(initialProgressData),
            );

            await firestore().collection('users').doc(user.user.id).set({
              data: initialProgressData,
            });
          }
        });
    } catch (e) {
      console.log('An error occurred', e.message || 'An error occurred');
    }
  };

  const AppleSignIn = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      if (!appleAuthRequestResponse.identityToken) {
        throw new Error('Apple Sign-In failed - no identify token returned');
      }

      const {identityToken, nonce} = appleAuthRequestResponse;
      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce,
      );

      const result = await auth().signInWithCredential(appleCredential);

      const progress = await AsyncStorage.getItem('progress');

      const parseProgress = JSON.parse(progress);

      await firestore()
        .collection('users')
        .doc(result.user.uid)
        .get()
        .then(async snapshot => {
          if (!!snapshot.data()?.data?.data) {
            const initialProgressData = {
              user: {
                id: result.user.uid,
                provider: 'apple',
                email: result.user.email,
                pro: snapshot.data()?.data?.user?.pro,
              },
              data: snapshot.data()?.data?.data,
            };
            navigation.goBack();
            await AsyncStorage.setItem(
              'progress',
              JSON.stringify(initialProgressData),
            );
          } else {
            const initialProgressData = {
              user: {
                id: result.user.uid,
                provider: 'apple',
                email: result.user.email,
                pro: false,
              },
              data: parseProgress?.data,
            };
            navigation.goBack();
            await AsyncStorage.setItem(
              'progress',
              JSON.stringify(initialProgressData),
            );

            await firestore().collection('users').doc(result.user.uid).set({
              data: initialProgressData,
            });
          }
        });

      setLogged(true);
    } catch (error) {
      console.error('error11', error);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#000000', alignItems: 'center'}}>
      <Image
        style={{height: 64, width: 64, marginTop: 10}}
        source={require('../src/profile.png')}
      />
      <Text
        style={{
          fontSize: 20,
          lineHeight: 28,
          color: 'white',
          fontFamily: 'Inter-Bold',
          marginTop: 4,
        }}>
        Авторизуйтесь
      </Text>
      <Text
        style={{
          fontSize: 16,
          lineHeight: 20,
          color: 'rgba(255,255,255,0.5)',
          fontFamily: 'Inter-Regular',
          marginTop: 4,
        }}>
        Так вы не потеряете ваш прогресс
      </Text>
      <TouchableOpacity
        onPress={GoogleSignIn}
        style={{
          shadowColor: '#000000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.17,
          shadowRadius: 3,
          elevation: 4,
          width: '90%',
          borderRadius: 12,
          backgroundColor: '#22252E',
          padding: 12,
          gap: 12,
          marginTop: 20,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M23.04 12.2624C23.04 11.447 22.9668 10.6629 22.8309 9.91016H12V14.3586H18.1891C17.9225 15.7961 17.1123 17.014 15.8943 17.8295V20.7149H19.6109C21.7855 18.7129 23.04 15.7647 23.04 12.2624Z"
            fill="#4285F4"
          />
          <Path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M11.9995 23.4986C15.1045 23.4986 17.7077 22.4688 19.6104 20.7125L15.8938 17.827C14.864 18.517 13.5467 18.9247 11.9995 18.9247C9.00425 18.9247 6.46902 16.9018 5.5647 14.1836H1.72266V17.1631C3.61493 20.9215 7.50402 23.4986 11.9995 23.4986Z"
            fill="#34A853"
          />
          <Path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M5.56523 14.1855C5.33523 13.4955 5.20455 12.7584 5.20455 12.0005C5.20455 11.2425 5.33523 10.5055 5.56523 9.81548V6.83594H1.72318C0.944318 8.38844 0.5 10.1448 0.5 12.0005C0.5 13.8562 0.944318 15.6125 1.72318 17.165L5.56523 14.1855Z"
            fill="#FBBC05"
          />
          <Path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M11.9995 5.07386C13.6879 5.07386 15.2038 5.65409 16.3956 6.79364L19.694 3.49523C17.7024 1.63955 15.0992 0.5 11.9995 0.5C7.50402 0.5 3.61493 3.07705 1.72266 6.83545L5.5647 9.815C6.46902 7.09682 9.00425 5.07386 11.9995 5.07386Z"
            fill="#EA4335"
          />
        </Svg>
        <Text
          style={{
            fontSize: 14,
            lineHeight: 16,
            color: 'white',
            fontFamily: 'Inter-Medium',
          }}>
          Войти через Google
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={AppleSignIn}
        style={{
          shadowColor: '#000000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.17,
          shadowRadius: 3,
          elevation: 4,
          width: '90%',
          borderRadius: 12,
          backgroundColor: '#22252E',
          padding: 12,
          gap: 12,
          marginTop: 8,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Svg
          fill="white"
          height="24"
          width="24"
          version="1.1"
          id="Capa_1"
          viewBox="0 0 24 24">
          <G>
            <G>
              <Path
                d="M15.769,0c0.053,0,0.106,0,0.162,0c0.13,1.606-0.483,2.806-1.228,3.675c-0.731,0.863-1.732,1.7-3.351,1.573
                            c-0.108-1.583,0.506-2.694,1.25-3.561C13.292,0.879,14.557,0.16,15.769,0z"
              />
              <Path
                d="M20.67,16.716c0,0.016,0,0.03,0,0.045c-0.455,1.378-1.104,2.559-1.896,3.655c-0.723,0.995-1.609,2.334-3.191,2.334
                            c-1.367,0-2.275-0.879-3.676-0.903c-1.482-0.024-2.297,0.735-3.652,0.926c-0.155,0-0.31,0-0.462,0
                            c-0.995-0.144-1.798-0.932-2.383-1.642c-1.725-2.098-3.058-4.808-3.306-8.276c0-0.34,0-0.679,0-1.019
                            c0.105-2.482,1.311-4.5,2.914-5.478c0.846-0.52,2.009-0.963,3.304-0.765c0.555,0.086,1.122,0.276,1.619,0.464
                            c0.471,0.181,1.06,0.502,1.618,0.485c0.378-0.011,0.754-0.208,1.135-0.347c1.116-0.403,2.21-0.865,3.652-0.648
                            c1.733,0.262,2.963,1.032,3.723,2.22c-1.466,0.933-2.625,2.339-2.427,4.74C17.818,14.688,19.086,15.964,20.67,16.716z"
              />
            </G>
            <G></G>
            <G></G>
            <G></G>
            <G></G>
            <G></G>
            <G></G>
            <G></G>
            <G></G>
            <G></G>
            <G></G>
            <G></G>
            <G></G>
            <G></G>
            <G></G>
            <G></G>
          </G>
        </Svg>
        <Text
          style={{
            fontSize: 14,
            lineHeight: 16,
            color: 'white',
            fontFamily: 'Inter-Medium',
          }}>
          Войти через Apple
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default Login;
