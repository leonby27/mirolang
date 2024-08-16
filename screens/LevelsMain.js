import React, {useRef, useState, useEffect, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Image,
  Modal,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import data from '../src/data';
import InactiveIcon from '../src/icons/inactive';
import ActiveIcon from '../src/icons/active';
import FinishedIcon from '../src/icons/finished';
import Svg, {Path, Rect} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BottomSheetModal, BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import SwiperComponent from './Swiper';
import MirolangPro from './MirolangPro';

const {height, width} = Dimensions.get('window');

function LevelsMain({navigation}) {
  const bottomSheetModalRef = useRef(null);
  const ProBottomSheetModalRef = useRef(null);
  const [showOnbording, setShowOnbording] = useState(true);
  const [progress, setProgress] = useState({
    user: null,
    data: {},
  });

  const snapPoints = useMemo(
    () => [progress?.user?.pro ? '40%' : '43%'],
    [progress?.user?.pro],
  );
  const [showProScreen, setShowProScreen] = useState(false);
  const ProSnapPoints = useMemo(() => ['40%'], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleCloseModalPress = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

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

  const SectionListRef = useRef(null);

  const [categories, setCategories] = useState([]);

  const processData = progress => {
    activateLastLevel = true;
    let lastactive = 0;
    data.forEach(category => {
      category.data.forEach(async level => {
        if (progress?.user?.pro) {
          level.state = 'active';
          activateLastLevel = false;
          lastactive = level.id;
        } else {
          if (progress.data[level.id] || activateLastLevel) {
            if (
              getLearnedWordsCount(level.id, progress) / level.words.length ==
              1
            ) {
              level.state = 'finished';
            } else if (
              getLearnedWordsCount(level.id, progress) / level.words.length >=
              0.9
            ) {
              level.state = 'learned';
            } else {
              level.state = 'active';
              activateLastLevel = false;
              lastactive = level.id;
            }
          } else {
            level.state = 'inactive';
          }
        }
      });
    });
    setCategories(data);
  };

  useEffect(() => {
    setCategories([]);
    const focusHandler = navigation.addListener('focus', () => {
      getProgress();
    });
    return focusHandler;
  }, [navigation]);

  const getProgress = async () => {
    try {
      var progress = await AsyncStorage.getItem('progress');
      if (progress !== null) {
        progress = JSON.parse(progress);
        processData(progress);
        setProgress(progress);
      } else {
        processData({
          user: null,
          data: {},
        });
        setProgress({
          user: null,
          data: {},
        });
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const getLearnedWordsCount = (levelId, progress) => {
    if (!progress.data[levelId]) {
      return 0;
    }
    return Object.values(progress.data[levelId]).reduce(
      (count, value) => count + (value.status >= 6 ? 1 : 0),
      0,
    );
  };

  return (
    <SafeAreaView style={styles.scrollview}>
      <SectionList
        sections={categories}
        stickySectionHeadersEnabled={false}
        stickyHeaderHiddenOnScroll={false}
        ref={SectionListRef}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Image
              style={{width: 64, height: 64}}
              source={require('../src/england.png')}
            />
            <Text style={styles.headerTitle}>
              {'Выучи английские слова\nвсего за 25 уровней!'}
            </Text>
            <Text style={styles.headerDescription}>
              {
                'Здесь собрано более 6,500 слов,\nчто составляет >98% всей лексики!'
              }
            </Text>
          </View>
        }
        renderSectionHeader={({section: {title}}) => (
          <View style={{width: '100%'}}>
            <Text style={styles.sectionHeader}>{title}</Text>
          </View>
        )}
        getItemLayout={(data, index) => {
          return {length: 60, offset: 60 * index, index};
        }}
        onScrollToIndexFailed={error => {
          console.log(error);
        }}
        renderItem={({item, section}) => (
          <TouchableOpacity
            onPress={
              item.state != 'inactive'
                ? () =>
                    navigation.navigate('Prestart', {
                      title: item.title,
                      level: item,
                      description: item.description,
                      progress: progress,
                    })
                : handlePresentModalPress
            }
            key={'level' + item.id.toString()}
            style={{
              width: '90%',
              marginVertical: 4,
              alignSelf: 'center',
              backgroundColor:
                item.state != 'inactive' ? '#1C1F26' : 'transparent',
              borderRadius: 16,
            }}>
            <LinearGradient
              colors={
                item.state == 'active' || item.state == 'learned'
                  ? ['rgba(246, 160, 34, 0.1)', 'rgba(246, 160, 34, 0)']
                  : item.state == 'finished'
                  ? ['rgba(24, 161, 30, 0.05)', 'rgba(246, 160, 34, 0)']
                  : ['transparent', 'transparent']
              }
              start={{x: 0, y: 1}}
              end={{x: 1, y: 1}}
              style={{
                padding: 12,
                width: '100%',
                gap: 8,
                alignItems: 'center',
                borderRadius: 16,
                flexDirection: 'row',
                borderWidth: 1,
                borderColor:
                  item.state != 'inactive'
                    ? 'transparent'
                    : 'rgba(39, 45, 53, 0.7)',
              }}>
              {item.state == 'finished' ? (
                <FinishedIcon />
              ) : item.state == 'inactive' ? (
                <InactiveIcon number={item.id} />
              ) : (
                <ActiveIcon number={item.id} />
              )}
              <View style={{gap: 2, width: '70%'}}>
                <Text
                  style={{
                    width: '100%',
                    color:
                      item.state == 'inactive'
                        ? 'rgba(255,255,255,0.5)'
                        : 'white',
                    fontSize: 16,
                    lineHeight: 20,
                    fontFamily: 'Inter-Bold',
                  }}>
                  {item.state != 'inactive' ? item.title : 'Уровень закрыт'}
                  {item.state != 'finished' && item.state != 'inactive' && (
                    <>
                      {Math.round(
                        (getLearnedWordsCount(item.id, progress) /
                          item.words.length) *
                          100,
                      ) > 0 ? (
                        <Text
                          style={{
                            color:
                              item.state != 'learned' ? '#DF7D23' : 'white',
                          }}>
                          {' '}
                          ·{' '}
                          {Math.round(
                            (getLearnedWordsCount(item.id, progress) /
                              item.words.length) *
                              100,
                          )}
                          %
                        </Text>
                      ) : null}
                    </>
                  )}
                </Text>
                <Text
                  style={{
                    width: '100%',
                    color: 'rgba(255, 255, 255, 0.50))',
                    fontSize: 14,
                    lineHeight: 16,
                    fontFamily: 'Inter-Regular',
                  }}>
                  {item.description}
                </Text>
              </View>
              {item.state != 'inactive' && (
                <Svg
                  style={{position: 'absolute', right: 12}}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none">
                  <Path
                    d="M16.4989 12.0165C16.4996 12.3662 16.3776 12.7052 16.1539 12.9745L10.1539 20.4592C9.89934 20.7649 9.53347 20.9572 9.13683 20.9937C8.74019 21.0302 8.34527 20.9079 8.03895 20.6538C7.73262 20.3997 7.53999 20.0346 7.50342 19.6388C7.46685 19.243 7.58934 18.8488 7.84395 18.5431L13.0639 12.0165L8.08395 5.48979C7.95935 5.33667 7.8663 5.16049 7.81015 4.97136C7.75401 4.78224 7.73587 4.58391 7.75677 4.38777C7.77768 4.19163 7.83723 4.00154 7.93199 3.82844C8.02675 3.65534 8.15486 3.50263 8.30895 3.3791C8.46318 3.24201 8.64412 3.13819 8.84043 3.07413C9.03674 3.01007 9.24419 2.98716 9.44979 3.00684C9.65538 3.02651 9.85469 3.08834 10.0352 3.18846C10.2158 3.28858 10.3736 3.42484 10.4989 3.58868L16.2439 11.0734C16.4322 11.3505 16.522 11.6825 16.4989 12.0165Z"
                    fill="rgba(255, 255, 255, 0.5)"
                  />
                </Svg>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      />
      <Modal
        transparent={true}
        visible={showOnbording}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
        }}>
        <SwiperComponent
          setShowOnbording={setShowOnbording}
          getProgress={getProgress}
        />
      </Modal>
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
          handleCloseModalPress={handleCloseModalPress}
          progress={progress}
          navigation={navigation}
        />
      </Modal>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        backdropComponent={renderBackdrop}
        snapPoints={snapPoints}
        backgroundStyle={{backgroundColor: '#14161B', borderRadius: 0}}
        handleIndicatorStyle={{backgroundColor: 'white'}}>
        <View style={{alignItems: 'center'}}>
          <View
            style={{
              paddingVertical: 12,
              paddingHorizontal: 24,
              width: '100%',
              alignItems: 'flex-end',
            }}>
            <TouchableOpacity
              onPress={handleCloseModalPress}
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
          <Image
            style={{width: 80, height: 80}}
            source={require('../src/lock.png')}
          />
          <Text
            style={{
              marginTop: 19,
              width: '100%',
              color: 'white',
              fontFamily: 'Inter-Bold',
              textAlign: 'center',
              fontSize: 24,
              lineHeight: 32,
            }}>
            Уровень закрыт
          </Text>
          <Text style={styles.headerDescription}>
            {'Пройдите предыдущие уровни хотя бы на\n90%, чтобы открыть этот.'}
          </Text>
        </View>

        {!progress?.user?.pro ? (
          <TouchableOpacity
            onPress={() => {
              setShowProScreen(!showProScreen);
              handleCloseModalPress();
            }}
            style={{
              flexDirection: 'row',
              borderRadius: 12,
              backgroundColor: '#F1CC06',
              padding: 14,
              justifyContent: 'center',
              width: '90%',
              marginHorizontal: 20,
              marginBottom: 50,
              marginTop: 20,
            }}>
            <Text
              style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 16,
                lineHeight: 20,
                color: '#14161B',
                paddingLeft: 10,
              }}>
              Хочу открыть уровень
            </Text>
          </TouchableOpacity>
        ) : null}
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollview: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 16,
    paddingVertical: 28,
    backgroundColor: '#14161B',
    alignItems: 'center',
  },
  headerTitle: {
    width: '100%',
    color: 'white',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
    marginTop: 12,
  },
  headerDescription: {
    width: '100%',
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 20,
    marginTop: 8,
  },
  sectionHeader: {
    color: 'rgba(255, 255, 255, 0.50)',
    width: '90%',
    alignSelf: 'center',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
    marginTop: 28,
    marginBottom: 8,
  },
});

export default LevelsMain;
