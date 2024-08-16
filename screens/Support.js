import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  Text,
  Linking,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';

function Support({navigation}) {
  const sendEmail = () => {
    const email = 'support@mirolang.ru';
    const subject = 'Hi there';
    const body = 'The best app!';

    const url = `mailto:${email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
          Alert.alert('Error', 'Почтовое приложение не поддерживается');
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => console.error('An error occurred', err));
  };

  const supportText = ` — это приложение, где вы можете\nизучать слова по уровню сложности, повторять\nто, что уже выучили, и закреплять материал.`;

  return (
    <View style={{backgroundColor: '#000000', flex: 1, alignItems: 'center'}}>
      <View
        onPress={() => setShowProScreen(true)}
        style={{
          width: '90%',
          padding: 16,
          alignItems: 'center',
          borderRadius: 16,
          marginTop: 10,
        }}>
        <Image
          style={{width: 64, height: 64}}
          source={require('../src/info.png')}
        />
      </View>

      <Text
        style={{
          textAlign: 'center',
          color: '#FFFFFF',
          fontFamily: 'Inter-Regular',
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 20,
          width: '90%',
        }}>
        Mirolang
        <Text
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily: 'Inter-Regular',
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 20,
          }}>
          {supportText}
        </Text>
      </Text>

      <TouchableOpacity
        // onPress={sendEmail}
        onPress={() => alert('support@mirolang.ru')}
        style={{
          width: '90%',
          padding: 16,
          backgroundColor: '#1C1F26',
          alignItems: 'center',
          borderRadius: 16,
          marginTop: 20,
          flexDirection: 'row',
        }}>
        <Image
          style={{width: 48, height: 48}}
          source={require('../src/email.png')}
        />
        <View style={{gap: 4, marginLeft: 12}}>
          <Text
            style={{
              color: 'white',
              fontFamily: 'Inter-Bold',
              fontSize: 16,
              lineHeight: 20,
            }}>
            support@mirolang.ru
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.50)',
              fontFamily: 'Inter-Regular',
              fontSize: 14,
              lineHeight: 16,
            }}>
            Email для обратной связи
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
        onPress={() => alert('mirolang.ru')}
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
          source={require('../src/site.png')}
        />
        <View style={{gap: 4, marginLeft: 12}}>
          <Text
            style={{
              color: 'white',
              fontFamily: 'Inter-Bold',
              fontSize: 16,
              lineHeight: 20,
            }}>
            mirolang.ru
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.50)',
              fontFamily: 'Inter-Regular',
              fontSize: 14,
              lineHeight: 16,
            }}>
            Сайт со всей информацией
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
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});
export default Support;
