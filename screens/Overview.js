import React, {useState, useEffect, useRef} from 'react';
import {
  Dimensions,
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  AppState,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Svg, {Path, G} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import Tts from 'react-native-tts';
import Sound from 'react-native-sound';

Sound.setCategory('Playback');

var whoosh = new Sound('1sec_silence.mp3', Sound.MAIN_BUNDLE, error => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
  console.log(
    'duration in seconds: ' +
      whoosh.getDuration() +
      'number of channels: ' +
      whoosh.getNumberOfChannels(),
  );

  whoosh.play(success => {
    if (success) {
      console.log('successfully finished playing');
    } else {
      console.log('playback failed due to audio decoding errors');
    }
  });
});

function Overview({navigation, route}) {
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;
  const [index, setIndex] = useState(1);
  carouselRef = useRef(null);
  const mode = route.params.mode;
  const [words, setWords] = useState(route.params.words);
  const [progress, setProgress] = useState(route.params.progress);

  Tts.setDefaultLanguage('en-CA');
  Tts.addEventListener('tts-start', event => console.log('start', event));
  Tts.addEventListener('tts-finish', event => console.log('finish', event));
  Tts.addEventListener('tts-cancel', event => console.log('cancel', event));

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

  const buttonPress = index => {
    const word = words[index];
    var updatedProgress = {...progress};
    var updatedwords = words;
    if (mode == 'skipped') {
      updatedProgress.data[word.level][word.id] = {
        status: 1,
        date: new Date(),
      };
      setProgress(updatedProgress);
      updatedwords = updatedwords.filter(word => word.id != words[index].id);
      setWords(updatedwords);
    } else if (mode == 'learned') {
      Alert.alert(
        'Сбросить прогресс слова?',
        'Это действие сбросит прогресс по слову до начала повторения.',
        [
          {
            text: 'Нет',
            style: 'cancel',
          },
          {
            text: 'Сбросить',
            onPress: () => {
              updatedwords = updatedwords.filter(
                word => word.id != words[index].id,
              );
              updatedProgress.data[word.level][word.id] = {
                status: 0,
                date: new Date(),
              };
              setProgress(updatedProgress);
              setWords(updatedwords);
            },
          },
        ],
      );
    } else {
      updatedwords = updatedwords.filter(word => word.id != words[index].id);
      updatedProgress.data[word.level][word.id] = {
        status: 6,
        date: new Date(),
      };
      setProgress(updatedProgress);
      setWords(updatedwords);
    }
  };

  const Card = React.memo(({index}) => {
    const [show, setShow] = useState(false);
    return (
      <View
        style={{
          width: '90%',
          alignSelf: 'center',
          height: '75%',
          justifyContent: 'center',
          backgroundColor: '#000000',
        }}>
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#1B1D25',
            borderRadius: 16,
          }}>
          <View>
            <View style={styles.RepeatView}>
              <View
                style={[
                  styles.Repeat,
                  {
                    backgroundColor:
                      mode == 'learned'
                        ? '#108C15'
                        : mode == 'learning'
                        ? '#CD4A00'
                        : '#2F333E',
                  },
                ]}>
                <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <Path
                    d="M11.8022 6.46423C11.786 6.39371 11.7525 6.3283 11.7048 6.27392C11.657 6.21954 11.5966 6.1778 11.5288 6.15251L8.37877 4.97126L9.1772 0.962668C9.19558 0.869813 9.18372 0.773519 9.14338 0.687896C9.103 0.602277 9.03628 0.531831 8.95298 0.486887C8.86885 0.442139 8.7723 0.426455 8.67837 0.442279C8.58439 0.458103 8.49829 0.504548 8.43345 0.574387L2.30847 7.13689C2.25828 7.18895 2.22196 7.25278 2.20285 7.32256C2.18374 7.3923 2.18245 7.46571 2.19909 7.53611C2.21621 7.60624 2.25001 7.67121 2.29762 7.72546C2.34522 7.77975 2.40522 7.82171 2.47253 7.84782L5.62252 9.02907L4.82408 13.0377C4.80575 13.1305 4.8176 13.2268 4.85794 13.3124C4.89828 13.3981 4.965 13.4685 5.0483 13.5134C5.11112 13.5451 5.18033 13.562 5.25064 13.5627C5.3101 13.5629 5.36894 13.5509 5.4235 13.5274C5.4781 13.5039 5.52723 13.4693 5.56783 13.4259L11.6928 6.86345C11.743 6.81139 11.7793 6.74756 11.7984 6.67777C11.8176 6.60804 11.8189 6.53462 11.8022 6.46423Z"
                    fill="white"
                  />
                </Svg>
                <Text style={styles.RepeatText}>
                  {mode == 'learned'
                    ? 'Выученное'
                    : mode == 'learning'
                    ? 'Осталось повторов: ' +
                      (6 - words[index].status).toString()
                    : 'Пропущенное слово'}
                </Text>
              </View>
              <View
                style={{
                  width: 3,
                  height: 4,
                  backgroundColor:
                    mode == 'learned'
                      ? '#108C15'
                      : mode == 'learning'
                      ? '#CD4A00'
                      : '#2F333E',
                  borderBottomLeftRadius: 6,
                }}>
                <View
                  style={{
                    width: 6,
                    height: 8,
                    backgroundColor:
                      mode == 'learned'
                        ? '#08570B'
                        : mode == 'learning'
                        ? '#652501'
                        : '#252830',
                    borderTopLeftRadius: 5,
                    borderBottomLeftRadius: 6,
                  }}></View>
              </View>
            </View>
            <TouchableOpacity
              // onPress={() =>
              //   Speech.speak(words[index].word + ' ,', {language: 'en-CA'})
              // }
              onPress={() => {
                Tts.stop();
                Tts.speak(`${words[index].word}`);
              }}
              style={{
                paddingHorizontal: 8,
                position: 'absolute',
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: '#272D35',
                borderRadius: 10,
                backgroundColor: '#22252E',
                right: 16,
                top: 16,
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
          </View>
          <Text
            style={{
              fontSize: 16,
              alignSelf: 'center',
              lineHeight: 20,
              marginTop: 84,
              fontFamily: 'Inter-Regular',
              color: 'rgba(255, 255, 255, 0.50)',
            }}>
            Уровень {words[index].level}
          </Text>
          <Text
            style={{
              fontSize: 28,
              alignSelf: 'center',
              lineHeight: 36,
              marginTop: 8,
              fontFamily: 'Inter-SemiBold',
              color: 'white',
            }}>
            {words[index].word}
          </Text>
          <TouchableOpacity
            onPress={() => setShow(!show)}
            style={styles.showTranslateButton}>
            {show ? (
              <Text style={[styles.word, {marginTop: 0}]}>
                {words[index].ru}
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
          <TouchableOpacity
            onPress={() => buttonPress(index)}
            style={{
              gap: 6,
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 8,
              alignSelf: 'center',
              marginTop: 24,
              backgroundColor: '#22252E',
              borderColor: '#313843',
              borderWidth: 1,
            }}>
            {mode == 'skipped' ? (
              <Svg width="21" height="20" viewBox="0 0 21 20" fill="none">
                <Path
                  d="M10.5 2C10.2348 2 9.98043 2.10536 9.79289 2.29289C9.60536 2.48043 9.5 2.73478 9.5 3V9H3.5C3.23478 9 2.98043 9.10536 2.79289 9.29289C2.60536 9.48043 2.5 9.73478 2.5 10C2.5 10.2652 2.60536 10.5196 2.79289 10.7071C2.98043 10.8946 3.23478 11 3.5 11H9.5V17C9.5 17.2652 9.60536 17.5196 9.79289 17.7071C9.98043 17.8946 10.2348 18 10.5 18C10.7652 18 11.0196 17.8946 11.2071 17.7071C11.3946 17.5196 11.5 17.2652 11.5 17V11H17.5C17.7652 11 18.0196 10.8946 18.2071 10.7071C18.3946 10.5196 18.5 10.2652 18.5 10C18.5 9.73478 18.3946 9.48043 18.2071 9.29289C18.0196 9.10536 17.7652 9 17.5 9H11.5V3C11.5 2.73478 11.3946 2.48043 11.2071 2.29289C11.0196 2.10536 10.7652 2 10.5 2Z"
                  fill="#12B019"
                />
              </Svg>
            ) : mode == 'learning' ? (
              <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <Path
                  d="M4.5 10L8.5 14L16 5.5"
                  stroke="white"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </Svg>
            ) : (
              <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <Path
                  d="M14.1667 2.7513C10.9167 0.917969 6.91675 1.5013 4.25008 3.91797V2.5013C4.25008 2.0013 3.91675 1.66797 3.41675 1.66797C2.91675 1.66797 2.58341 2.0013 2.58341 2.5013V6.2513C2.58341 6.7513 2.91675 7.08464 3.41675 7.08464H7.16675C7.66675 7.08464 8.00008 6.7513 8.00008 6.2513C8.00008 5.7513 7.66675 5.41797 7.16675 5.41797H5.16675C6.41675 4.08464 8.16675 3.33464 10.0001 3.33464C13.6667 3.33464 16.6667 6.33464 16.6667 10.0013C16.6667 10.5013 17.0001 10.8346 17.5001 10.8346C18.0001 10.8346 18.3334 10.5013 18.3334 10.0013C18.3334 7.0013 16.7501 4.2513 14.1667 2.7513ZM16.5834 12.918H12.8334C12.3334 12.918 12.0001 13.2513 12.0001 13.7513C12.0001 14.2513 12.3334 14.5846 12.8334 14.5846H14.8334C13.5834 15.918 11.8334 16.668 10.0001 16.668C6.33341 16.668 3.33341 13.668 3.33341 10.0013C3.33341 9.5013 3.00008 9.16797 2.50008 9.16797C2.00008 9.16797 1.66675 9.5013 1.66675 10.0013C1.66675 14.5846 5.41675 18.3346 10.0001 18.3346C12.1667 18.3346 14.1667 17.5013 15.7501 16.0013V17.5013C15.7501 18.0013 16.0834 18.3346 16.5834 18.3346C17.0834 18.3346 17.4167 18.0013 17.4167 17.5013V13.7513C17.4167 13.2513 17.0001 12.918 16.5834 12.918Z"
                  fill="#FF5858"
                />
              </Svg>
            )}

            <Text
              style={{
                fontSize: 16,
                lineHeight: 20,
                fontFamily: 'Inter-Regular',
                color:
                  mode == 'skipped'
                    ? '#12B019'
                    : mode == 'learning'
                    ? '#FFF'
                    : '#FF5858',
              }}>
              {mode == 'skipped'
                ? 'Учить слово'
                : mode == 'learning'
                ? 'Пометить как выучено'
                : 'Сбросить прогресс'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  });

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        {words.length > 0 && (
          <Carousel
            loop
            ref={carouselRef}
            width={width}
            height={height}
            data={words}
            onSnapToItem={index => setIndex(index + 1)}
            renderItem={({index}) => <Card index={index} />}
          />
        )}
        {words.length > 0 ? (
          <View
            style={{
              flexDirection: 'row',
              width: '90%',
              paddingVertical: 16,
              bottom: 0,
              position: 'absolute',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => carouselRef.current?.prev()}
              style={{
                width: 115,
                borderRadius: 16,
                borderWidth: 1,
                alignItems: 'center',
                paddingVertical: 18,
                backgroundColor: '#22252E',
                borderColor: '#313843',
              }}>
              <Text
                style={{
                  color: 'white',
                  fontFamily: 'Inter-Bold',
                  fontSize: 16,
                  lineHeight: 20,
                }}>
                Назад
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 16,
                lineHeight: 20,
                fontFamily: 'Inter-Regular',
                color: 'rgba(255, 255, 255, 0.30)',
              }}>
              {index} / {words.length}
            </Text>

            <TouchableOpacity
              onPress={() => carouselRef.current?.next()}
              style={{
                width: 115,
                borderRadius: 16,
                borderWidth: 1,
                alignItems: 'center',
                paddingVertical: 18,
                backgroundColor: '#22252E',
                borderColor: '#313843',
              }}>
              <Text
                style={{
                  color: 'white',
                  fontFamily: 'Inter-Bold',
                  fontSize: 16,
                  lineHeight: 20,
                }}>
                Вперёд
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{height: '100%', width: '100%', alignItems: 'center'}}>
            <Image
              style={{width: 160, height: 160, marginTop: 68}}
              source={require('../src/empty.png')}
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
              {mode == 'skipped'
                ? 'Нет пропущенных слов'
                : mode == 'learning'
                ? 'Нет слов для повторения'
                : 'Нет выученных слов'}
            </Text>
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                marginTop: 12,
                width: '80%',
                textAlign: 'center',
                fontSize: 16,
                lineHeight: 20,
                color: 'rgba(255, 255, 255, 0.50)',
              }}>
              {mode == 'skipped'
                ? 'У вас пока нет ни одного пропущенного слова. Отметьте знакомые слова как “Пропустить”, чтобы они были здесь.'
                : mode == 'learning'
                ? 'У вас пока нет ни одного слова для повторения. Отметьте знакомые слова как “Учить”, чтобы они были здесь.'
                : 'У вас пока нет ни одного выученного слова. Повторите новое слово все разы, чтобы оно здесь отобразилось.'}
            </Text>

            <View
              style={{
                width: '100%',
                position: 'absolute',
                bottom: 40,
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
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
                  Закрыть
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    paddingTop: 10,
  },
  header: {
    width: '90%',
    alignItems: 'center',
    paddingVertical: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    borderRadius: 10,
    backgroundColor: '#22252E',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 6,
  },
  RepeatText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  word: {
    fontFamily: 'Inter-SemiBold',
    color: '#FFF',
    width: '90%',
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 36,
    marginTop: 12,
  },
  showTranslateButton: {
    alignSelf: 'center',
    borderRadius: 20,
    backgroundColor: '#22252E',
    borderWidth: 1,
    borderColor: '#313843',
    width: '90%',
    height: 160,
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Overview;
