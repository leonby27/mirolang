import React, {useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Swiper from 'react-native-swiper';
import Svg, {Path, Rect} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {height, width} = Dimensions.get('window');

function SwiperComponent({setShowOnbording, getProgress}) {
  const [currentIndex, setIndex] = useState(0);

  const removeOnbording = async () => {
    setShowOnbording(false);
    getProgress();
    await AsyncStorage.setItem('showOnbording', 'not showing');
  };

  const handleIndexChanged = index => {
    setIndex(index);
  };

  const [newIndex, setNewIndex] = useState(0);
  const swiperRef = useRef(null);

  useEffect(() => {
    if (swiperRef.current && newIndex !== undefined) {
      swiperRef.current.scrollTo(newIndex);
    }
  }, [newIndex]);

  const handleButtonClick = index => {
    setNewIndex(index);
  };

  const onbordingData = [
    {
      id: 0,
      mainText: 'Выучи английский\nвсего за 25 уровней',
      text: '6,500 слов (98% всей лексики) разбиты на\n25 уровней сложности.',
      buttonText: 'Продолжить',
    },
    {
      id: 1,
      mainText: 'Начни учить с самых\nпопулярных слов',
      text: 'Уровни разбиты по частоте употребления,\nначиная с самого простого.',
      buttonText: 'Отлично',
    },
    {
      id: 2,
      mainText: 'Гибко управляй\nсвоим прогрессом',
      text: 'Пропускай знакомые слова, учи новые,\nвспоминай забытые.',
      buttonText: 'То, что нужно!',
    },
    {
      id: 3,
      mainText: 'Попробуйте бесплатно\nпрямо сейчас ',
      text: 'С MiroLang вы увеличите свой словарный\nзапас в разы быстрее!',
      buttonText: 'Начать',
    },
  ];

  const onboardingIcons = [
    {
      id: 0,
      icon: require('../src/onbording1.png'),
    },
    {
      id: 1,
      icon: require('../src/onbording2.png'),
    },
    {
      id: 2,
      icon: require('../src/onbording3.png'),
    },
    {
      id: 3,
      icon: require('../src/onbording4.png'),
    },
  ];

  const {mainText, text, buttonText} = onbordingData?.[currentIndex];

  return (
    <View style={{flex: 1, backgroundColor: '#000000'}}>
      <View
        style={{
          flexDirection: 'row',
          marginTop: '13%',
          marginHorizontal: 15,
          backgroundColor: '#000000',
        }}>
        <View
          style={{
            flex: 1,
            height: 2,
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            marginHorizontal: 5,
            border: 2,
          }}
        />
        <View
          style={{
            flex: 1,
            height: 2,
            width: '100%',
            backgroundColor:
              currentIndex === 1 || currentIndex === 2 || currentIndex === 3
                ? 'rgba(255, 255, 255, 1)'
                : 'rgba(255, 255, 255, 0.2)',
            marginHorizontal: 5,
            border: 2,
          }}
        />
        <View
          style={{
            flex: 1,
            height: 2,
            width: '100%',
            backgroundColor:
              currentIndex === 2 || currentIndex === 3
                ? 'rgba(255, 255, 255, 1)'
                : 'rgba(255, 255, 255, 0.2)',
            marginHorizontal: 5,
            border: 2,
          }}
        />
        <View
          style={{
            flex: 1,
            height: 2,
            width: '100%',
            backgroundColor:
              currentIndex === 3
                ? 'rgba(255, 255, 255, 1)'
                : 'rgba(255, 255, 255, 0.2)',
            marginHorizontal: 5,
            border: 2,
          }}
        />
      </View>
      <TouchableOpacity
        onPress={removeOnbording}
        style={{alignItems: 'flex-end', margin: 20}}>
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

      <Swiper
        loop={false}
        ref={swiperRef}
        showsPagination={false}
        onIndexChanged={handleIndexChanged}>
        {onboardingIcons.map(icon => (
          <View key={icon.id}>
            <Image
              style={{
                height: width - 20,

                width: width - 20,
                alignSelf: 'center',
                marginTop: '3%',
              }}
              source={icon.icon}
            />
          </View>
        ))}
      </Swiper>
      <Text
        style={{
          color: 'white',
          fontFamily: 'Inter-Regular',
          textAlign: 'center',
          fontSize: 28,
          fontWeight: 700,
          lineHeight: 36,
          marginTop: '9%',
        }}>
        {mainText}
      </Text>
      <Text
        style={{
          color: 'rgba(255, 255, 255, 0.5)',
          fontFamily: 'Inter-Regular',
          textAlign: 'center',
          fontSize: 16,
          fontWeight: 400,
          lineHeight: 20,
          paddingTop: 20,
        }}>
        {text}
      </Text>
      <TouchableOpacity
        onPress={() =>
          currentIndex === 3
            ? removeOnbording()
            : handleButtonClick(currentIndex + 1)
        }
        style={{
          marginTop: '11%',
          borderRadius: 12,
          backgroundColor: '#F1CC06',
          padding: 14,
          alignItems: 'center',
          width: '90%',
          justifyContent: 'flex-end',
          marginHorizontal: 20,
          marginBottom: '20%',
        }}>
        <Text
          style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 16,
            lineHeight: 20,
            color: '#14161B',
          }}>
          {buttonText}
        </Text>
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
  centeredView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalView: {
    width: '100%',
    borderRadius: 20,
  },
});

export default SwiperComponent;
