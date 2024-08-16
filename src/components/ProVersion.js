import React, {useEffect} from 'react';
import {View, TouchableOpacity} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

function ProVersion({closeModal, setCurrentProgress, navigation, learn}) {
  const getProgress = async () => {
    try {
      var progress = await AsyncStorage.getItem('progress');
      const parseProgress = JSON.parse(progress);
      if (progress !== null) {
        const initialProgressData = {
          user: {
            id: parseProgress.user.id,
            provider: parseProgress.user.provider,
            email: parseProgress.user.email,
            pro: true,
          },
          data: parseProgress?.data,
        };
        // navigation.goBack();
        await AsyncStorage.setItem(
          'progress',
          JSON.stringify(initialProgressData),
        );

        await firestore().collection('users').doc(parseProgress.user.id).set({
          data: initialProgressData,
        });
        await setCurrentProgress();
        if (learn) {
          navigation.goBack();
        }
      } else {
        console.log('error progress', progress);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    getProgress();
  }, []);
  return (
    <View style={{flex: 1, justifyContent: 'space-between'}}>
      <View style={{width: '100%', alignItems: 'center'}}>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingVertical: 12,
            paddingHorizontal: 24,
          }}>
          <TouchableOpacity
            onPress={closeModal}
            style={{
              backgroundColor: '#22252E',
              borderRadius: 10,
              padding: 6,
            }}>
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <Path
                d="M11.1746 9.9982L16.4246 4.75653C16.5815 4.59961 16.6697 4.38679 16.6697 4.16487C16.6697 3.94295 16.5815 3.73012 16.4246 3.5732C16.2677 3.41628 16.0549 3.32812 15.833 3.32812C15.611 3.32812 15.3982 3.41628 15.2413 3.5732L9.99962 8.8232L4.75796 3.5732C4.60104 3.41628 4.38821 3.32813 4.16629 3.32813C3.94437 3.32813 3.73154 3.41628 3.57462 3.5732C3.4177 3.73012 3.32955 3.94295 3.32955 4.16487C3.32955 4.38679 3.4177 4.59961 3.57462 4.75653L8.82462 9.9982L3.57462 15.2399C3.49652 15.3173 3.43452 15.4095 3.39221 15.5111C3.34991 15.6126 3.32812 15.7215 3.32812 15.8315C3.32812 15.9415 3.34991 16.0505 3.39221 16.152C3.43452 16.2536 3.49652 16.3457 3.57462 16.4232C3.65209 16.5013 3.74426 16.5633 3.84581 16.6056C3.94736 16.6479 4.05628 16.6697 4.16629 16.6697C4.2763 16.6697 4.38522 16.6479 4.48677 16.6056C4.58832 16.5633 4.68049 16.5013 4.75796 16.4232L9.99962 11.1732L15.2413 16.4232C15.3188 16.5013 15.4109 16.5633 15.5125 16.6056C15.614 16.6479 15.7229 16.6697 15.833 16.6697C15.943 16.6697 16.0519 16.6479 16.1534 16.6056C16.255 16.5633 16.3472 16.5013 16.4246 16.4232C16.5027 16.3457 16.5647 16.2536 16.607 16.152C16.6493 16.0505 16.6711 15.9415 16.6711 15.8315C16.6711 15.7215 16.6493 15.6126 16.607 15.5111C16.5647 15.4095 16.5027 15.3173 16.4246 15.2399L11.1746 9.9982Z"
                fill="white"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default ProVersion;
