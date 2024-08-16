import React, {useMemo, useState, useRef, useCallback, useEffect} from 'react';
import {
  ActionSheetIOS,
  Text,
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Platform,
  Pressable,
  AppState,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BottomSheetModal, BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import data from '../src/data';

function HistoryScreen({route, navigation}) {
  const [dayFilter, setDayFilter] = useState(7);
  const [sort, setSort] = useState('new');
  const [androidSortModal, setAndroidSortModal] = useState(false);
  const mode = route.params.mode;

  const OptionsBottomSheetModalRef = useRef(null);
  const OptionsSnapPoints = useMemo(
    () => [mode == 'learning' ? '35%' : '26%'],
    [],
  );
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
  const [choosenWord, setChoosenWord] = useState();
  const [progress, setProgress] = useState({
    user: null,
    data: {},
  });
  const [words, setWords] = useState([]);

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      getProgress();
    });
    return focusHandler;
  }, [navigation]);

  useEffect(() => {
    const blurHandler = navigation.addListener('blur', async () => {
      now = new Date();
      let updatedProgress = progress;
      await AsyncStorage.setItem('progress', JSON.stringify(updatedProgress));
      if (progress?.user?.id) {
        await firestore().collection('users').doc(progress?.user?.id).set({
          data: progress,
        });
      }
    });
    const handleAppStateChange = async newState => {
      if (newState === 'background') {
        try {
          now = new Date();
          let updatedProgress = progress;
          await AsyncStorage.setItem(
            'progress',
            JSON.stringify(updatedProgress),
          );
          if (progress?.user?.id) {
            await firestore().collection('users').doc(progress?.user?.id).set({
              data: progress,
            });
          }
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

  const learnWord = () => {
    updatedProgress = {...progress};
    updatedProgress.data[choosenWord.level][choosenWord.id] = {
      status: 1,
      date: new Date(),
    };
    setProgress(updatedProgress);
    OptionsBottomSheetModalRef.current?.close();
    normalizeData(updatedProgress, dayFilter);
  };

  const resetWord = () => {
    updatedProgress = {...progress};
    updatedProgress.data[choosenWord.level][choosenWord.id] = {
      status: 0,
      date: new Date(),
    };
    setProgress(updatedProgress);
    OptionsBottomSheetModalRef.current?.close();
    normalizeData(updatedProgress, dayFilter);
  };

  const markAsLearnedWord = () => {
    updatedProgress = {...progress};
    updatedProgress.data[choosenWord.level][choosenWord.id] = {
      status: 6,
      date: new Date(),
    };
    setProgress(updatedProgress);
    OptionsBottomSheetModalRef.current?.close();
    normalizeData(updatedProgress, dayFilter);
  };

  const normalizeData = (progress, dayFilter) => {
    var words = [];
    now = new Date();
    data.forEach(category => {
      category.data.forEach(level => {
        if (progress.data[level.id]) {
          level.words.map(word => {
            if (progress.data[level.id]?.[word.id]) {
              var newWord = {...word};
              newWord.level = level.id;
              newWord.date = new Date(progress.data[level.id]?.[word.id].date);
              newWord.status = progress.data[level.id]?.[word.id].status;
              if (
                dayFilter == 'all' ||
                (dayFilter != 'all' &&
                  newWord.date != undefined &&
                  now - newWord.date <= dayFilter * 24 * 60 * 60 * 1000)
              ) {
                if (mode == 'learned' && newWord?.status === 6) {
                  words.push(newWord);
                } else if (
                  mode == 'learning' &&
                  newWord?.status > 0 &&
                  newWord?.status < 6
                ) {
                  words.push(newWord);
                } else if (mode == 'skipped' && newWord?.status === 7) {
                  words.push(newWord);
                }
              }
            }
          });
        }
      });
    });

    setWords(words);
  };

  const getProgress = async () => {
    try {
      var progress = await AsyncStorage.getItem('progress');
      if (progress !== null) {
        progress = JSON.parse(progress);
        normalizeData(progress, dayFilter);
        setProgress(progress);
      } else {
        normalizeData({user: null, data: {}}, dayFilter);
        setProgress({user: null, data: {}});
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const Word = React.memo(({item}) => {
    const [show, setShow] = useState(false);
    const status = item.status;

    return (
      <View
        style={{
          width: '90%',
          paddingVertical: 14,
          paddingHorizontal: 12,
          borderRadius: 12,
          backgroundColor: '#14161B',
          alignSelf: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <TouchableOpacity
            onPress={() => setShow(!show)}
            style={[
              styles.checkbox,
              {backgroundColor: !show ? '#22252E' : 'white'},
            ]}>
            {!show ? (
              <Svg
                opacity={0.3}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none">
                <Path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M2.27002 10.7399C3.13935 8.78756 5.89147 4 12.0002 4C18.1091 4 20.861 8.78782 21.7302 10.7401C22.0885 11.5448 22.0885 12.4552 21.7302 13.2599C20.861 15.2122 18.1091 20 12.0002 20C5.89147 20 3.13935 15.2124 2.27002 13.2601C1.91162 12.4552 1.91162 11.5448 2.27002 10.7399ZM11.9999 16C14.2091 16 15.9999 14.2091 15.9999 12C15.9999 9.79086 14.2091 8 11.9999 8C9.7908 8 7.99994 9.79086 7.99994 12C7.99994 14.2091 9.7908 16 11.9999 16Z"
                  fill="white"
                  fill-opacity="0.3"
                />
                <Path
                  d="M10.5 12C11.3284 12 12 11.3284 12 10.5C12 10.3253 11.9701 10.1577 11.9153 10.0018C11.9434 10.0006 11.9716 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 11.9716 10.0006 11.9434 10.0018 11.9153C10.1577 11.9701 10.3253 12 10.5 12Z"
                  fill="white"
                  fill-opacity="0.3"
                />
              </Svg>
            ) : (
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18.0309 18.03L14.8285 14.8276C14.1047 15.5515 13.1046 15.9993 12 15.9993C9.79086 15.9993 8 14.2084 8 11.9993C8 10.8946 8.44775 9.8946 9.17167 9.17074L5.96968 5.96875C3.91173 7.52127 2.7744 9.60695 2.27027 10.7391C1.91186 11.544 1.91186 12.4545 2.27027 13.2594C3.1396 15.2117 5.89172 19.9993 12.0005 19.9993C14.5665 19.9993 16.5402 19.1545 18.0309 18.03Z"
                  fill="#14161B"
                />
                <Path
                  d="M10.5859 10.5849C10.2239 10.9469 10 11.4469 10 11.9993C10 13.1038 10.8954 13.9993 12 13.9993C12.5523 13.9993 13.0524 13.7754 13.4143 13.4134L10.5859 10.5849Z"
                  fill="#14161B"
                />
                <Path
                  d="M12.0003 4C18.1092 4 20.8611 8.78782 21.7302 10.7401C22.0885 11.5448 22.0885 12.4552 21.7302 13.2599C21.5746 13.6096 21.3658 14.0352 21.0963 14.5009C20.8197 14.9789 20.208 15.1421 19.7299 14.8655C19.2519 14.5889 19.0887 13.9772 19.3653 13.4991C19.5948 13.1025 19.7722 12.7407 19.9031 12.4465C20.0309 12.1595 20.0309 11.8405 19.9031 11.5535C19.1103 9.77274 16.8556 6 12.0003 6L11 6.00001C10.4477 6.00001 10 5.5523 10 5.00002C9.99999 4.44773 10.4477 4.00001 11 4.00001L12.0003 4Z"
                  fill="#14161B"
                />
                <Path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M2.29289 2.29289C2.68342 1.90237 3.31658 1.90237 3.70711 2.29289L21.7071 20.2929C22.0976 20.6834 22.0976 21.3166 21.7071 21.7071C21.3166 22.0976 20.6834 22.0976 20.2929 21.7071L2.29289 3.70711C1.90237 3.31658 1.90237 2.68342 2.29289 2.29289Z"
                  fill="#14161B"
                />
              </Svg>
            )}
          </TouchableOpacity>
          <View>
            <Text style={styles.wordText}>{show ? item.ru : item.word}</Text>
            <Text
              style={{
                fontSize: 12,
                lineHeight: 16,
                fontFamily: 'Inter-Regular',
                color:
                  status == 6
                    ? '#108C15'
                    : status > 6
                    ? 'rgba(255, 255, 255, 0.50)'
                    : status > 0 && status < 6
                    ? '#DF7D23'
                    : 'rgba(255, 255, 255, 0.30)',
              }}>
              {status == 6
                ? 'Слово выучено'
                : status > 6
                ? 'Пропущено'
                : status > 0 && status < 6
                ? 'Осталось повторов: ' + (6 - status).toString()
                : 'Ещё не появлялось'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            setChoosenWord(item), OptionsBottomSheetModalRef.current?.present();
          }}
          style={styles.checkbox}>
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
      </View>
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={
          sort == 'new'
            ? words.sort((a, b) => b.date - a.date)
            : sort == 'old'
            ? words
                .sort((a, b) => a.date - b.date)
                .filter(word =>
                  dayFilter != 'all'
                    ? new Date() - word.date <= dayFilter * 24 * 60 * 60 * 1000
                    : true,
                )
            : sort == 'levelup'
            ? words
                .sort((a, b) => a.level - b.level)
                .filter(word =>
                  dayFilter != 'all'
                    ? new Date() - word.date <= dayFilter * 24 * 60 * 60 * 1000
                    : true,
                )
            : sort == 'leveldown'
            ? words
                .sort((a, b) => b.level - a.level)
                .filter(word =>
                  dayFilter != 'all'
                    ? new Date() - word.date <= dayFilter * 24 * 60 * 60 * 1000
                    : true,
                )
            : sort == 'repeatup'
            ? words
                .sort((a, b) => b.status - a.status)
                .filter(word =>
                  dayFilter != 'all'
                    ? new Date() - word.date <= dayFilter * 24 * 60 * 60 * 1000
                    : true,
                )
            : words
                .sort((a, b) => a.status - b.status)
                .filter(word =>
                  dayFilter != 'all'
                    ? new Date() - word.date <= dayFilter * 24 * 60 * 60 * 1000
                    : true,
                ) //repeat down
        }
        style={{width: '100%'}}
        horizontal={false}
        windowSize={3}
        keyExtractor={item => item.word}
        ListHeaderComponent={
          <View style={{width: '100%', alignItems: 'center'}}>
            <Modal
              animationType="fade"
              transparent={true}
              visible={androidSortModal}>
              <Pressable
                onPress={() => setAndroidSortModal(false)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                <View style={{width: '90%', backgroundColor: 'white'}}>
                  <TouchableOpacity
                    onPress={() => {
                      setSort('new'), setAndroidSortModal(false);
                    }}
                    style={{padding: 12}}>
                    <Text style={{fontSize: 20}}>Новые вверху</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setSort('old'), setAndroidSortModal(false);
                    }}
                    style={{
                      padding: 12,
                      borderTopWidth: 1,
                      borderColor: 'lightgray',
                    }}>
                    <Text style={{fontSize: 20}}>Старые вверху</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setSort('levelup'), setAndroidSortModal(false);
                    }}
                    style={{
                      padding: 12,
                      borderTopWidth: 1,
                      borderColor: 'lightgray',
                    }}>
                    <Text style={{fontSize: 20}}>По уровню (1-25)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setSort('leveldown'), setAndroidSortModal(false);
                    }}
                    style={{
                      padding: 12,
                      borderTopWidth: 1,
                      borderColor: 'lightgray',
                    }}>
                    <Text style={{fontSize: 20}}>По уровню (25-1)</Text>
                  </TouchableOpacity>
                  {route.params.mode == 'learning' && (
                    <TouchableOpacity
                      onPress={() => {
                        setSort('repeatup'), setAndroidSortModal(false);
                      }}
                      style={{
                        padding: 12,
                        borderTopWidth: 1,
                        borderColor: 'lightgray',
                      }}>
                      <Text style={{fontSize: 20}}>
                        Осталось повторов (1-5)
                      </Text>
                    </TouchableOpacity>
                  )}
                  {route.params.mode == 'learning' && (
                    <TouchableOpacity
                      onPress={() => {
                        setSort('repeatdown'), setAndroidSortModal(false);
                      }}
                      style={{
                        padding: 12,
                        borderTopWidth: 1,
                        borderColor: 'lightgray',
                      }}>
                      <Text style={{fontSize: 20}}>
                        Осталось повторов (5-1)
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Pressable>
            </Modal>
            <View style={styles.daysFilter}>
              <TouchableOpacity
                onPress={() => {
                  setDayFilter(7);
                }}
                style={[
                  styles.inactiveDayPicker,
                  {backgroundColor: dayFilter == 7 ? '#424757' : 'transparent'},
                ]}>
                <Text
                  style={[
                    styles.inactiveDayPickerText,
                    {
                      color:
                        dayFilter == 7 ? 'white' : 'rgba(255, 255, 255, 0.50)',
                    },
                  ]}>
                  7 дней
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setDayFilter(30);
                }}
                style={[
                  styles.inactiveDayPicker,
                  {
                    backgroundColor:
                      dayFilter == 30 ? '#424757' : 'transparent',
                  },
                ]}>
                <Text
                  style={[
                    styles.inactiveDayPickerText,
                    {
                      color:
                        dayFilter == 30 ? 'white' : 'rgba(255, 255, 255, 0.50)',
                    },
                  ]}>
                  30 дней
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setDayFilter(90);
                }}
                style={[
                  styles.inactiveDayPicker,
                  {
                    backgroundColor:
                      dayFilter == 90 ? '#424757' : 'transparent',
                  },
                ]}>
                <Text
                  style={[
                    styles.inactiveDayPickerText,
                    {
                      color:
                        dayFilter == 90 ? 'white' : 'rgba(255, 255, 255, 0.50)',
                    },
                  ]}>
                  90 дней
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setDayFilter('all');
                }}
                style={[
                  styles.inactiveDayPicker,
                  {
                    backgroundColor:
                      dayFilter == 'all' ? '#424757' : 'transparent',
                  },
                ]}>
                <Text
                  style={[
                    styles.inactiveDayPickerText,
                    {
                      color:
                        dayFilter == 'all'
                          ? 'white'
                          : 'rgba(255, 255, 255, 0.50)',
                    },
                  ]}>
                  Всё
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.contolPanel}>
              <TouchableOpacity
                onPress={() => {
                  Platform.OS == 'ios'
                    ? ActionSheetIOS.showActionSheetWithOptions(
                        {
                          options:
                            route.params.mode == 'learning'
                              ? [
                                  'Отменить',
                                  'Новые вверху',
                                  ' Старые вверху',
                                  'По уровню (1-25)',
                                  'По уровню (25-1)',
                                  'Осталось повторов (1-5)',
                                  'Осталось повторов (5-1)',
                                ]
                              : [
                                  'Отменить',
                                  'Новые вверху',
                                  ' Старые вверху',
                                  'По уровню (1-25)',
                                  'По уровню (25-1)',
                                ],
                          cancelButtonIndex: 0,
                          title: 'Сортировать',
                          userInterfaceStyle: 'dark',
                        },
                        buttonIndex => {
                          if (buttonIndex === 0) {
                            // cancel action
                          } else if (buttonIndex === 1) {
                            setSort('new');
                          } else if (buttonIndex === 2) {
                            setSort('old');
                          } else if (buttonIndex === 3) {
                            setSort('levelup');
                          } else if (buttonIndex === 4) {
                            setSort('leveldown');
                          } else if (buttonIndex === 5) {
                            setSort('repeatup');
                          } else if (buttonIndex === 6) {
                            setSort('repeatdown');
                          }
                        },
                      )
                    : setAndroidSortModal(true);
                }}
                style={styles.orderButton}>
                <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <Path
                    d="M10.2498 6.66667C9.99984 6.66667 9.83317 6.58333 9.6665 6.41667L6.49984 3.25L3.33317 6.41667C2.99984 6.75 2.49984 6.75 2.1665 6.41667C1.83317 6.08333 1.83317 5.58333 2.1665 5.25L5.83317 1.5C6.1665 1.16667 6.6665 1.16667 6.99984 1.5L10.8332 5.25C11.1665 5.58333 11.1665 6.08333 10.8332 6.41667C10.6665 6.58333 10.4165 6.66667 10.2498 6.66667Z"
                    fill="white"
                  />
                  <Path
                    d="M6.41683 13.75C5.91683 13.75 5.5835 13.4167 5.5835 12.9167V2.08333C5.5835 1.58333 5.91683 1.25 6.41683 1.25C6.91683 1.25 7.25016 1.58333 7.25016 2.08333V12.9167C7.25016 13.4167 6.91683 13.75 6.41683 13.75Z"
                    fill="white"
                  />
                  <Path
                    d="M13.5837 18.7487C13.3337 18.7487 13.167 18.6654 13.0003 18.4987L9.16699 14.7487C8.83366 14.4154 8.83366 13.9154 9.16699 13.582C9.50033 13.2487 10.0003 13.2487 10.3337 13.582L13.5003 16.7487L16.667 13.582C17.0003 13.2487 17.5003 13.2487 17.8337 13.582C18.167 13.9154 18.167 14.4154 17.8337 14.7487L14.167 18.4987C14.0003 18.6654 13.7503 18.7487 13.5837 18.7487Z"
                    fill="white"
                  />
                  <Path
                    d="M13.5003 18.75C13.0003 18.75 12.667 18.4167 12.667 17.9167V7.08333C12.667 6.58333 13.0003 6.25 13.5003 6.25C14.0003 6.25 14.3337 6.58333 14.3337 7.08333V17.9167C14.3337 18.4167 14.0003 18.75 13.5003 18.75Z"
                    fill="white"
                  />
                </Svg>
                <Text style={styles.orderButtonText}>
                  {sort == 'new'
                    ? 'Новые вверху'
                    : sort == 'old'
                    ? 'Старые вверху'
                    : sort == 'levelup'
                    ? 'По уровню (1-25)'
                    : sort == 'leveldown'
                    ? 'По уровню (25-1)'
                    : sort == 'repeatup'
                    ? 'Осталось повт. (1-5)'
                    : 'Осталось повт. (5-1)'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation.push('Overview', {
                    mode: mode,
                    progress: progress,
                    words: words,
                  })
                }
                style={styles.overviewButton}>
                <Text style={styles.overviewButtonText}>Пролистать</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.info}>
              {dayFilter != 'all'
                ? 'За ' +
                  dayFilter.toString() +
                  ' дней я ' +
                  (mode == 'learning'
                    ? 'повторил'
                    : mode == 'learned'
                    ? 'выучил'
                    : 'пропустил') +
                  '  ·  ' +
                  words.length +
                  ' слова'
                : 'За все время я ' +
                  (mode == 'learning'
                    ? 'повторил'
                    : mode == 'learned'
                    ? 'выучил'
                    : 'пропустил') +
                  '  ·  ' +
                  words.length +
                  ' слова'}
            </Text>
          </View>
        }
        renderItem={({item}) => <Word item={item} />}
      />

      <BottomSheetModal
        ref={OptionsBottomSheetModalRef}
        index={0}
        backdropComponent={renderBackdrop}
        snapPoints={OptionsSnapPoints}
        backgroundStyle={{backgroundColor: '#14161B', borderRadius: 0}}
        handleIndicatorStyle={{backgroundColor: 'white'}}>
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
                onPress={() => OptionsBottomSheetModalRef.current?.close()}
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
            <Text
              style={{
                width: '85%',
                fontFamily: 'Inter-Regular',
                fontSize: 16,
                lineHeight: 20,
                color: 'rgba(255, 255, 255, 0.5)',
              }}>
              Действия
            </Text>

            {mode == 'learned' ? (
              <TouchableOpacity
                onPress={() => resetWord()}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#1C1F26',
                  width: '90%',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 12,
                  marginTop: 8,
                  gap: 8,
                }}>
                <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <Path
                    d="M14.1667 2.7513C10.9167 0.917969 6.91675 1.5013 4.25008 3.91797V2.5013C4.25008 2.0013 3.91675 1.66797 3.41675 1.66797C2.91675 1.66797 2.58341 2.0013 2.58341 2.5013V6.2513C2.58341 6.7513 2.91675 7.08464 3.41675 7.08464H7.16675C7.66675 7.08464 8.00008 6.7513 8.00008 6.2513C8.00008 5.7513 7.66675 5.41797 7.16675 5.41797H5.16675C6.41675 4.08464 8.16675 3.33464 10.0001 3.33464C13.6667 3.33464 16.6667 6.33464 16.6667 10.0013C16.6667 10.5013 17.0001 10.8346 17.5001 10.8346C18.0001 10.8346 18.3334 10.5013 18.3334 10.0013C18.3334 7.0013 16.7501 4.2513 14.1667 2.7513ZM16.5834 12.918H12.8334C12.3334 12.918 12.0001 13.2513 12.0001 13.7513C12.0001 14.2513 12.3334 14.5846 12.8334 14.5846H14.8334C13.5834 15.918 11.8334 16.668 10.0001 16.668C6.33341 16.668 3.33341 13.668 3.33341 10.0013C3.33341 9.5013 3.00008 9.16797 2.50008 9.16797C2.00008 9.16797 1.66675 9.5013 1.66675 10.0013C1.66675 14.5846 5.41675 18.3346 10.0001 18.3346C12.1667 18.3346 14.1667 17.5013 15.7501 16.0013V17.5013C15.7501 18.0013 16.0834 18.3346 16.5834 18.3346C17.0834 18.3346 17.4167 18.0013 17.4167 17.5013V13.7513C17.4167 13.2513 17.0001 12.918 16.5834 12.918Z"
                    fill="white"
                  />
                </Svg>
                <Text
                  style={{
                    fontFamily: 'Inter-Regular',
                    fontSize: 16,
                    lineHeight: 20,
                    color: 'white',
                  }}>
                  Сбросить прогресс по слову
                </Text>
              </TouchableOpacity>
            ) : mode == 'learning' ? (
              <View style={{width: '100%', alignItems: 'center'}}>
                <TouchableOpacity
                  onPress={() => resetWord()}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#1C1F26',
                    width: '90%',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    marginTop: 8,
                    gap: 8,
                  }}>
                  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <Path
                      d="M14.1667 2.7513C10.9167 0.917969 6.91675 1.5013 4.25008 3.91797V2.5013C4.25008 2.0013 3.91675 1.66797 3.41675 1.66797C2.91675 1.66797 2.58341 2.0013 2.58341 2.5013V6.2513C2.58341 6.7513 2.91675 7.08464 3.41675 7.08464H7.16675C7.66675 7.08464 8.00008 6.7513 8.00008 6.2513C8.00008 5.7513 7.66675 5.41797 7.16675 5.41797H5.16675C6.41675 4.08464 8.16675 3.33464 10.0001 3.33464C13.6667 3.33464 16.6667 6.33464 16.6667 10.0013C16.6667 10.5013 17.0001 10.8346 17.5001 10.8346C18.0001 10.8346 18.3334 10.5013 18.3334 10.0013C18.3334 7.0013 16.7501 4.2513 14.1667 2.7513ZM16.5834 12.918H12.8334C12.3334 12.918 12.0001 13.2513 12.0001 13.7513C12.0001 14.2513 12.3334 14.5846 12.8334 14.5846H14.8334C13.5834 15.918 11.8334 16.668 10.0001 16.668C6.33341 16.668 3.33341 13.668 3.33341 10.0013C3.33341 9.5013 3.00008 9.16797 2.50008 9.16797C2.00008 9.16797 1.66675 9.5013 1.66675 10.0013C1.66675 14.5846 5.41675 18.3346 10.0001 18.3346C12.1667 18.3346 14.1667 17.5013 15.7501 16.0013V17.5013C15.7501 18.0013 16.0834 18.3346 16.5834 18.3346C17.0834 18.3346 17.4167 18.0013 17.4167 17.5013V13.7513C17.4167 13.2513 17.0001 12.918 16.5834 12.918Z"
                      fill="white"
                    />
                  </Svg>
                  <Text
                    style={{
                      fontFamily: 'Inter-Regular',
                      fontSize: 16,
                      lineHeight: 20,
                      color: 'white',
                    }}>
                    Сбросить прогресс по слову
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => markAsLearnedWord()}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#1C1F26',
                    width: '90%',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                    marginTop: 1,
                    gap: 8,
                  }}>
                  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <Path
                      d="M18.5818 3.94156C18.0249 3.38389 17.1205 3.38424 16.5628 3.94156L7.47618 13.0286L3.43755 8.98997C2.87988 8.43231 1.97592 8.43231 1.41825 8.98997C0.860584 9.54764 0.860584 10.4516 1.41825 11.0093L6.46632 16.0573C6.74497 16.336 7.11036 16.4757 7.47579 16.4757C7.84122 16.4757 8.20696 16.3363 8.48562 16.0573L18.5818 5.96082C19.1395 5.40354 19.1395 4.49919 18.5818 3.94156Z"
                      fill="white"
                    />
                  </Svg>
                  <Text
                    style={{
                      fontFamily: 'Inter-Regular',
                      fontSize: 16,
                      lineHeight: 20,
                      color: 'white',
                    }}>
                    Отметить как выученное
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => learnWord()}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#1C1F26',
                  width: '90%',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 12,
                  marginTop: 8,
                  gap: 10,
                }}>
                <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <Path
                    d="M8 0C7.73478 0 7.48043 0.105357 7.29289 0.292893C7.10536 0.48043 7 0.734784 7 1V7H1C0.734784 7 0.48043 7.10536 0.292893 7.29289C0.105357 7.48043 0 7.73478 0 8C0 8.26522 0.105357 8.51957 0.292893 8.70711C0.48043 8.89464 0.734784 9 1 9H7V15C7 15.2652 7.10536 15.5196 7.29289 15.7071C7.48043 15.8946 7.73478 16 8 16C8.26522 16 8.51957 15.8946 8.70711 15.7071C8.89464 15.5196 9 15.2652 9 15V9H15C15.2652 9 15.5196 8.89464 15.7071 8.70711C15.8946 8.51957 16 8.26522 16 8C16 7.73478 15.8946 7.48043 15.7071 7.29289C15.5196 7.10536 15.2652 7 15 7H9V1C9 0.734784 8.89464 0.48043 8.70711 0.292893C8.51957 0.105357 8.26522 0 8 0Z"
                    fill="white"
                  />
                </Svg>
                <Text
                  style={{
                    fontFamily: 'Inter-Regular',
                    fontSize: 16,
                    lineHeight: 20,
                    color: 'white',
                  }}>
                  Учить слово
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wordText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Inter-SemiBold',
    lineHeight: 20,
  },
  checkbox: {
    width: 40,
    height: 36,
    backgroundColor: '#22252E',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  daysFilter: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#14161B',
    borderRadius: 10,
    padding: 4,
    marginTop: 10,
  },
  inactiveDayPicker: {
    paddingVertical: 6,
    alignItems: 'center',
    width: '25%',
    borderRadius: 6,
  },
  inactiveDayPickerText: {
    color: 'rgba(255, 255, 255, 0.50)',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 16,
  },
  contolPanel: {
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  orderButton: {
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#22252E',
  },
  orderButtonText: {
    color: 'white',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 20,
  },
  overviewButton: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    backgroundColor: '#F1CC06',
  },
  overviewButtonText: {
    color: '#14161B',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 20,
  },
  info: {
    marginTop: 20,
    width: '90%',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 16,
    color: 'rgba(255, 255, 255, 0.50)',
    marginBottom: 10,
  },
});

export default HistoryScreen;
