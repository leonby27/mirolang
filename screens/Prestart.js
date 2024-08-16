import React, {useState, useMemo, useRef, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  AppState,
  Alert,
} from 'react-native';
import Svg, {Path, G} from 'react-native-svg';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

function Prestart({navigation, route}) {
  const {level, description} = route.params;
  const [progress, setProgress] = useState({
    user: null,
    data: {},
  });
  useEffect(() => {
    const blurHandler = navigation.addListener('blur', async () => {
      now = new Date();
      let updatedProgress = progress;
      if (
        getWordsCount('passed', false) / level.words.length >= 0.9 &&
        !updatedProgress.data?.[level.id + 1]
      ) {
        updatedProgress.data[level.id + 1] = {};
      }
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
          if (
            getWordsCount('passed', false) / level.words.length >= 0.9 &&
            !updatedProgress.data?.[level.id + 1]
          ) {
            updatedProgress.data[level.id + 1] = {};
          }
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
        progress = JSON.parse(progress);
        setProgress(progress);
      } else {
        setProgress({
          user: null,
          data: {},
        });
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const AskForDeleteProgress = () =>
    Alert.alert(
      'Сбросить весь прогресс?',
      'Это действие сбросить весь ваш текущий прогресс к 0%',
      [
        {
          text: 'Нет',
          style: 'cancel',
        },
        {
          text: 'Сбросить',
          onPress: async () => {
            var updatedProgress = {...progress};
            if (updatedProgress.data[level.id]) {
              updatedProgress.data[level.id] = {};
            }
            setProgress(updatedProgress);
            await AsyncStorage.setItem('en', JSON.stringify(updatedProgress));
          },
        },
      ],
    );

  const updateWordStatus = (id, newStatus) => {
    const updatedProgress = {...progress};

    if (!updatedProgress.data[level.id]) {
      updatedProgress.data[level.id] = {};
    }

    updatedProgress.data[level.id][id] = {
      status: newStatus,
      date: new Date(),
    };

    setProgress(updatedProgress);
  };

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        color="black"
        opacity={1}
      />
    ),
    [],
  );
  // Progress
  const progressBottomSheetRef = useRef(null);
  const progressSnapPoints = useMemo(() => ['65%', '100%'], []);
  const handleOpenPress = () => progressBottomSheetRef.current?.present();
  const handleOpenClose = () => progressBottomSheetRef.current?.close();
  // Progress Filter
  const [progressFilter, setProgressFilter] = useState('all');
  const progressFilterBottomSheetRef = useRef(null);
  const progressFilterSnapPoints = useMemo(() => ['55%'], []);
  // Translate Mode
  const [translateMode, setTranslateMode] = useState('english');
  const translateModeBottomSheetRef = useRef(null);
  const translateModeSnapPoints = useMemo(() => ['45%'], []);
  // Filter
  const [filter, setFilter] = useState('all');
  const filterBottomSheetRef = useRef(null);
  const filterSnapPoints = useMemo(() => ['55%'], []);

  const getWordsCount = (filter, available) => {
    now = new Date();
    if (filter == 'passed') {
      if (!progress.data?.[level.id]) {
        return 0;
      }
      return Object.values(progress.data?.[level.id]).reduce(
        (count, value) => count + (value.status >= 6 ? 1 : 0),
        0,
      );
    } else if (filter == 'all') {
      if (available) {
        if (!progress.data?.[level.id]) {
          return level.words.length;
        }
        var count = 0;
        level.words.map(word => {
          if (
            progress.data?.[level.id]?.[word.id]?.status == undefined ||
            progress.data?.[level.id]?.[word.id]?.status == 0 ||
            progress.data?.[level.id]?.[word.id]?.status == 1 ||
            (progress.data?.[level.id]?.[word.id]?.status == 2 &&
              now - new Date(progress.data?.[level.id]?.[word.id]?.date) >=
                5 * 60 * 1000) ||
            (progress.data?.[level.id]?.[word.id]?.status == 3 &&
              now - new Date(progress.data?.[level.id]?.[word.id]?.date) >=
                30 * 60 * 1000) ||
            (progress.data?.[level.id]?.[word.id]?.status == 4 &&
              now - new Date(progress.data?.[level.id]?.[word.id]?.date) >=
                24 * 60 * 60 * 1000) ||
            (progress.data?.[level.id]?.[word.id]?.status == 5 &&
              now - new Date(progress.data?.[level.id]?.[word.id]?.date) >=
                7 * 24 * 60 * 60 * 1000)
          ) {
            count++;
          }
        });
        return count;
      } else {
        return level.words.length;
      }
    } else if (filter == 'new') {
      var count = 0;
      level.words.map(word => {
        if (
          progress.data?.[level.id]?.[word.id]?.status == 0 ||
          progress.data?.[level.id]?.[word.id]?.status == undefined
        ) {
          count++;
        }
      });
      return count;
    } else if (filter == 'repeat') {
      if (!available) {
        var count = 0;
        level.words.map(word => {
          if (
            progress.data?.[level.id]?.[word.id]?.status > 0 &&
            progress.data?.[level.id]?.[word.id]?.status < 6
          ) {
            count++;
          }
        });
        return count;
      } else {
        var count = 0;
        level.words.map(word => {
          if (
            progress.data?.[level.id]?.[word.id]?.status == 1 ||
            (progress.data?.[level.id]?.[word.id]?.status == 2 &&
              now - new Date(progress.data?.[level.id]?.[word.id]?.date) >=
                5 * 60 * 1000) ||
            (progress.data?.[level.id]?.[word.id]?.status == 3 &&
              now - new Date(progress.data?.[level.id]?.[word.id]?.date) >=
                30 * 60 * 1000) ||
            (progress.data?.[level.id]?.[word.id]?.status == 4 &&
              now - new Date(progress.data?.[level.id]?.[word.id]?.date) >=
                24 * 60 * 60 * 1000) ||
            (progress.data?.[level.id]?.[word.id]?.status == 5 &&
              now - new Date(progress.data?.[level.id]?.[word.id]?.date) >=
                7 * 24 * 60 * 60 * 1000)
          ) {
            count++;
          }
        });
        return count;
      }
    } else if (filter == 'learned') {
      if (!progress.data?.[level.id]) {
        return 0;
      }
      return Object.values(progress.data?.[level.id]).reduce(
        (count, value) => count + (value.status == 6 ? 1 : 0),
        0,
      );
    } else if (filter == 'skipped') {
      if (!progress.data[level.id]) {
        return 0;
      }
      return Object.values(progress.data?.[level.id]).reduce(
        (count, value) => count + (value.status > 6 ? 1 : 0),
        0,
      );
    }
  };

  const startLearning = () => {
    if (filter == 'skipped' || filter == 'learned') {
      var words = [];
      level.words.forEach(word => {
        var newWord = {...word};
        newWord.level = level.id;
        if (
          filter == 'learned' &&
          progress?.data?.[level.id]?.[word.id]?.status === 6
        ) {
          newWord.status = progress?.data?.[level.id]?.[word.id].status;
          words.push(newWord);
        } else if (
          filter == 'skipped' &&
          progress?.data?.[level.id]?.[word.id]?.status === 7
        ) {
          newWord.status = progress?.data?.[level.id]?.[word.id].status;
          words.push(newWord);
        }
      });
      navigation.push('Overview', {
        mode: filter,
        progress: progress,
        words: words,
      });
    } else {
      navigation.push('LearnScreen', {
        filter: filter,
        progress: progress,
        translateMode: translateMode,
        level: level,
        screensCount: 1,
      });
    }
  };

  const Word = React.memo(({item}) => {
    const [show, setShow] = useState(false);
    const status = progress.data?.[level.id]?.[item.id]?.status;

    return (
      <View
        style={{
          width: '90%',
          paddingVertical: 14,
          paddingHorizontal: 12,
          borderRadius: 12,
          backgroundColor: 'rgba(0, 0, 0, 0.30)',
          alignSelf: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
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
        <View style={{flexDirection: 'row', gap: 8}}>
          <TouchableOpacity
            onPress={() => updateWordStatus(item.id, 7)}
            style={[
              styles.checkbox,
              {
                backgroundColor:
                  status == 6 ? '#108C15' : status > 6 ? '#FFFFFF' : '#22252E',
              },
            ]}>
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <Path
                d="M4.5 10L8.5 14L16 5.5"
                stroke={
                  status == 6
                    ? '#FFFFFF'
                    : status > 6
                    ? '#14161B'
                    : 'rgba(255, 255, 255, 0.50)'
                }
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={
              status != 6
                ? () => updateWordStatus(item.id, 1)
                : () => updateWordStatus(item.id, 0)
            }
            style={[
              styles.learnButton,
              {
                backgroundColor:
                  status == 6
                    ? '#271F1F'
                    : status < 6 && status > 0
                    ? '#FFFFFF'
                    : '#22252E',
              },
            ]}>
            <Text
              style={[
                {
                  fontWeight: '500',
                  fontSize: 16,
                  lineHeight: 28,
                  color: '#898A8D',
                },
                {
                  color:
                    status == 6
                      ? '#FF5858'
                      : status < 6 && status > 0
                      ? '#14161B'
                      : 'rgba(255, 255, 255, 0.50)',
                },
              ]}>
              {status == 6 ? 'Сброс' : 'Учить'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleOpenPress} style={styles.progressButton}>
        <Image
          style={{width: 48, height: 48}}
          source={require('../src/settings.png')}
        />
        <View style={{gap: 2}}>
          <Text style={styles.title}>
            Прогресс:{' '}
            {Math.round(
              (100 * getWordsCount('passed', false)) / level.words.length,
            )}
            %
          </Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <View style={{position: 'absolute', right: 16, paddingHorizontal: 3}}>
          <Svg width="18" height="8" viewBox="0 0 18 8" fill="none">
            <Path
              d="M17.0011 2.66624H9.3809C8.9451 1.13248 7.53175 0.00585938 5.86021 0.00585938C4.18863 0.00585938 2.77527 1.13248 2.33951 2.66624H0.998896C0.447223 2.66621 0 3.11347 0 3.6651C0 4.21674 0.447223 4.66404 0.998896 4.66404H2.33944C2.77524 6.1978 4.18856 7.32442 5.86014 7.32442C7.53168 7.32442 8.94507 6.1978 9.38083 4.66404H17.0011C17.5527 4.66404 18 4.21678 18 3.66514C18 3.1135 17.5527 2.66624 17.0011 2.66624ZM5.86017 5.32656C4.944 5.32656 4.19868 4.58121 4.19868 3.66507C4.19868 2.74893 4.944 2.00358 5.86017 2.00358C6.77634 2.00358 7.52166 2.74893 7.52166 3.66507C7.52166 4.58121 6.77634 5.32656 5.86017 5.32656Z"
              fill="white"
            />
          </Svg>
          <Svg width="18" height="8" viewBox="0 0 18 8" fill="none">
            <Path
              d="M17.0011 3.33616H15.6581C15.2223 1.8024 13.809 0.675781 12.1374 0.675781C10.4659 0.675781 9.05251 1.8024 8.61674 3.33616H0.998897C0.447224 3.33616 0 3.78342 0 4.33506C0 4.88673 0.447224 5.33396 0.998897 5.33396H8.61674C9.05254 6.86772 10.4659 7.99434 12.1374 7.99434C13.809 7.99434 15.2224 6.86772 15.6581 5.33396H17.0011C17.5528 5.33396 18 4.8867 18 4.33506C18 3.78339 17.5528 3.33616 17.0011 3.33616ZM12.1374 5.99655C11.2213 5.99655 10.476 5.2512 10.476 4.33506C10.476 3.41889 11.2213 2.67357 12.1374 2.67357C13.0536 2.67357 13.7989 3.41892 13.7989 4.33506C13.799 5.25124 13.0536 5.99655 12.1374 5.99655Z"
              fill="white"
            />
          </Svg>
        </View>
      </TouchableOpacity>

      <Text style={styles.info}>
        Следующий уровень вам станет доступным после того, как вы пройдёте 90%
        всего материала.
      </Text>

      <TouchableOpacity
        onPress={() => translateModeBottomSheetRef.current?.present()}
        style={styles.filterButton}>
        <Text style={styles.title}>Режим показа</Text>
        <View style={{flexDirection: 'row', gap: 8}}>
          <Text style={styles.choosenFilter}>
            {translateMode == 'english'
              ? 'Вначале на англ.'
              : translateMode == 'russian'
              ? 'Вначале на рус.'
              : translateMode == 'swap'
              ? 'Чередовать'
              : 'В случайном пор.'}
          </Text>
          <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <Path
              d="M13.7491 10.0137C13.7497 10.3052 13.648 10.5877 13.4616 10.8121L8.46162 17.0494C8.24945 17.3041 7.94456 17.4643 7.61403 17.4947C7.2835 17.5251 6.95439 17.4233 6.69912 17.2115C6.44385 16.9998 6.28332 16.6955 6.25285 16.3657C6.22237 16.0358 6.32445 15.7074 6.53662 15.4526L10.8866 10.0137L6.73662 4.57483C6.63279 4.44723 6.55525 4.30041 6.50846 4.1428C6.46167 3.9852 6.44655 3.81993 6.46398 3.65647C6.4814 3.49302 6.53102 3.33462 6.60999 3.19037C6.68896 3.04611 6.79571 2.91886 6.92412 2.81592C7.05265 2.70168 7.20343 2.61515 7.36703 2.56177C7.53062 2.50839 7.70349 2.4893 7.87482 2.5057C8.04615 2.52209 8.21224 2.57362 8.36269 2.65705C8.51313 2.74049 8.64469 2.85403 8.74912 2.99056L13.5366 9.22782C13.6935 9.45871 13.7683 9.73541 13.7491 10.0137Z"
              fill="white"
              opacity={0.2}
            />
          </Svg>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => filterBottomSheetRef.current?.present()}
        style={styles.filterButton}>
        <Text style={styles.title}>Фильтр</Text>
        <View style={{flexDirection: 'row', gap: 8}}>
          <Text style={styles.choosenFilter}>
            {filter == 'all'
              ? 'Без фильтра · '
              : filter == 'new'
              ? 'Ещё не появлялись · '
              : filter == 'repeat'
              ? 'Повторы · '
              : filter == 'learned'
              ? 'Выученные · '
              : 'Пропущенные · '}
            {getWordsCount(filter, true)}
          </Text>
          <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <Path
              d="M13.7491 10.0137C13.7497 10.3052 13.648 10.5877 13.4616 10.8121L8.46162 17.0494C8.24945 17.3041 7.94456 17.4643 7.61403 17.4947C7.2835 17.5251 6.95439 17.4233 6.69912 17.2115C6.44385 16.9998 6.28332 16.6955 6.25285 16.3657C6.22237 16.0358 6.32445 15.7074 6.53662 15.4526L10.8866 10.0137L6.73662 4.57483C6.63279 4.44723 6.55525 4.30041 6.50846 4.1428C6.46167 3.9852 6.44655 3.81993 6.46398 3.65647C6.4814 3.49302 6.53102 3.33462 6.60999 3.19037C6.68896 3.04611 6.79571 2.91886 6.92412 2.81592C7.05265 2.70168 7.20343 2.61515 7.36703 2.56177C7.53062 2.50839 7.70349 2.4893 7.87482 2.5057C8.04615 2.52209 8.21224 2.57362 8.36269 2.65705C8.51313 2.74049 8.64469 2.85403 8.74912 2.99056L13.5366 9.22782C13.6935 9.45871 13.7683 9.73541 13.7491 10.0137Z"
              fill="white"
              opacity={0.2}
            />
          </Svg>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => startLearning()}
        style={styles.startLearningButton}>
        <Text style={styles.startLearningText}>
          {filter == 'learned' || filter == 'skipped'
            ? 'Пролистать слова'
            : 'Учить слова'}
        </Text>
      </TouchableOpacity>

      <BottomSheetModal
        ref={progressBottomSheetRef}
        index={0}
        backdropComponent={renderBackdrop}
        snapPoints={progressSnapPoints}
        backgroundStyle={{backgroundColor: '#14161B', borderRadius: 0}}
        handleIndicatorStyle={{backgroundColor: 'white'}}>
        <View style={{flex: 1}}>
          <View style={styles.progressSheetHeader}>
            <View style={styles.progressSheetHeaderContent}>
              <Text style={styles.progressSheetLevel}>Уровень {level.id}</Text>
              <TouchableOpacity
                onPress={handleOpenClose}
                style={styles.cancelButton}>
                <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <Path
                    d="M11.175 9.99991L16.425 4.75824C16.5819 4.60132 16.6701 4.3885 16.6701 4.16658C16.6701 3.94466 16.5819 3.73183 16.425 3.57491C16.2681 3.41799 16.0552 3.32983 15.8333 3.32983C15.6114 3.32983 15.3986 3.41799 15.2417 3.57491L9.99999 8.82491L4.75832 3.57491C4.6014 3.41799 4.38857 3.32983 4.16666 3.32983C3.94474 3.32983 3.73191 3.41799 3.57499 3.57491C3.41807 3.73183 3.32991 3.94466 3.32991 4.16658C3.32991 4.3885 3.41807 4.60132 3.57499 4.75824L8.82499 9.99991L3.57499 15.2416C3.49688 15.319 3.43489 15.4112 3.39258 15.5128C3.35027 15.6143 3.32849 15.7232 3.32849 15.8332C3.32849 15.9433 3.35027 16.0522 3.39258 16.1537C3.43489 16.2553 3.49688 16.3474 3.57499 16.4249C3.65246 16.503 3.74463 16.565 3.84618 16.6073C3.94773 16.6496 4.05665 16.6714 4.16666 16.6714C4.27667 16.6714 4.38559 16.6496 4.48714 16.6073C4.58869 16.565 4.68085 16.503 4.75832 16.4249L9.99999 11.1749L15.2417 16.4249C15.3191 16.503 15.4113 16.565 15.5128 16.6073C15.6144 16.6496 15.7233 16.6714 15.8333 16.6714C15.9433 16.6714 16.0523 16.6496 16.1538 16.6073C16.2554 16.565 16.3475 16.503 16.425 16.4249C16.5031 16.3474 16.5651 16.2553 16.6074 16.1537C16.6497 16.0522 16.6715 15.9433 16.6715 15.8332C16.6715 15.7232 16.6497 15.6143 16.6074 15.5128C16.5651 15.4112 16.5031 15.319 16.425 15.2416L11.175 9.99991Z"
                    fill="white"
                  />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>
          <BottomSheetFlatList
            data={
              progressFilter == 'all'
                ? level.words
                : progressFilter == 'new' &&
                  level.words.filter(word => {
                    const status =
                      progress?.data?.[level.id]?.[word.id]?.status;
                    return status == 0 || status == undefined;
                  }).length > 0
                ? level.words.filter(word => {
                    const status =
                      progress?.data?.[level.id]?.[word.id]?.status;
                    return status == 0 || status == undefined;
                  })
                : progressFilter == 'learned' &&
                  level.words.filter(
                    word => progress?.data?.[level.id]?.[word.id]?.status === 6,
                  ).length > 0
                ? level.words.filter(
                    word => progress.data?.[level.id]?.[word.id]?.status === 6,
                  )
                : progressFilter == 'skipped' &&
                  level.words.filter(
                    word => progress?.data?.[level.id]?.[word.id]?.status === 7,
                  ).length > 0
                ? level.words.filter(
                    word => progress.data?.[level.id]?.[word.id]?.status === 7,
                  )
                : progressFilter == 'repeat' &&
                  level.words.filter(word => {
                    const status =
                      progress?.data?.[level.id]?.[word.id]?.status;
                    return status > 0 && status < 6;
                  }).length > 0
                ? level.words.filter(word => {
                    const status =
                      progress?.data?.[level.id]?.[word.id]?.status;
                    return status > 0 && status < 6;
                  })
                : []
            }
            windowSize={2}
            contentContainerStyle={{gap: 4}}
            keyExtractor={item => item.id}
            ListHeaderComponent={
              <View style={{width: '100%', alignItems: 'center'}}>
                <View
                  style={{
                    width: '90%',
                    paddingVertical: 20,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <TouchableOpacity
                    onPress={() =>
                      progressFilterBottomSheetRef.current?.present()
                    }
                    style={{
                      flexDirection: 'row',
                      paddingVertical: 6,
                      gap: 6,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                      backgroundColor: '#22252E',
                    }}>
                    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <Path
                        d="M16.683 2.5H3.31425C2.97486 2.50027 2.64285 2.59904 2.35851 2.78432C2.07417 2.96961 1.84972 3.23345 1.7124 3.54381C1.57509 3.85417 1.53081 4.19772 1.58495 4.53276C1.63908 4.8678 1.7893 5.17992 2.01737 5.43125L7.81112 11.8031V17.8125C7.81117 17.93 7.84433 18.045 7.90678 18.1445C7.96924 18.244 8.05847 18.3239 8.16424 18.375C8.24878 18.4167 8.34187 18.4381 8.43612 18.4375C8.57817 18.4374 8.71595 18.3889 8.82675 18.3L9.99862 17.3625L11.9517 15.8C12.0248 15.7415 12.0838 15.6673 12.1244 15.5829C12.165 15.4985 12.1861 15.4061 12.1861 15.3125V11.8031L17.9799 5.43125C18.2079 5.17992 18.3582 4.8678 18.4123 4.53276C18.4664 4.19772 18.4221 3.85417 18.2848 3.54381C18.1475 3.23345 17.9231 2.96961 17.6387 2.78432C17.3544 2.59904 17.0224 2.50027 16.683 2.5Z"
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
                      {progressFilter == 'all'
                        ? 'Все слова'
                        : progressFilter == 'repeat'
                        ? 'Повторяю'
                        : progressFilter == 'learned'
                        ? 'Выученные'
                        : progressFilter == 'skipped'
                        ? 'Пропущенные'
                        : 'Ещё не появл...'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={AskForDeleteProgress}
                    style={{
                      flexDirection: 'row',
                      paddingVertical: 6,
                      gap: 6,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                      backgroundColor: '#271F1F',
                    }}>
                    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <Path
                        d="M14.1667 2.7513C10.9167 0.917969 6.91675 1.5013 4.25008 3.91797V2.5013C4.25008 2.0013 3.91675 1.66797 3.41675 1.66797C2.91675 1.66797 2.58341 2.0013 2.58341 2.5013V6.2513C2.58341 6.7513 2.91675 7.08464 3.41675 7.08464H7.16675C7.66675 7.08464 8.00008 6.7513 8.00008 6.2513C8.00008 5.7513 7.66675 5.41797 7.16675 5.41797H5.16675C6.41675 4.08464 8.16675 3.33464 10.0001 3.33464C13.6667 3.33464 16.6667 6.33464 16.6667 10.0013C16.6667 10.5013 17.0001 10.8346 17.5001 10.8346C18.0001 10.8346 18.3334 10.5013 18.3334 10.0013C18.3334 7.0013 16.7501 4.2513 14.1667 2.7513ZM16.5834 12.918H12.8334C12.3334 12.918 12.0001 13.2513 12.0001 13.7513C12.0001 14.2513 12.3334 14.5846 12.8334 14.5846H14.8334C13.5834 15.918 11.8334 16.668 10.0001 16.668C6.33341 16.668 3.33341 13.668 3.33341 10.0013C3.33341 9.5013 3.00008 9.16797 2.50008 9.16797C2.00008 9.16797 1.66675 9.5013 1.66675 10.0013C1.66675 14.5846 5.41675 18.3346 10.0001 18.3346C12.1667 18.3346 14.1667 17.5013 15.7501 16.0013V17.5013C15.7501 18.0013 16.0834 18.3346 16.5834 18.3346C17.0834 18.3346 17.4167 18.0013 17.4167 17.5013V13.7513C17.4167 13.2513 17.0001 12.918 16.5834 12.918Z"
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
                      Полный сброс
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text
                  style={[
                    styles.description,
                    {width: '90%', marginBottom: 10},
                  ]}>
                  {progressFilter == 'all'
                    ? 'Все слова из списка  ·  '
                    : progressFilter == 'repeat'
                    ? 'Слова, которые я повторяю  ·  '
                    : progressFilter == 'learned'
                    ? 'Слова, которые я выучил  ·  '
                    : progressFilter == 'skipped'
                    ? 'Пропущенные слова  ·  '
                    : 'Слова ещё не появлялись  ·  '}
                  {getWordsCount(progressFilter, false) + ' слов'}
                </Text>
              </View>
            }
            renderItem={({item}) => <Word item={item} />}
          />
        </View>
      </BottomSheetModal>

      <BottomSheetModal
        ref={progressFilterBottomSheetRef}
        index={0}
        stackBehavior="push"
        backdropComponent={renderBackdrop}
        snapPoints={progressFilterSnapPoints}
        backgroundStyle={{backgroundColor: '#14161B', borderRadius: 0}}
        handleIndicatorStyle={{backgroundColor: 'white'}}>
        <BottomSheetScrollView
          style={{flex: 1, width: '90%', alignSelf: 'center'}}>
          <TouchableOpacity
            onPress={() => progressFilterBottomSheetRef.current?.close()}
            style={[styles.cancelButton, {alignSelf: 'flex-end'}]}>
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <Path
                d="M11.175 9.99991L16.425 4.75824C16.5819 4.60132 16.6701 4.3885 16.6701 4.16658C16.6701 3.94466 16.5819 3.73183 16.425 3.57491C16.2681 3.41799 16.0552 3.32983 15.8333 3.32983C15.6114 3.32983 15.3986 3.41799 15.2417 3.57491L9.99999 8.82491L4.75832 3.57491C4.6014 3.41799 4.38857 3.32983 4.16666 3.32983C3.94474 3.32983 3.73191 3.41799 3.57499 3.57491C3.41807 3.73183 3.32991 3.94466 3.32991 4.16658C3.32991 4.3885 3.41807 4.60132 3.57499 4.75824L8.82499 9.99991L3.57499 15.2416C3.49688 15.319 3.43489 15.4112 3.39258 15.5128C3.35027 15.6143 3.32849 15.7232 3.32849 15.8332C3.32849 15.9433 3.35027 16.0522 3.39258 16.1537C3.43489 16.2553 3.49688 16.3474 3.57499 16.4249C3.65246 16.503 3.74463 16.565 3.84618 16.6073C3.94773 16.6496 4.05665 16.6714 4.16666 16.6714C4.27667 16.6714 4.38559 16.6496 4.48714 16.6073C4.58869 16.565 4.68085 16.503 4.75832 16.4249L9.99999 11.1749L15.2417 16.4249C15.3191 16.503 15.4113 16.565 15.5128 16.6073C15.6144 16.6496 15.7233 16.6714 15.8333 16.6714C15.9433 16.6714 16.0523 16.6496 16.1538 16.6073C16.2554 16.565 16.3475 16.503 16.425 16.4249C16.5031 16.3474 16.5651 16.2553 16.6074 16.1537C16.6497 16.0522 16.6715 15.9433 16.6715 15.8332C16.6715 15.7232 16.6497 15.6143 16.6074 15.5128C16.5651 15.4112 16.5031 15.319 16.425 15.2416L11.175 9.99991Z"
                fill="white"
              />
            </Svg>
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: 'Inter-Regular',
              marginTop: 12,
              marginLeft: 16,
              fontSize: 16,
              lineHeight: 20,
              color: 'rgba(255, 255, 255, 0.50)',
            }}>
            Фильтр
          </Text>
          <View style={{width: '100%', gap: 1, marginTop: 8}}>
            <TouchableOpacity
              onPress={() => {
                setProgressFilter('all');
                progressFilterBottomSheetRef.current?.close();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1C1F26',
                width: '100%',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 16,
                  lineHeight: 20,
                  color:
                    progressFilter == 'all'
                      ? 'white'
                      : 'rgba(255, 255, 255, 0.70)',
                }}>
                Все слова
              </Text>
              <Text
                style={{
                  marginLeft: 8,
                  fontFamily: 'Inter-Medium',
                  fontSize: 14,
                  lineHeight: 20,
                  color: 'rgba(255, 255, 255, 0.30)',
                }}>
                {getWordsCount('all', false)}
              </Text>
              {progressFilter == 'all' && (
                <Svg
                  style={{position: 'absolute', right: 18}}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none">
                  <Path
                    d="M18.5818 3.94156C18.0249 3.38389 17.1205 3.38424 16.5628 3.94156L7.47618 13.0286L3.43755 8.98997C2.87988 8.43231 1.97592 8.43231 1.41825 8.98997C0.860584 9.54764 0.860584 10.4516 1.41825 11.0093L6.46632 16.0573C6.74497 16.336 7.11036 16.4757 7.47579 16.4757C7.84122 16.4757 8.20696 16.3363 8.48562 16.0573L18.5818 5.96082C19.1395 5.40354 19.1395 4.49919 18.5818 3.94156Z"
                    fill="#108C15"
                  />
                </Svg>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setProgressFilter('new');
                progressFilterBottomSheetRef.current?.close();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1C1F26',
                width: '100%',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 16,
                  lineHeight: 20,
                  color:
                    progressFilter == 'new'
                      ? 'white'
                      : 'rgba(255, 255, 255, 0.70)',
                }}>
                Ещё не появлялись
              </Text>
              <Text
                style={{
                  marginLeft: 8,
                  fontFamily: 'Inter-Medium',
                  fontSize: 14,
                  lineHeight: 20,
                  color: 'rgba(255, 255, 255, 0.30)',
                }}>
                {getWordsCount('new', false)}
              </Text>
              {progressFilter == 'new' && (
                <Svg
                  style={{position: 'absolute', right: 18}}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none">
                  <Path
                    d="M18.5818 3.94156C18.0249 3.38389 17.1205 3.38424 16.5628 3.94156L7.47618 13.0286L3.43755 8.98997C2.87988 8.43231 1.97592 8.43231 1.41825 8.98997C0.860584 9.54764 0.860584 10.4516 1.41825 11.0093L6.46632 16.0573C6.74497 16.336 7.11036 16.4757 7.47579 16.4757C7.84122 16.4757 8.20696 16.3363 8.48562 16.0573L18.5818 5.96082C19.1395 5.40354 19.1395 4.49919 18.5818 3.94156Z"
                    fill="#108C15"
                  />
                </Svg>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setProgressFilter('repeat');
                progressFilterBottomSheetRef.current?.close();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1C1F26',
                width: '100%',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 16,
                  lineHeight: 20,
                  color:
                    progressFilter == 'repeat'
                      ? 'white'
                      : 'rgba(255, 255, 255, 0.70)',
                }}>
                Повторяю
              </Text>
              <Text
                style={{
                  marginLeft: 8,
                  fontFamily: 'Inter-Medium',
                  fontSize: 14,
                  lineHeight: 20,
                  color: 'rgba(255, 255, 255, 0.30)',
                }}>
                {getWordsCount('repeat', false)}
              </Text>
              {progressFilter == 'repeat' && (
                <Svg
                  style={{position: 'absolute', right: 18}}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none">
                  <Path
                    d="M18.5818 3.94156C18.0249 3.38389 17.1205 3.38424 16.5628 3.94156L7.47618 13.0286L3.43755 8.98997C2.87988 8.43231 1.97592 8.43231 1.41825 8.98997C0.860584 9.54764 0.860584 10.4516 1.41825 11.0093L6.46632 16.0573C6.74497 16.336 7.11036 16.4757 7.47579 16.4757C7.84122 16.4757 8.20696 16.3363 8.48562 16.0573L18.5818 5.96082C19.1395 5.40354 19.1395 4.49919 18.5818 3.94156Z"
                    fill="#108C15"
                  />
                </Svg>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setProgressFilter('learned');
                progressFilterBottomSheetRef.current?.close();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1C1F26',
                width: '100%',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 16,
                  lineHeight: 20,
                  color:
                    progressFilter == 'learned'
                      ? 'white'
                      : 'rgba(255, 255, 255, 0.70)',
                }}>
                Выученные
              </Text>
              <Text
                style={{
                  marginLeft: 8,
                  fontFamily: 'Inter-Medium',
                  fontSize: 14,
                  lineHeight: 20,
                  color: 'rgba(255, 255, 255, 0.30)',
                }}>
                {getWordsCount('learned', false)}
              </Text>
              {progressFilter == 'learned' && (
                <Svg
                  style={{position: 'absolute', right: 18}}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none">
                  <Path
                    d="M18.5818 3.94156C18.0249 3.38389 17.1205 3.38424 16.5628 3.94156L7.47618 13.0286L3.43755 8.98997C2.87988 8.43231 1.97592 8.43231 1.41825 8.98997C0.860584 9.54764 0.860584 10.4516 1.41825 11.0093L6.46632 16.0573C6.74497 16.336 7.11036 16.4757 7.47579 16.4757C7.84122 16.4757 8.20696 16.3363 8.48562 16.0573L18.5818 5.96082C19.1395 5.40354 19.1395 4.49919 18.5818 3.94156Z"
                    fill="#108C15"
                  />
                </Svg>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setProgressFilter('skipped');
                progressFilterBottomSheetRef.current?.close();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1C1F26',
                width: '100%',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 16,
                  lineHeight: 20,
                  color:
                    progressFilter == 'skipped'
                      ? 'white'
                      : 'rgba(255, 255, 255, 0.70)',
                }}>
                Пропущенные
              </Text>
              <Text
                style={{
                  marginLeft: 8,
                  fontFamily: 'Inter-Medium',
                  fontSize: 14,
                  lineHeight: 20,
                  color: 'rgba(255, 255, 255, 0.30)',
                }}>
                {getWordsCount('skipped', false)}
              </Text>
              {progressFilter == 'skipped' && (
                <Svg
                  style={{position: 'absolute', right: 18}}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none">
                  <Path
                    d="M18.5818 3.94156C18.0249 3.38389 17.1205 3.38424 16.5628 3.94156L7.47618 13.0286L3.43755 8.98997C2.87988 8.43231 1.97592 8.43231 1.41825 8.98997C0.860584 9.54764 0.860584 10.4516 1.41825 11.0093L6.46632 16.0573C6.74497 16.336 7.11036 16.4757 7.47579 16.4757C7.84122 16.4757 8.20696 16.3363 8.48562 16.0573L18.5818 5.96082C19.1395 5.40354 19.1395 4.49919 18.5818 3.94156Z"
                    fill="#108C15"
                  />
                </Svg>
              )}
            </TouchableOpacity>

            <Text
              style={{
                marginTop: 8,
                marginHorizontal: 16,
                fontFamily: 'Inter-Medium',
                fontSize: 12,
                lineHeight: 16,
                color: 'rgba(255, 255, 255, 0.50)',
              }}>
              {progressFilter == 'all'
                ? 'Вам будут показаны новые слова и те, которые вы повторяете.'
                : progressFilter == 'new'
                ? 'Вам будут показаны слова, которые вы ещё не встречали в карточках на этом уровне.'
                : progressFilter == 'repeat'
                ? 'Вам будут показаны те слова, которые осталось повторить один или несколько раз.'
                : progressFilter == 'learned'
                ? 'Вам будут показаны выученные слова. Это полезно, чтобы проверить усвоенный материал.'
                : 'Вам будут показаны пропущенные слова. Проверьте, не пропустили ли вы незнакомое слово.'}
            </Text>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <BottomSheetModal
        ref={translateModeBottomSheetRef}
        index={0}
        backdropComponent={renderBackdrop}
        snapPoints={translateModeSnapPoints}
        backgroundStyle={{backgroundColor: '#14161B', borderRadius: 0}}
        handleIndicatorStyle={{backgroundColor: 'white'}}>
        <BottomSheetScrollView
          style={{flex: 1, width: '90%', alignSelf: 'center'}}>
          <TouchableOpacity
            onPress={() => translateModeBottomSheetRef.current?.close()}
            style={[styles.cancelButton, {alignSelf: 'flex-end'}]}>
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <Path
                d="M11.175 9.99991L16.425 4.75824C16.5819 4.60132 16.6701 4.3885 16.6701 4.16658C16.6701 3.94466 16.5819 3.73183 16.425 3.57491C16.2681 3.41799 16.0552 3.32983 15.8333 3.32983C15.6114 3.32983 15.3986 3.41799 15.2417 3.57491L9.99999 8.82491L4.75832 3.57491C4.6014 3.41799 4.38857 3.32983 4.16666 3.32983C3.94474 3.32983 3.73191 3.41799 3.57499 3.57491C3.41807 3.73183 3.32991 3.94466 3.32991 4.16658C3.32991 4.3885 3.41807 4.60132 3.57499 4.75824L8.82499 9.99991L3.57499 15.2416C3.49688 15.319 3.43489 15.4112 3.39258 15.5128C3.35027 15.6143 3.32849 15.7232 3.32849 15.8332C3.32849 15.9433 3.35027 16.0522 3.39258 16.1537C3.43489 16.2553 3.49688 16.3474 3.57499 16.4249C3.65246 16.503 3.74463 16.565 3.84618 16.6073C3.94773 16.6496 4.05665 16.6714 4.16666 16.6714C4.27667 16.6714 4.38559 16.6496 4.48714 16.6073C4.58869 16.565 4.68085 16.503 4.75832 16.4249L9.99999 11.1749L15.2417 16.4249C15.3191 16.503 15.4113 16.565 15.5128 16.6073C15.6144 16.6496 15.7233 16.6714 15.8333 16.6714C15.9433 16.6714 16.0523 16.6496 16.1538 16.6073C16.2554 16.565 16.3475 16.503 16.425 16.4249C16.5031 16.3474 16.5651 16.2553 16.6074 16.1537C16.6497 16.0522 16.6715 15.9433 16.6715 15.8332C16.6715 15.7232 16.6497 15.6143 16.6074 15.5128C16.5651 15.4112 16.5031 15.319 16.425 15.2416L11.175 9.99991Z"
                fill="white"
              />
            </Svg>
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: 'Inter-Regular',
              marginTop: 12,
              marginLeft: 16,
              fontSize: 16,
              lineHeight: 20,
              color: 'rgba(255, 255, 255, 0.50)',
            }}>
            Режим показа
          </Text>
          <View style={{width: '100%', gap: 1, marginTop: 8}}>
            <TouchableOpacity
              onPress={() => {
                setTranslateMode('english');
                translateModeBottomSheetRef.current?.close();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1C1F26',
                width: '100%',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 16,
                  lineHeight: 20,
                  color:
                    translateMode == 'english'
                      ? 'white'
                      : 'rgba(255, 255, 255, 0.70)',
                }}>
                Вначале на английском
              </Text>
              {translateMode == 'english' && (
                <Svg
                  style={{position: 'absolute', right: 18}}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none">
                  <Path
                    d="M18.5818 3.94156C18.0249 3.38389 17.1205 3.38424 16.5628 3.94156L7.47618 13.0286L3.43755 8.98997C2.87988 8.43231 1.97592 8.43231 1.41825 8.98997C0.860584 9.54764 0.860584 10.4516 1.41825 11.0093L6.46632 16.0573C6.74497 16.336 7.11036 16.4757 7.47579 16.4757C7.84122 16.4757 8.20696 16.3363 8.48562 16.0573L18.5818 5.96082C19.1395 5.40354 19.1395 4.49919 18.5818 3.94156Z"
                    fill="#108C15"
                  />
                </Svg>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setTranslateMode('russian');
                translateModeBottomSheetRef.current?.close();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1C1F26',
                width: '100%',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 16,
                  lineHeight: 20,
                  color:
                    translateMode == 'russian'
                      ? 'white'
                      : 'rgba(255, 255, 255, 0.70)',
                }}>
                Вначале на русском
              </Text>
              {translateMode == 'russian' && (
                <Svg
                  style={{position: 'absolute', right: 18}}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none">
                  <Path
                    d="M18.5818 3.94156C18.0249 3.38389 17.1205 3.38424 16.5628 3.94156L7.47618 13.0286L3.43755 8.98997C2.87988 8.43231 1.97592 8.43231 1.41825 8.98997C0.860584 9.54764 0.860584 10.4516 1.41825 11.0093L6.46632 16.0573C6.74497 16.336 7.11036 16.4757 7.47579 16.4757C7.84122 16.4757 8.20696 16.3363 8.48562 16.0573L18.5818 5.96082C19.1395 5.40354 19.1395 4.49919 18.5818 3.94156Z"
                    fill="#108C15"
                  />
                </Svg>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setTranslateMode('swap');
                translateModeBottomSheetRef.current?.close();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1C1F26',
                width: '100%',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 16,
                  lineHeight: 20,
                  color:
                    translateMode == 'swap'
                      ? 'white'
                      : 'rgba(255, 255, 255, 0.70)',
                }}>
                Чередовать
              </Text>
              {translateMode == 'swap' && (
                <Svg
                  style={{position: 'absolute', right: 18}}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none">
                  <Path
                    d="M18.5818 3.94156C18.0249 3.38389 17.1205 3.38424 16.5628 3.94156L7.47618 13.0286L3.43755 8.98997C2.87988 8.43231 1.97592 8.43231 1.41825 8.98997C0.860584 9.54764 0.860584 10.4516 1.41825 11.0093L6.46632 16.0573C6.74497 16.336 7.11036 16.4757 7.47579 16.4757C7.84122 16.4757 8.20696 16.3363 8.48562 16.0573L18.5818 5.96082C19.1395 5.40354 19.1395 4.49919 18.5818 3.94156Z"
                    fill="#108C15"
                  />
                </Svg>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setTranslateMode('random');
                translateModeBottomSheetRef.current?.close();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1C1F26',
                width: '100%',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 16,
                  lineHeight: 20,
                  color:
                    translateMode == 'random'
                      ? 'white'
                      : 'rgba(255, 255, 255, 0.70)',
                }}>
                В случайном порядке
              </Text>
              {translateMode == 'random' && (
                <Svg
                  style={{position: 'absolute', right: 18}}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none">
                  <Path
                    d="M18.5818 3.94156C18.0249 3.38389 17.1205 3.38424 16.5628 3.94156L7.47618 13.0286L3.43755 8.98997C2.87988 8.43231 1.97592 8.43231 1.41825 8.98997C0.860584 9.54764 0.860584 10.4516 1.41825 11.0093L6.46632 16.0573C6.74497 16.336 7.11036 16.4757 7.47579 16.4757C7.84122 16.4757 8.20696 16.3363 8.48562 16.0573L18.5818 5.96082C19.1395 5.40354 19.1395 4.49919 18.5818 3.94156Z"
                    fill="#108C15"
                  />
                </Svg>
              )}
            </TouchableOpacity>

            <Text
              style={{
                marginTop: 8,
                marginHorizontal: 16,
                fontFamily: 'Inter-Medium',
                fontSize: 12,
                lineHeight: 16,
                color: 'rgba(255, 255, 255, 0.50)',
              }}>
              {translateMode == 'english'
                ? 'Будет показано слово на английском языке, а вы должны будете вспомнить его перевод'
                : translateMode == 'russian'
                ? 'Будет показано слово на russkom языке, а вы должны будете вспомнить его перевод'
                : translateMode == 'swap'
                ? 'Вам будут показаны те слова, которые осталось повторить один или несколько раз.'
                : 'Вам будут показаны выученные слова. Это полезно, чтобы проверить усвоенный материал.'}
            </Text>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <BottomSheetModal
        ref={filterBottomSheetRef}
        index={0}
        backdropComponent={renderBackdrop}
        snapPoints={filterSnapPoints}
        backgroundStyle={{backgroundColor: '#14161B', borderRadius: 0}}
        handleIndicatorStyle={{backgroundColor: 'white'}}>
        <BottomSheetScrollView
          style={{flex: 1, width: '90%', alignSelf: 'center'}}>
          <TouchableOpacity
            onPress={() => filterBottomSheetRef.current?.close()}
            style={[styles.cancelButton, {alignSelf: 'flex-end'}]}>
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <Path
                d="M11.175 9.99991L16.425 4.75824C16.5819 4.60132 16.6701 4.3885 16.6701 4.16658C16.6701 3.94466 16.5819 3.73183 16.425 3.57491C16.2681 3.41799 16.0552 3.32983 15.8333 3.32983C15.6114 3.32983 15.3986 3.41799 15.2417 3.57491L9.99999 8.82491L4.75832 3.57491C4.6014 3.41799 4.38857 3.32983 4.16666 3.32983C3.94474 3.32983 3.73191 3.41799 3.57499 3.57491C3.41807 3.73183 3.32991 3.94466 3.32991 4.16658C3.32991 4.3885 3.41807 4.60132 3.57499 4.75824L8.82499 9.99991L3.57499 15.2416C3.49688 15.319 3.43489 15.4112 3.39258 15.5128C3.35027 15.6143 3.32849 15.7232 3.32849 15.8332C3.32849 15.9433 3.35027 16.0522 3.39258 16.1537C3.43489 16.2553 3.49688 16.3474 3.57499 16.4249C3.65246 16.503 3.74463 16.565 3.84618 16.6073C3.94773 16.6496 4.05665 16.6714 4.16666 16.6714C4.27667 16.6714 4.38559 16.6496 4.48714 16.6073C4.58869 16.565 4.68085 16.503 4.75832 16.4249L9.99999 11.1749L15.2417 16.4249C15.3191 16.503 15.4113 16.565 15.5128 16.6073C15.6144 16.6496 15.7233 16.6714 15.8333 16.6714C15.9433 16.6714 16.0523 16.6496 16.1538 16.6073C16.2554 16.565 16.3475 16.503 16.425 16.4249C16.5031 16.3474 16.5651 16.2553 16.6074 16.1537C16.6497 16.0522 16.6715 15.9433 16.6715 15.8332C16.6715 15.7232 16.6497 15.6143 16.6074 15.5128C16.5651 15.4112 16.5031 15.319 16.425 15.2416L11.175 9.99991Z"
                fill="white"
              />
            </Svg>
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: 'Inter-Regular',
              marginTop: 12,
              marginLeft: 16,
              fontSize: 16,
              lineHeight: 20,
              color: 'rgba(255, 255, 255, 0.50)',
            }}>
            Режим показа
          </Text>
          <View style={{width: '100%', gap: 1, marginTop: 8}}>
            <TouchableOpacity
              onPress={() => {
                setFilter('all');
                filterBottomSheetRef.current?.close();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1C1F26',
                width: '100%',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 16,
                  lineHeight: 20,
                  color:
                    filter == 'all' ? 'white' : 'rgba(255, 255, 255, 0.70)',
                }}>
                Без фильтра
              </Text>
              <Text
                style={{
                  marginLeft: 8,
                  fontFamily: 'Inter-Medium',
                  fontSize: 14,
                  lineHeight: 20,
                  color: 'rgba(255, 255, 255, 0.30)',
                }}>
                {getWordsCount('all', false)} (доступно:{' '}
                {getWordsCount('all', true)})
              </Text>
              {filter == 'all' && (
                <Svg
                  style={{position: 'absolute', right: 18}}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none">
                  <Path
                    d="M18.5818 3.94156C18.0249 3.38389 17.1205 3.38424 16.5628 3.94156L7.47618 13.0286L3.43755 8.98997C2.87988 8.43231 1.97592 8.43231 1.41825 8.98997C0.860584 9.54764 0.860584 10.4516 1.41825 11.0093L6.46632 16.0573C6.74497 16.336 7.11036 16.4757 7.47579 16.4757C7.84122 16.4757 8.20696 16.3363 8.48562 16.0573L18.5818 5.96082C19.1395 5.40354 19.1395 4.49919 18.5818 3.94156Z"
                    fill="#108C15"
                  />
                </Svg>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setFilter('new');
                filterBottomSheetRef.current?.close();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1C1F26',
                width: '100%',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 16,
                  lineHeight: 20,
                  color:
                    filter == 'new' ? 'white' : 'rgba(255, 255, 255, 0.70)',
                }}>
                Ещё не появлялись
              </Text>
              <Text
                style={{
                  marginLeft: 8,
                  fontFamily: 'Inter-Medium',
                  fontSize: 14,
                  lineHeight: 20,
                  color: 'rgba(255, 255, 255, 0.30)',
                }}>
                {getWordsCount('new', false)}
              </Text>
              {filter == 'new' && (
                <Svg
                  style={{position: 'absolute', right: 18}}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none">
                  <Path
                    d="M18.5818 3.94156C18.0249 3.38389 17.1205 3.38424 16.5628 3.94156L7.47618 13.0286L3.43755 8.98997C2.87988 8.43231 1.97592 8.43231 1.41825 8.98997C0.860584 9.54764 0.860584 10.4516 1.41825 11.0093L6.46632 16.0573C6.74497 16.336 7.11036 16.4757 7.47579 16.4757C7.84122 16.4757 8.20696 16.3363 8.48562 16.0573L18.5818 5.96082C19.1395 5.40354 19.1395 4.49919 18.5818 3.94156Z"
                    fill="#108C15"
                  />
                </Svg>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setFilter('repeat');
                filterBottomSheetRef.current?.close();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1C1F26',
                width: '100%',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 16,
                  lineHeight: 20,
                  color:
                    filter == 'repeat' ? 'white' : 'rgba(255, 255, 255, 0.70)',
                }}>
                Повторы
              </Text>
              <Text
                style={{
                  marginLeft: 8,
                  fontFamily: 'Inter-Medium',
                  fontSize: 14,
                  lineHeight: 20,
                  color: 'rgba(255, 255, 255, 0.30)',
                }}>
                {getWordsCount('repeat', false)} (доступно:{' '}
                {getWordsCount('repeat', true)})
              </Text>
              {filter == 'repeat' && (
                <Svg
                  style={{position: 'absolute', right: 18}}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none">
                  <Path
                    d="M18.5818 3.94156C18.0249 3.38389 17.1205 3.38424 16.5628 3.94156L7.47618 13.0286L3.43755 8.98997C2.87988 8.43231 1.97592 8.43231 1.41825 8.98997C0.860584 9.54764 0.860584 10.4516 1.41825 11.0093L6.46632 16.0573C6.74497 16.336 7.11036 16.4757 7.47579 16.4757C7.84122 16.4757 8.20696 16.3363 8.48562 16.0573L18.5818 5.96082C19.1395 5.40354 19.1395 4.49919 18.5818 3.94156Z"
                    fill="#108C15"
                  />
                </Svg>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setFilter('learned');
                filterBottomSheetRef.current?.close();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1C1F26',
                width: '100%',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 16,
                  lineHeight: 20,
                  color:
                    filter == 'learned' ? 'white' : 'rgba(255, 255, 255, 0.70)',
                }}>
                Выученные
              </Text>
              <Text
                style={{
                  marginLeft: 8,
                  fontFamily: 'Inter-Medium',
                  fontSize: 14,
                  lineHeight: 20,
                  color: 'rgba(255, 255, 255, 0.30)',
                }}>
                {getWordsCount('learned', false)}
              </Text>
              {filter == 'learned' && (
                <Svg
                  style={{position: 'absolute', right: 18}}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none">
                  <Path
                    d="M18.5818 3.94156C18.0249 3.38389 17.1205 3.38424 16.5628 3.94156L7.47618 13.0286L3.43755 8.98997C2.87988 8.43231 1.97592 8.43231 1.41825 8.98997C0.860584 9.54764 0.860584 10.4516 1.41825 11.0093L6.46632 16.0573C6.74497 16.336 7.11036 16.4757 7.47579 16.4757C7.84122 16.4757 8.20696 16.3363 8.48562 16.0573L18.5818 5.96082C19.1395 5.40354 19.1395 4.49919 18.5818 3.94156Z"
                    fill="#108C15"
                  />
                </Svg>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setFilter('skipped');
                filterBottomSheetRef.current?.close();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1C1F26',
                width: '100%',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 16,
                  lineHeight: 20,
                  color:
                    filter == 'skipped' ? 'white' : 'rgba(255, 255, 255, 0.70)',
                }}>
                Пропущенные
              </Text>
              <Text
                style={{
                  marginLeft: 8,
                  fontFamily: 'Inter-Medium',
                  fontSize: 14,
                  lineHeight: 20,
                  color: 'rgba(255, 255, 255, 0.30)',
                }}>
                {getWordsCount('skipped', false)}
              </Text>
              {filter == 'skipped' && (
                <Svg
                  style={{position: 'absolute', right: 18}}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none">
                  <Path
                    d="M18.5818 3.94156C18.0249 3.38389 17.1205 3.38424 16.5628 3.94156L7.47618 13.0286L3.43755 8.98997C2.87988 8.43231 1.97592 8.43231 1.41825 8.98997C0.860584 9.54764 0.860584 10.4516 1.41825 11.0093L6.46632 16.0573C6.74497 16.336 7.11036 16.4757 7.47579 16.4757C7.84122 16.4757 8.20696 16.3363 8.48562 16.0573L18.5818 5.96082C19.1395 5.40354 19.1395 4.49919 18.5818 3.94156Z"
                    fill="#108C15"
                  />
                </Svg>
              )}
            </TouchableOpacity>

            <Text
              style={{
                marginTop: 8,
                marginHorizontal: 16,
                fontFamily: 'Inter-Medium',
                fontSize: 12,
                lineHeight: 16,
                color: 'rgba(255, 255, 255, 0.50)',
              }}>
              {filter == 'all'
                ? 'Вам будут показаны новые слова и те, которые вы повторяете.'
                : filter == 'new'
                ? 'Вам будут показаны слова, которые вы ещё не встречали в карточках на этом уровне.'
                : filter == 'repeat'
                ? 'Вам будут показаны те слова, которые осталось повторить один или несколько раз.'
                : filter == 'learned'
                ? 'Вам будут показаны выученные слова. Это полезно, чтобы проверить усвоенный материал.'
                : 'Вам будут показаны пропущенные слова. Проверьте, не пропустили ли вы незнакомое слово.'}
            </Text>
          </View>
        </BottomSheetScrollView>
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
  progressButton: {
    alignSelf: 'center',
    gap: 12,
    width: '90%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1C1F26',
    flexDirection: 'row',
    borderRadius: 16,
    marginTop: 10,
  },
  title: {
    color: 'white',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Inter-Bold',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.50))',
    fontSize: 14,
    lineHeight: 16,
    fontFamily: 'Inter-Regular',
  },
  info: {
    color: 'rgba(255, 255, 255, 0.50)',
    width: '80%',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    marginBottom: 32,
  },
  filterButton: {
    width: '90%',
    backgroundColor: '#1C1F26',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  choosenFilter: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.50)',
  },
  startLearningButton: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#F1CC06',
    padding: 14,
    alignItems: 'center',
    width: '90%',
  },
  startLearningText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    lineHeight: 20,
    color: '#14161B',
  },
  cancelButton: {
    borderRadius: 10,
    backgroundColor: '#22252E',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSheetHeader: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#14161B',
    borderBottomWidth: 1,
    borderColor: '#313843',
  },
  progressSheetHeaderContent: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 24,
    marginTop: 12,
  },
  progressSheetLevel: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    lineHeight: 32,
    width: '70%',
  },
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
  learnButton: {
    height: 36,
    paddingHorizontal: 10,
    backgroundColor: '#22252E',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Prestart;
