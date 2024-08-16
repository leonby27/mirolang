import React, {useEffect, useMemo, useState, useRef, useCallback} from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  Text,
  ScrollView,
} from 'react-native';
import Svg, {Path, Rect, Circle} from 'react-native-svg';
import ProVersion from '../src/components/ProVersion';

import {BottomSheetModal, BottomSheetBackdrop} from '@gorhom/bottom-sheet';

function MirolangPro({
  handleCloseModalPress,
  ProBottomSheetModalRef,
  renderBackdropPro,
  setShowProScreen,
  ProSnapPoints,
  getProgress,
  isSwipeRight,
  progress,
  navigation,
  login,
  learn,
}) {
  const handleSetProVersion = () => {
    handleCloseModalPress && handleCloseModalPress();
    if (progress.user !== null || login) {
      ProBottomSheetModalRef.current?.present();
      setShowProScreen(false);
    } else {
      navigation.navigate('Login');
      setShowProScreen(false);
    }
  };

  return (
    <View style={styles.centeredView}>
      <TouchableOpacity
        onPress={() => {
          setShowProScreen(false);
          handleCloseModalPress && handleCloseModalPress();
        }}
        style={{alignItems: 'flex-end', margin: 20, marginTop: '12%'}}>
        <Svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <Rect width="32" height="32" rx="10" fill="#22252E" />
          <Path
            d="M17.175 16.0002L22.425 10.7585C22.5819 10.6016 22.6701 10.3887 22.6701 10.1668C22.6701 9.9449 22.5819 9.73207 22.425 9.57515C22.2681 9.41823 22.0552 9.33008 21.8333 9.33008C21.6114 9.33008 21.3986 9.41823 21.2417 9.57515L16 14.8252L10.7583 9.57515C10.6014 9.41823 10.3886 9.33008 10.1667 9.33008C9.94474 9.33008 9.73191 9.41823 9.57499 9.57515C9.41807 9.73207 9.32991 9.9449 9.32991 10.1668C9.32991 10.3887 9.41807 10.6016 9.57499 10.7585L14.825 16.0002L9.57499 21.2418C9.49688 21.3193 9.43489 21.4115 9.39258 21.513C9.35027 21.6146 9.32849 21.7235 9.32849 21.8335C9.32849 21.9435 9.35027 22.0524 9.39258 22.154C9.43489 22.2555 9.49688 22.3477 9.57499 22.4252C9.65246 22.5033 9.74463 22.5653 9.84618 22.6076C9.94773 22.6499 10.0566 22.6717 10.1667 22.6717C10.2767 22.6717 10.3856 22.6499 10.4871 22.6076C10.5887 22.5653 10.6809 22.5033 10.7583 22.4252L16 17.1752L21.2417 22.4252C21.3191 22.5033 21.4113 22.5653 21.5128 22.6076C21.6144 22.6499 21.7233 22.6717 21.8333 22.6717C21.9433 22.6717 22.0523 22.6499 22.1538 22.6076C22.2554 22.5653 22.3475 22.5033 22.425 22.4252C22.5031 22.3477 22.5651 22.2555 22.6074 22.154C22.6497 22.0524 22.6715 21.9435 22.6715 21.8335C22.6715 21.7235 22.6497 21.6146 22.6074 21.513C22.5651 21.4115 22.5031 21.3193 22.425 21.2418L17.175 16.0002Z"
            fill="white"
          />
        </Svg>
      </TouchableOpacity>
      <ScrollView style={styles.modalView}>
        <Image
          style={{
            height: 120,

            width: 120,
            alignSelf: 'center',
          }}
          source={require('../src/fullPro.png')}
        />

        <View
          style={{
            padding: 16,
            alignItems: 'center',

            flexDirection: 'row',
          }}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              marginLeft: 12,
              flexDirection: 'row',
            }}>
            <Image
              style={{width: 173, height: 30}}
              source={require('../src/miroLangPro.png')}
            />
          </View>
        </View>

        <Text
          style={{
            color: 'rgba(255, 255, 255, 0.50)',
            fontFamily: 'Inter-Regular',
            fontSize: 16,
            lineHeight: 20,
            textAlign: 'center',
            marginHorizontal: 20,
            width: '90%',
            marginBottom: 10,
          }}>
          {
            'Максимум возможностей и эксклюзивные\nфункции с подпиской MiroLang Pro'
          }
        </Text>

        <View
          style={{
            width: '90%',
            height: 48,
            padding: 16,
            backgroundColor: '#1C1F26',
            alignItems: 'center',
            borderRadius: 16,
            marginTop: 12,
            flexDirection: 'row',
            marginHorizontal: 20,
            marginBottom: 25,
          }}>
          <Svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <Circle cx="14" cy="14" r="12" fill="#F1CC06" />
            <Path
              d="M11.5221 18.2026C12.1055 18.8248 12.9805 18.8248 13.5638 18.2026L19.3971 11.9804C19.9805 11.3582 19.9805 10.4248 19.3971 9.8026C18.8138 9.18038 17.9388 9.18038 17.3555 9.8026L12.543 14.7804L10.6471 12.7582C10.0638 12.1359 9.1888 12.1359 8.60547 12.7582C8.02214 13.3804 8.02214 14.3137 8.60547 14.9359L11.5221 18.2026Z"
              fill="#14161B"
            />
          </Svg>

          <View style={{flex: 1, gap: 4, marginLeft: 12, flexDirection: 'row'}}>
            <Text
              style={{
                color: 'white',
                fontFamily: 'Inter-Bold',
                fontSize: 16,
                lineHeight: 20,
              }}>
              Ежегодно
            </Text>
            <View
              style={{
                // flex: 1,
                marginLeft: 5,
                width: 40,
                height: 19,
                backgroundColor: 'rgba(241, 204, 6, 1)',
                borderRadius: 6,
              }}>
              <Text
                style={{
                  color: 'rgba(20, 22, 27, 1)',
                  fontFamily: 'Inter-Regular',
                  fontSize: 12,
                  fontWeight: 700,
                  lineHeight: 20,
                  paddingHorizontal: 3,
                  // paddingVertical: 1,
                }}>
                -99%
              </Text>
            </View>
            <Text
              style={{
                flex: 1,
                color: 'rgba(255, 255, 255, 0.3)',
                fontFamily: 'Inter-Regular',
                textAlign: 'right',
                fontSize: 16,
                fontWeight: 400,
                lineHeight: 20,
              }}>
              $0.00 в месяц
            </Text>
          </View>
        </View>

        {isSwipeRight ? (
          <>
            <View
              style={{
                width: '90%',
                padding: 16,
                backgroundColor: '#1C1F26',
                alignItems: 'center',
                borderRadius: 16,
                marginTop: 12,
                flexDirection: 'row',
                marginHorizontal: 20,
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
                    fontWeight: 700,
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
            <View
              style={{
                width: '90%',
                padding: 16,
                backgroundColor: '#1C1F26',
                alignItems: 'center',
                borderRadius: 16,
                marginTop: 12,
                flexDirection: 'row',
                marginHorizontal: 20,
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
          </>
        ) : (
          <>
            <View
              style={{
                width: '90%',
                padding: 16,
                backgroundColor: '#1C1F26',
                alignItems: 'center',
                borderRadius: 16,
                marginTop: 12,
                flexDirection: 'row',
                marginHorizontal: 20,
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
                marginHorizontal: 20,
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
                    fontWeight: 700,
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
        )}
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>
            {'Подключая полную версию, вы принимаете наши\n'}
          </Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.linkContainer}
              onPress={() => alert('Условия')}>
              <Text style={styles.link}>Условия</Text>
            </TouchableOpacity>
            <Text style={styles.text}>{'и'}</Text>
            <TouchableOpacity
              style={styles.linkContainer}
              onPress={() => alert(' Политику конфиденциальности')}>
              <Text style={styles.link}>Политику конфиденциальности</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <View
        style={{
          backgroundColor: 'rgba(20, 22, 27, 1)',
          width: '100%',
          height: '13%',
          justifyContent: 'flex-end',
        }}>
        <TouchableOpacity
          onPress={handleSetProVersion}
          style={{
            flexDirection: 'row',
            borderRadius: 12,
            backgroundColor: '#F1CC06',
            padding: 14,
            justifyContent: 'center',
            width: '90%',
            marginHorizontal: 20,
            marginBottom: 50,
          }}>
          <Svg
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <Path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M7 8.5V13.5C7 14.296 7.316 15.059 7.879 15.621C8.441 16.184 9.204 16.5 10 16.5H15C15.796 16.5 16.559 16.184 17.121 15.621C17.684 15.059 18 14.296 18 13.5V8.5C18.552 8.5 19 8.052 19 7.5V5C19 4.448 18.552 4 18 4H7C6.448 4 6 4.448 6 5V7.5C6 8.052 6.448 8.5 7 8.5Z"
              fill="#14161B"
            />
            <Path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M10.5 5V2C10.5 1.448 10.052 1 9.5 1C8.948 1 8.5 1.448 8.5 2V5C8.5 5.552 8.948 6 9.5 6C10.052 6 10.5 5.552 10.5 5Z"
              fill="#14161B"
            />
            <Path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M16.5 5V2C16.5 1.448 16.052 1 15.5 1C14.948 1 14.5 1.448 14.5 2V5C14.5 5.552 14.948 6 15.5 6C16.052 6 16.5 5.552 16.5 5Z"
              fill="#14161B"
            />
            <Path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M11.5 15.5V19C11.5 20.061 11.921 21.078 12.672 21.828C13.422 22.579 14.439 23 15.5 23H17.5C18.052 23 18.5 22.552 18.5 22C18.5 21.448 18.052 21 17.5 21H15.5C14.97 21 14.461 20.789 14.086 20.414C13.711 20.039 13.5 19.53 13.5 19C13.5 17.296 13.5 15.5 13.5 15.5C13.5 14.948 13.052 14.5 12.5 14.5C11.948 14.5 11.5 14.948 11.5 15.5Z"
              fill="#14161B"
            />
          </Svg>

          <Text
            style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 16,
              lineHeight: 20,
              color: '#14161B',
              paddingLeft: 10,
            }}>
            Подключить за $0.00 в год
          </Text>
        </TouchableOpacity>
      </View>
      <BottomSheetModal
        ref={ProBottomSheetModalRef}
        index={0}
        backdropComponent={renderBackdropPro}
        snapPoints={ProSnapPoints}
        backgroundStyle={{backgroundColor: '#14161B', borderRadius: 0}}
        handleIndicatorStyle={{backgroundColor: 'white'}}>
        <ProVersion
          closeModal={() => ProBottomSheetModalRef.current?.close()}
          setCurrentProgress={getProgress}
          navigation={navigation}
          learn={learn}
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
  link: {
    textDecorationLine: 'underline',
    color: 'rgba(255, 255, 255, 0.3)',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  linkContainer: {
    alignSelf: 'center',
  },
});
export default MirolangPro;
