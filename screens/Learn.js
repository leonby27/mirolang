import React, {useRef, useState, useEffect, useMemo, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  AppState,
  SafeAreaView,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, {Path, G} from 'react-native-svg';
import Tts from 'react-native-tts';
import {StackActions} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import Sound from 'react-native-sound';
import Swiper from 'react-native-deck-swiper';
import {BottomSheetModal, BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import MirolangPro from './MirolangPro';

Sound.setCategory('Playback');

var whoosh = new Sound('1sec_silence.mp3', Sound.MAIN_BUNDLE, error => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }

  whoosh.play(success => {
    if (success) {
      console.log('successfully finished playing');
    } else {
      console.log('playback failed due to audio decoding errors');
    }
  });
});

function LearnScreen({navigation, route}) {
  const bottomSheetModalRef = useRef(null);
  const ProBottomSheetModalRef = useRef(null);
  const [CardIndex, setCardindex] = useState(0);
  const [canCancel, setCanCancel] = useState(false);
  cardRef = useRef(null);
  var nextCardTimer = null;
  const {filter, translateMode, level} = route.params;
  const [words, setWords] = useState([]);
  const [progress, setProgress] = useState(
    JSON.parse(JSON.stringify(route.params.progress)),
  );
  const [finished, setFinished] = useState(false);
  const [nextCardTime, setNextCardTime] = useState(null);
  const [isSwipeRight, setIsSwipeRight] = useState(false);

  Tts.setDefaultLanguage('en-CA');
  Tts.addEventListener('tts-start', event => console.log('start', event));
  Tts.addEventListener('tts-finish', event => console.log('finish', event));
  Tts.addEventListener('tts-cancel', event => console.log('cancel', event));

  const ProSnapPoints = useMemo(() => ['40%'], []);
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

  const recentItemsCount = useMemo(() => {
    const currentTime = new Date();

    const data = progress.data || {};

    return Object.values(data).reduce((total, items) => {
      const recentItems = Object.values(items).filter(item => {
        if (!item.date || item.status !== 1) return false;

        const itemDate =
          item.date instanceof Date ? item.date : new Date(item.date);
        const timeDifference = currentTime - itemDate;

        return timeDifference <= 24 * 60 * 60 * 1000 && timeDifference >= 0;
      }).length;

      return total + recentItems;
    }, 0);
  }, [progress]);

  useEffect(() => {
    if (recentItemsCount > 0 && !progress?.user?.pro) {
      navigation.setOptions({
        headerTitle: () => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingRight: 15,
            }}>
            <Text
              style={[
                styles.canceltext,
                {
                  paddingRight: 10,
                  fontWeight: '400',
                  fontSize: 12,
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              ]}>
              Учу:
            </Text>
            <TouchableOpacity
              style={styles.cancelbutton}
              onPress={() => {
                handlePresentModalPress();
                setIsSwipeRight(true);
              }}>
              <Text
                style={[
                  styles.canceltext,
                  {
                    color:
                      recentItemsCount > 9
                        ? 'rgba(255, 88, 88, 1)'
                        : 'rgba(255, 255, 255, 1)',
                  },
                ]}>{`${recentItemsCount} / 10`}</Text>
            </TouchableOpacity>
          </View>
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: () => null,
      });
    }
  }, [navigation, recentItemsCount, progress?.user?.pro]);

  useEffect(() => {
    if (CardIndex > 0) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={() => Cancel()}
            style={styles.cancelbutton}>
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <Path
                d="M17 10V12.371C17 13.9511 15.7145 15.2367 14.1343 15.2367H5.98741L6.25705 15.5063C6.59877 15.848 6.59877 16.402 6.25705 16.7437C6.08621 16.9146 5.86223 17 5.63834 17C5.4144 17 5.19051 16.9146 5.01964 16.7437L3.25629 14.9804C3.09218 14.8163 3 14.5937 3 14.3617C3 14.1296 3.0922 13.907 3.25629 13.7429L5.01964 11.9796C5.36135 11.6379 5.91536 11.6379 6.25708 11.9796C6.59879 12.3213 6.59879 12.8754 6.25708 13.2171L5.98747 13.4867H14.1344C14.7496 13.4867 15.25 12.9862 15.25 12.371V10C15.25 9.51675 15.6418 9.125 16.125 9.125C16.6083 9.125 17 9.51675 17 10ZM3.875 10.875C4.35825 10.875 4.75 10.4832 4.75 10V7.62896C4.75 7.01381 5.25047 6.51334 5.86565 6.51334H14.0126L13.7429 6.78298C13.4012 7.12469 13.4012 7.6787 13.7429 8.02042C13.9138 8.19129 14.1377 8.27671 14.3617 8.27671C14.5856 8.27671 14.8095 8.19129 14.9804 8.02042L16.7437 6.25707C17.0854 5.91536 17.0854 5.36135 16.7437 5.01963L14.9804 3.25629C14.6387 2.91457 14.0847 2.91457 13.7429 3.25629C13.4012 3.598 13.4012 4.15201 13.7429 4.49373L14.0126 4.76334H5.86565C4.28554 4.76334 3 6.04885 3 7.62896V10C3 10.4832 3.39175 10.875 3.875 10.875Z"
                fill="white"
              />
            </Svg>
            <Text style={styles.canceltext}>Отменить</Text>
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: () => null,
      });
    }
  }, [navigation, CardIndex, canCancel]);

  const snapPoints = useMemo(() => ['40%'], []);

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

  const Cancel = () => {
    if (canCancel) {
      setFinished(false);
      setCanCancel(false);
      const id = words[CardIndex - 1]?.id;
      setCardindex(CardIndex - 1);
      updatedProgress = {...progress};
      if (!updatedProgress?.data?.[level.id]) {
        updatedProgress.data[level.id] = {};
      }
      now = new Date();
      updatedProgress.data[level.id][id] = {
        status: route.params.progress?.data?.[level.id]?.[id]?.status,
        date: route.params.progress?.data?.[level.id]?.[id]?.date,
      };
      setProgress(updatedProgress);
      cardRef.current?.swipeBack();
    }
  };

  const Right = cardIndex => {
    if (!progress?.user?.pro && recentItemsCount > 9) {
      setShowProScreen(!showProScreen);
    } else {
      setCardindex(cardIndex + 1);
      let updatedProgress = {...progress};
      if (!updatedProgress?.data?.[level.id]) {
        updatedProgress.data[level.id] = {};
      }
      const id = words[cardIndex]?.id;
      const now = new Date();
      if (updatedProgress?.data?.[level.id]?.[id]?.status > 0) {
        updatedProgress.data[level.id][id] = {
          status:
            updatedProgress.data[level.id][id]?.status > 1
              ? updatedProgress.data[level.id][id]?.status - 1
              : 1,
          date: now,
        };
      } else {
        updatedProgress.data[level.id][id] = {
          status: 1,
          date: now,
        };
      }
      setProgress(updatedProgress);
    }
  };

  const Left = cardIndex => {
    setCardindex(CardIndex + 1);
    updatedProgress = {...progress};
    if (!updatedProgress?.data?.[level.id]) {
      updatedProgress.data[level.id] = {};
    }
    const id = words[cardIndex]?.id;
    const now = new Date();
    if (updatedProgress?.data?.[level.id]?.[id]?.status > 0) {
      updatedProgress.data[level.id][id] = {
        status: updatedProgress.data[level.id][id]?.status + 1,
        date: now,
      };
    } else {
      updatedProgress.data[level.id][id] = {
        status: 7,
        date: now,
      };
    }
    setProgress(updatedProgress);
  };

  const Bottom = cardIndex => {
    setCardindex(CardIndex + 1);
    updatedProgress = {...progress};
    if (!updatedProgress?.data?.[level.id]) {
      updatedProgress.data[level.id] = {};
    }
    const id = words[cardIndex]?.id;
    const now = new Date();
    updatedProgress.data[level.id][id] = {
      status: 0,
      date: now,
    };
    setProgress(updatedProgress);
  };

  const Top = cardIndex => {
    setCardindex(CardIndex + 1);
    updatedProgress = {...progress};
    if (!updatedProgress?.data?.[level.id]) {
      updatedProgress.data[level.id] = {};
    }
    const id = words[cardIndex]?.id;
    const now = new Date();
    updatedProgress.data[level.id][id] = {
      status: 6,
      date: now,
    };
    setProgress(updatedProgress);
  };

  const normalizeData = () => {
    var words = [];
    setFinished(false);
    const now = new Date();
    level.words.forEach(word => {
      newWord = {...word};
      if (
        (progress?.data?.[level.id]?.[newWord.id]?.status == undefined &&
          filter != 'repeat') ||
        (progress?.data?.[level.id]?.[newWord.id]?.status == 0 &&
          filter != 'repeat') ||
        (progress?.data?.[level.id]?.[newWord.id]?.status == 1 &&
          filter != 'new') ||
        (progress?.data?.[level.id]?.[newWord.id]?.status == 2 &&
          filter != 'new' &&
          now - new Date(progress?.data?.[level.id]?.[newWord.id]?.date) >=
            5 * 60 * 1000) ||
        (progress?.data?.[level.id]?.[newWord.id]?.status == 3 &&
          filter != 'new' &&
          now - new Date(progress?.data?.[level.id]?.[newWord.id]?.date) >=
            30 * 60 * 1000) ||
        (progress?.data?.[level.id]?.[newWord.id]?.status == 4 &&
          filter != 'new' &&
          now - new Date(progress?.data?.[level.id]?.[newWord.id]?.date) >=
            24 * 60 * 60 * 1000) ||
        (progress?.data?.[level.id]?.[newWord.id]?.status == 5 &&
          filter != 'new' &&
          now - new Date(progress?.data?.[level.id]?.[newWord.id]?.date) >=
            7 * 24 * 60 * 60 * 1000)
      ) {
        newWord.status = progress?.data?.[level.id]?.[newWord.id]?.status;
        words.push(newWord);
      }
    });

    if (words.length === 0) {
      processEnd();
    } else {
      setWords(JSON.parse(JSON.stringify(words)));
    }
  };

  const getMinTimeForNextWord = () => {
    if (nextCardTimer !== null) {
      clearInterval(nextCardTimer);
    }
    var minTime = null;
    var now = new Date();
    level.words.forEach(word => {
      newWord = {...word};
      if (
        (progress?.data?.[level.id]?.[newWord.id]?.status == undefined &&
          filter != 'repeat') ||
        (progress?.data?.[level.id]?.[newWord.id]?.status == 0 &&
          filter != 'repeat') ||
        (progress?.data?.[level.id]?.[newWord.id]?.status == 1 &&
          filter != 'new') ||
        (progress?.data?.[level.id]?.[newWord.id]?.status == 2 &&
          filter != 'new' &&
          now - new Date(progress?.data?.[level.id]?.[newWord.id]?.date) >=
            5 * 60 * 1000) ||
        (progress?.data?.[level.id]?.[newWord.id]?.status == 3 &&
          filter != 'new' &&
          now - new Date(progress?.data?.[level.id]?.[newWord.id]?.date) >=
            30 * 60 * 1000) ||
        (progress?.data?.[level.id]?.[newWord.id]?.status == 4 &&
          filter != 'new' &&
          now - new Date(progress?.data?.[level.id]?.[newWord.id]?.date) >=
            24 * 60 * 60 * 1000) ||
        (progress?.data?.[level.id]?.[newWord.id]?.status == 5 &&
          filter != 'new' &&
          now - new Date(progress?.data?.[level.id]?.[newWord.id]?.date) >=
            7 * 24 * 60 * 60 * 1000)
      ) {
        minTime = 0;
      } else if (
        (progress?.data?.[level.id]?.[newWord.id]?.status == 2 &&
          filter != 'new' &&
          now - new Date(progress?.data?.[level.id]?.[newWord.id]?.date) <
            5 * 60 * 1000) ||
        (progress?.data?.[level.id]?.[newWord.id]?.status == 3 &&
          filter != 'new' &&
          now - new Date(progress?.data?.[level.id]?.[newWord.id]?.date) <
            30 * 60 * 1000) ||
        (progress?.data?.[level.id]?.[newWord.id]?.status == 4 &&
          filter != 'new' &&
          now - new Date(progress?.data?.[level.id]?.[newWord.id]?.date) <
            24 * 60 * 60 * 1000) ||
        (progress?.data?.[level.id]?.[newWord.id]?.status == 5 &&
          filter != 'new' &&
          now - new Date(progress?.data?.[level.id]?.[newWord.id]?.date) <
            7 * 24 * 60 * 60 * 1000)
      ) {
        updatedNextWordTime =
          progress?.data?.[level.id]?.[newWord.id]?.status == 2
            ? 5 * 60 * 1000 -
              (now - new Date(progress?.data?.[level.id]?.[newWord.id]?.date))
            : progress?.data?.[level.id]?.[newWord.id]?.status == 3
            ? 30 * 60 * 1000 -
              (now - new Date(progress?.data?.[level.id]?.[newWord.id]?.date))
            : progress?.data?.[level.id]?.[newWord.id]?.status == 4
            ? 24 * 60 * 60 * 1000 -
              (now - new Date(progress?.data?.[level.id]?.[newWord.id]?.date))
            : 7 * 24 * 60 * 60 * 1000 -
              (now - new Date(progress?.data?.[level.id]?.[newWord.id]?.date));

        if (minTime == null || updatedNextWordTime < minTime) {
          if (updatedNextWordTime < 0) {
            minTime = 0;
          } else {
            minTime = updatedNextWordTime;
          }
        }
      }
    });
    return minTime;
  };

  const processEnd = () => {
    minTime = getMinTimeForNextWord();
    if (minTime != null) {
      setNextCardTime(minTime);
      nextCardTimer = setInterval(
        () =>
          setNextCardTime(currentState =>
            currentState > 60000 ? currentState - 60000 : 0,
          ),
        60000,
      );
    }
    setFinished(true);
  };
  function dhm(ms) {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const daysms = ms % (24 * 60 * 60 * 1000);
    const hours = Math.floor(daysms / (60 * 60 * 1000));
    const hoursms = ms % (60 * 60 * 1000);
    const minutes = Math.ceil(hoursms / (60 * 1000));
    var string = days + ' дн. ' + hours + ' ч. и ' + minutes + ' мин.';

    return string;
  }

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      normalizeData();
    });
    return focusHandler;
  }, [navigation]);

  useEffect(() => {
    const blurHandler = navigation.addListener('blur', async () => {
      await AsyncStorage.setItem('progress', JSON.stringify(progress));
      if (progress?.user?.id) {
        await firestore().collection('users').doc(progress?.user?.id).set({
          data: progress,
        });
      }
    });
    const handleAppStateChange = async newState => {
      if (newState === 'background') {
        try {
          await AsyncStorage.setItem('progress', JSON.stringify(progress));
        } catch (error) {
          console.error('Error saving data to AsyncStorage:', error);
        }
      }
    };

    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      appStateSubscription.remove();
      blurHandler;
    };
  }, [progress, navigation]);

  const Card = React.memo(({card, cardIndex}) => {
    const [show, setShow] = useState(false);
    const [learn, setLearn] = useState(null);
    const [kebabMenuVisible, setKebabMenuVisible] = useState(false);

    const handleSwipeRight = () => {
      if (!progress?.user?.pro && recentItemsCount > 9) {
        setShowProScreen(!showProScreen);
        setIsSwipeRight(true);
      } else {
        setLearn(true), cardRef.current?.swipeRight();
      }
    };
    return (
      <View style={styles.card}>
        <View style={{width: '100%', alignItems: 'center'}}>
          <View
            style={{
              zIndex: 9,
              width: '100%',
              marginTop: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            {card?.status > 0 ? (
              <View style={{left: -6}}>
                <View style={styles.Repeat}>
                  <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <Path
                      d="M11.8022 6.46423C11.786 6.39371 11.7525 6.3283 11.7048 6.27392C11.657 6.21954 11.5966 6.1778 11.5288 6.15251L8.37877 4.97126L9.1772 0.962668C9.19558 0.869813 9.18372 0.773519 9.14338 0.687896C9.103 0.602277 9.03628 0.531831 8.95298 0.486887C8.86885 0.442139 8.7723 0.426455 8.67837 0.442279C8.58439 0.458103 8.49829 0.504548 8.43345 0.574387L2.30847 7.13689C2.25828 7.18895 2.22196 7.25278 2.20285 7.32256C2.18374 7.3923 2.18245 7.46571 2.19909 7.53611C2.21621 7.60624 2.25001 7.67121 2.29762 7.72546C2.34522 7.77975 2.40522 7.82171 2.47253 7.84782L5.62252 9.02907L4.82408 13.0377C4.80575 13.1305 4.8176 13.2268 4.85794 13.3124C4.89828 13.3981 4.965 13.4685 5.0483 13.5134C5.11112 13.5451 5.18033 13.562 5.25064 13.5627C5.3101 13.5629 5.36894 13.5509 5.4235 13.5274C5.4781 13.5039 5.52723 13.4693 5.56783 13.4259L11.6928 6.86345C11.743 6.81139 11.7793 6.74756 11.7984 6.67777C11.8176 6.60804 11.8189 6.53462 11.8022 6.46423Z"
                      fill="white"
                    />
                  </Svg>
                  <Text style={styles.RepeatText}>
                    Осталось повторов: {6 - card?.status}
                  </Text>
                </View>
                <View
                  style={{
                    width: 3,
                    height: 4,
                    backgroundColor: '#CD4A00',
                    borderBottomLeftRadius: 6,
                  }}>
                  <View
                    style={{
                      width: 6,
                      height: 8,
                      backgroundColor: '#652501',
                      borderTopLeftRadius: 5,
                      borderBottomLeftRadius: 6,
                    }}></View>
                </View>
              </View>
            ) : (
              <View></View>
            )}
            <View style={{flexDirection: 'row', marginRight: 16}}>
              <TouchableOpacity
                onPress={() => {
                  Tts.stop();
                  Tts.speak(`${card?.word}`);
                }}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: '#272D35',
                  borderRadius: 10,
                  backgroundColor: '#22252E',
                }}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M11.2588 3.69181C11.478 3.7827 11.6654 3.93655 11.7972 4.13391C11.929 4.33128 11.9992 4.56329 11.9992 4.80061V19.2006C11.9992 19.4379 11.9288 19.6699 11.7969 19.8672C11.665 20.0645 11.4776 20.2182 11.2584 20.309C11.0392 20.3999 10.7979 20.4236 10.5652 20.3773C10.3324 20.331 10.1186 20.2167 9.95082 20.049L5.50242 15.6006H2.39922C2.08095 15.6006 1.77573 15.4742 1.55069 15.2491C1.32565 15.0241 1.19922 14.7188 1.19922 14.4006V9.60061C1.19922 9.28235 1.32565 8.97713 1.55069 8.75208C1.77573 8.52703 2.08095 8.40061 2.39922 8.40061H5.50242L9.95082 3.95221C10.1186 3.78428 10.3325 3.66992 10.5653 3.62357C10.7981 3.57721 11.0395 3.60096 11.2588 3.69181ZM17.5876 3.51541C17.8126 3.29045 18.1178 3.16406 18.436 3.16406C18.7543 3.16406 19.0594 3.29045 19.2844 3.51541C20.4002 4.62859 21.2851 5.95123 21.8883 7.40738C22.4914 8.86352 22.801 10.4245 22.7992 12.0006C22.801 13.5768 22.4914 15.1377 21.8883 16.5938C21.2851 18.05 20.4002 19.3727 19.2844 20.4858C19.0581 20.7044 18.755 20.8254 18.4403 20.8226C18.1257 20.8199 17.8247 20.6936 17.6023 20.4711C17.3798 20.2487 17.2535 19.9477 17.2508 19.6331C17.248 19.3184 17.369 19.0153 17.5876 18.789C18.4805 17.8987 19.1887 16.8405 19.6712 15.6756C20.1538 14.5105 20.4011 13.2615 20.3992 12.0006C20.3992 9.34861 19.3264 6.95101 17.5876 5.21221C17.3626 4.98717 17.2363 4.682 17.2363 4.36381C17.2363 4.04561 17.3626 3.74043 17.5876 3.51541ZM14.1928 6.90901C14.3043 6.79743 14.4367 6.70892 14.5823 6.64854C14.728 6.58814 14.8841 6.55706 15.0418 6.55706C15.1995 6.55706 15.3556 6.58814 15.5013 6.64854C15.647 6.70892 15.7793 6.79743 15.8908 6.90901C16.5603 7.577 17.0912 8.37068 17.453 9.24446C17.8148 10.1182 18.0004 11.0549 17.9992 12.0006C18.0004 12.9463 17.8148 13.8829 17.4529 14.7567C17.0911 15.6305 16.5602 16.4241 15.8908 17.0922C15.6657 17.3174 15.3603 17.4439 15.0418 17.4439C14.7233 17.4439 14.4179 17.3174 14.1928 17.0922C13.9677 16.8671 13.8411 16.5617 13.8411 16.2432C13.8411 15.9248 13.9677 15.6194 14.1928 15.3942C14.6395 14.9492 14.9936 14.4203 15.235 13.8379C15.4763 13.2554 15.6002 12.6311 15.5992 12.0006C15.6002 11.3701 15.4765 10.7457 15.235 10.1633C14.9937 9.58087 14.6395 9.05196 14.1928 8.60701C14.0812 8.49555 13.9928 8.36322 13.9323 8.21754C13.8719 8.07186 13.8409 7.9157 13.8409 7.75801C13.8409 7.60031 13.8719 7.44415 13.9323 7.29848C13.9928 7.1528 14.0812 7.02045 14.1928 6.90901Z"
                    fill="white"
                  />
                </Svg>
              </TouchableOpacity>
              {card?.status ? (
                <TouchableOpacity
                  onPress={() => setKebabMenuVisible(!kebabMenuVisible)}
                  style={{
                    paddingHorizontal: 8,
                    marginLeft: 12,
                    paddingVertical: 6,
                    borderWidth: 1,
                    borderColor: '#272D35',
                    borderRadius: 10,
                    backgroundColor: '#22252E',
                  }}>
                  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 7C13.1046 7 14 6.10457 14 5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5C10 6.10457 10.8954 7 12 7Z"
                      fill="white"
                    />
                    <Path
                      d="M12 21C13.1046 21 14 20.1046 14 19C14 17.8954 13.1046 17 12 17C10.8954 17 10 17.8954 10 19C10 20.1046 10.8954 21 12 21Z"
                      fill="white"
                    />
                    <Path
                      d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
                      fill="white"
                    />
                  </Svg>
                </TouchableOpacity>
              ) : null}
              <View
                style={{
                  backgroundColor: '#22252E',
                  borderWidth: 1,
                  borderColor: '#313843',
                  borderRadius: 12,
                  position: 'absolute',
                  zIndex: 100,
                  marginTop: 48,
                  right: 0,
                  display: kebabMenuVisible ? 'flex' : 'none',
                }}>
                <Pressable
                  onPress={() => setKebabMenuVisible(false)}
                  style={{
                    width: 1000,
                    height: 1000,
                    position: 'absolute',
                    left: -500,
                    top: -200,
                  }}></Pressable>
                <TouchableOpacity
                  onPress={() => cardRef.current?.swipeBottom()}
                  style={{
                    gap: 8,
                    padding: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <Path
                      d="M14.1665 2.7513C10.9165 0.917969 6.9165 1.5013 4.24984 3.91797V2.5013C4.24984 2.0013 3.9165 1.66797 3.4165 1.66797C2.9165 1.66797 2.58317 2.0013 2.58317 2.5013V6.2513C2.58317 6.7513 2.9165 7.08464 3.4165 7.08464H7.1665C7.6665 7.08464 7.99984 6.7513 7.99984 6.2513C7.99984 5.7513 7.6665 5.41797 7.1665 5.41797H5.1665C6.4165 4.08464 8.1665 3.33464 9.99984 3.33464C13.6665 3.33464 16.6665 6.33464 16.6665 10.0013C16.6665 10.5013 16.9998 10.8346 17.4998 10.8346C17.9998 10.8346 18.3332 10.5013 18.3332 10.0013C18.3332 7.0013 16.7498 4.2513 14.1665 2.7513ZM16.5832 12.918H12.8332C12.3332 12.918 11.9998 13.2513 11.9998 13.7513C11.9998 14.2513 12.3332 14.5846 12.8332 14.5846H14.8332C13.5832 15.918 11.8332 16.668 9.99984 16.668C6.33317 16.668 3.33317 13.668 3.33317 10.0013C3.33317 9.5013 2.99984 9.16797 2.49984 9.16797C1.99984 9.16797 1.6665 9.5013 1.6665 10.0013C1.6665 14.5846 5.4165 18.3346 9.99984 18.3346C12.1665 18.3346 14.1665 17.5013 15.7498 16.0013V17.5013C15.7498 18.0013 16.0832 18.3346 16.5832 18.3346C17.0832 18.3346 17.4165 18.0013 17.4165 17.5013V13.7513C17.4165 13.2513 16.9998 12.918 16.5832 12.918Z"
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
                    Сбросить прогресс по слову
                  </Text>
                </TouchableOpacity>
                {card?.status > 0 && (
                  <TouchableOpacity
                    onPress={() => cardRef.current?.swipeTop()}
                    style={{
                      gap: 8,
                      borderTopWidth: 1,
                      borderColor: '#313843',
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <Path
                        d="M4.5 10L8.5 14L16 5.5"
                        stroke="white"
                        stroke-opacity="0.5"
                        stroke-width="2.2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </Svg>
                    <Text
                      style={{
                        fontFamily: 'Inter-Regular',
                        fontSize: 16,
                        lineHeight: 20,
                        color: 'rgba(255, 255, 255, 0.70)',
                      }}>
                      Отметить как выученное
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          <Text style={styles.level}>Уровень {level.id}</Text>
          <Text style={styles.word}>
            {translateMode == 'english'
              ? card?.word
              : translateMode == 'russian'
              ? card?.ru
              : translateMode == 'swap' && cardIndex % 2 == 0
              ? card?.word
              : translateMode == 'random' && card?.id % 2 == 0
              ? card?.word
              : card?.ru}
          </Text>
          <Text style={[styles.level, {marginTop: 4}]}>
            {translateMode == 'english'
              ? card?.transcription
              : translateMode == 'russian'
              ? ' '
              : translateMode == 'swap' && cardIndex % 2 == 0
              ? card?.transcription
              : translateMode == 'random' && card?.id % 2 == 0
              ? card?.transcription
              : ' '}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (cardIndex >= CardIndex) {
                setShow(!show);
              }
            }}
            style={styles.showTranslateButton}>
            {show ? (
              <Text style={[styles.word, {marginTop: 0}]}>
                {translateMode == 'english'
                  ? card?.ru
                  : translateMode == 'russian'
                  ? card?.word
                  : translateMode == 'swap' && cardIndex % 2 == 0
                  ? card?.ru
                  : translateMode == 'random' && card?.id % 2 == 0
                  ? card?.ru
                  : card?.word}
              </Text>
            ) : (
              <Svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <G opacity="0.2">
                  <Path
                    d="M16.6667 12.0002C14.4 12.0002 12.6667 13.7335 12.6667 16.0002C12.6667 18.2668 14.4 20.0002 16.6667 20.0002C18.9334 20.0002 20.6667 18.2668 20.6667 16.0002C20.6667 13.7335 18.9334 12.0002 16.6667 12.0002ZM29.8667 15.4668C27.2 9.20016 22.1334 5.3335 16.6667 5.3335C11.2 5.3335 6.13337 9.20016 3.4667 15.4668C3.33337 15.8668 3.33337 16.1335 3.4667 16.5335C6.13337 22.8002 11.2 26.6668 16.6667 26.6668C22.1334 26.6668 27.2 22.8002 29.8667 16.5335C30 16.1335 30 15.8668 29.8667 15.4668ZM16.6667 22.6668C12.9334 22.6668 10 19.7335 10 16.0002C10 12.2668 12.9334 9.3335 16.6667 9.3335C20.4 9.3335 23.3334 12.2668 23.3334 16.0002C23.3334 19.7335 20.4 22.6668 16.6667 22.6668Z"
                    fill="white"
                  />
                </G>
              </Svg>
            )}
          </TouchableOpacity>
        </View>

        <View style={{width: '100%'}}>
          <Text
            style={{
              marginBottom: 24,
              fontFamily: 'Inter-Regular',
              fontSize: 16,
              lineHeight: 20,
              color: 'rgba(255, 255, 255, 0.30)',
              width: '100%',
              textAlign: 'center',
            }}>
            {cardIndex + 1} / {words.length}
          </Text>
          <View
            style={{
              width: '100%',
              paddingHorizontal: 12,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 20,
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => {
                setLearn(false), cardRef.current?.swipeLeft();
              }}
              style={[
                styles.swipeButton,
                learn === false && {backgroundColor: '#108C15'},
              ]}>
              <Text style={styles.swipeButtonText}>
                {card?.status > 0 ? 'Вспомнил' : 'Пропуск'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSwipeRight}
              style={[
                styles.swipeButton,
                learn === true && {backgroundColor: '#FF5858'},
              ]}>
              <Text style={styles.swipeButtonText}>
                {card?.status > 0 ? 'Забыл' : 'Учить'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      {finished && (
        <View
          style={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            alignSelf: 'flex-end',
            bottom: 0,
          }}>
          <Image
            style={{width: 160, height: 160, marginTop: 68}}
            source={
              filter == 'all' && nextCardTime == null
                ? require('../src/finish.png')
                : require('../src/learn.png')
            }
          />
          <Text
            style={{
              fontFamily: 'Inter-Bold',
              marginTop: 14,
              width: '100%',
              textAlign: 'center',
              fontSize: 24,
              lineHeight: 32,
              color: 'white',
            }}>
            {filter == 'all' && nextCardTime == null
              ? 'Вы выучили все слова!'
              : filter == 'all' && nextCardTime != null
              ? 'Слова скоро появятся'
              : filter == 'new'
              ? 'Не осталось новых слов'
              : filter == 'repeat' && nextCardTime == null
              ? 'Нет слов для повторения'
              : 'Слова скоро появятся'}
          </Text>
          <Text
            style={{
              fontFamily: 'Inter-Regular',
              marginTop: 12,
              width: '100%',
              textAlign: 'center',
              fontSize: 16,
              lineHeight: 20,
              color: 'rgba(255, 255, 255, 0.50)',
            }}>
            {filter == 'all' && nextCardTime == null
              ? 'Больше нет доступных новых слов. Вы\nможете выбрать другую категорию либо\nнастроить ваш прогресс.'
              : filter == 'all' && nextCardTime != null
              ? 'Повторения будут доступны через:'
              : filter == 'new'
              ? 'Вы пролистали все доступные слова.\nСбросьте фильтр, либо выберите другой\nуровень сложности.'
              : filter == 'repeat' && nextCardTime == null
              ? 'Вы повторили все слова. Сбросьте фильтр,\nлибо выберите другой уровень.'
              : 'Повторения будут доступны через:'}
          </Text>

          {nextCardTime != null && (
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                width: '100%',
                textAlign: 'center',
                fontSize: 16,
                lineHeight: 20,
                color: '#DF7D23',
              }}>
              {dhm(nextCardTime)}
            </Text>
          )}

          <View
            style={{
              width: '100%',
              position: 'absolute',
              bottom: 60,
              alignItems: 'center',
            }}>
            {nextCardTime != null && (
              <Text
                style={{
                  width: '90%',
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.30)',
                  fontSize: 14,
                  lineHeight: 16,
                  fontFamily: 'Inter-Regular',
                  marginBottom: 40,
                }}>
                Для более эффективного запоминания слов, вам показываются
                повторы карточек с интервалом от 5 минут до 7 дней.
              </Text>
            )}
            <TouchableOpacity
              onPress={() =>
                nextCardTime === 0
                  ? navigation.push('LearnScreen', {
                      filter: filter,
                      progress: progress,
                      translateMode: translateMode,
                      level: level,
                      screensCount: route.params.screensCount + 1,
                    })
                  : navigation.dispatch(
                      StackActions.pop(route.params.screensCount),
                    )
              }
              style={{
                width: '90%',
                padding: 14,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: '#F1CC06',
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 16,
                  lineHeight: 20,
                  color: '#000000',
                }}>
                {nextCardTime == 0 ? 'Обновить' : 'Закрыть'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {words.length > 0 && (
        <View
          style={{height: '100%', width: '100%', opacity: finished ? 0 : 1}}>
          <Swiper
            onSwipedAll={() => processEnd()}
            overlayLabels={{
              left: {
                title:
                  progress?.data?.[level.id]?.[words[CardIndex]?.id]?.status > 0
                    ? 'Вспомнил'
                    : 'Пропуск',
                style: {
                  label: {
                    color: '#FFF',
                    textAlign: 'center',
                    fontSize: 20,
                    fontFamily: 'Inter-Bold',
                    lineHeight: 60,
                    width: '48%',
                    height: 80,
                    borderRadius: 16,
                    backgroundColor: '#108C15',
                    borderWidth: 1,
                    borderColor: '#313843',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  wrapper: {
                    height: '90%',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    paddingVertical: 20,
                    paddingHorizontal: 12,
                  },
                },
              },
              right: {
                title:
                  progress?.data?.[level.id]?.[words[CardIndex]?.id]?.status > 0
                    ? 'Забыл'
                    : 'Учить',
                style: {
                  label: {
                    color: '#FFF',
                    textAlign: 'center',
                    fontSize: 20,
                    fontFamily: 'Inter-Bold',
                    lineHeight: 60,
                    width: '48%',
                    height: 80,
                    borderRadius: 16,
                    backgroundColor: '#FF5858',
                    borderWidth: 1,
                    borderColor: '#313843',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  wrapper: {
                    height: '90%',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    paddingVertical: 20,
                    paddingHorizontal: 12,
                  },
                },
              },
            }}
            stackScale={10}
            ref={cardRef}
            overlayOpacityHorizontalThreshold={0.1}
            useViewOverflow={false}
            cards={words}
            renderCard={(card, cardIndex) => (
              <Card cardIndex={cardIndex} card={card} />
            )}
            stackSeparation={0}
            swipeBackCard={true}
            stackAnimationFriction={1000}
            stackAnimationTension={300}
            disableRightSwipe={!progress?.user?.pro && recentItemsCount > 9}
            onSwipedRight={cardIndex => Right(cardIndex)}
            onSwipedLeft={cardIndex => Left(cardIndex)}
            onSwipedBottom={cardIndex => Bottom(cardIndex)}
            onSwipedTop={cardIndex => Top(cardIndex)}
            cardIndex={CardIndex}
            onSwiped={() => setCanCancel(true)}
            backgroundColor={'#000000'}
            cardVerticalMargin={0}
            marginBottom={48}
            marginTop={12}
            verticalSwipe={false}
            stackSize={2}></Swiper>
        </View>
      )}
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
          setIsSwipeRight={setIsSwipeRight}
          isSwipeRight={isSwipeRight}
          progress={progress}
          navigation={navigation}
          learn={true}
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
            style={{width: 64, height: 64}}
            source={require('../src/lightning.png')}
          />

          <Text
            style={{
              width: '100%',
              color: 'white',
              fontFamily: 'Inter-Bold',
              textAlign: 'center',
              fontSize: 24,
              lineHeight: 32,
            }}>
            {`Учу новые слова: ${recentItemsCount} / 10`}
          </Text>
          <Text style={styles.headerDescription}>
            {
              'Подключите MiroLang Pro и учите\nнеограниченное количество слов в день'
            }
          </Text>
        </View>
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
            Возможности MiroLang Pro
          </Text>
        </TouchableOpacity>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    width: '75%',
    fontWeight: '700',
  },
  headerView: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    height: '5%',
    alignItems: 'flex-end',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backbutton: {
    backgroundColor: '#22252E',
    height: 32,
    width: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelbutton: {
    backgroundColor: '#22252E',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  canceltext: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  card: {
    height: '90%',
    justifyContent: 'space-between',
    backgroundColor: '#1B1D25',
    borderRadius: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  RepeatView: {
    position: 'absolute',
    left: -6,
    top: 20,
  },
  Repeat: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    paddingVertical: 3,
    paddingHorizontal: 6,
    backgroundColor: '#CD4A00',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 6,
  },
  RepeatText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  level: {
    color: 'rgba(255, 255, 255, 0.50)',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginTop: 32,
  },
  word: {
    fontFamily: 'Inter-SemiBold',
    color: '#FFF',
    width: '100%',
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 36,
    marginTop: 8,
  },
  showTranslateButton: {
    borderRadius: 20,
    backgroundColor: '#22252E',
    borderWidth: 1,
    borderColor: '#313843',
    width: '90%',
    height: 160,
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeButton: {
    width: '48%',
    height: 80,
    borderRadius: 16,
    backgroundColor: '#22252E',
    borderWidth: 1,
    borderColor: '#313843',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    lineHeight: 28,
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
  containerModal: {
    position: 'absolute',
    flex: 1,
    backgroundColor: '#000000',
    top: 0,
    left: 0,
    width: '100%',
  },
});

export default LearnScreen;
