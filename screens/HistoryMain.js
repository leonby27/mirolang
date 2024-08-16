import React, { useState, useEffect } from 'react';
import { Text, View, FlatList, StyleSheet, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg'
import AsyncStorage from '@react-native-async-storage/async-storage';
import data from '../src/data';

function HistoryMain({navigation}) {

  const [wordsCount, setWordsCount] = useState({
    'learned': 0,
    'learning' : 0,
    'skipped' : 0
  })

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      getProgress()
    });
    return focusHandler;
  }, [navigation]);

  const normalizeData = (progress) => {
    var wordsCountUpdated = {
      'learned': 0,
      'learning' : 0,
      'skipped' : 0
    }
    data.forEach((category) => {
      category.data.forEach((level) => {
          if (progress.data[level.id]) {
              level.words.map((word) => {
                if(progress.data?.[level.id]?.[word.id]){
                  if(progress.data[level.id]?.[word.id]?.status === 6){
                    wordsCountUpdated.learned += 1
                  }else if(progress.data[level.id]?.[word.id]?.status > 0 && progress.data[level.id]?.[word.id]?.status < 6){
                    wordsCountUpdated.learning += 1
                  }else if(progress.data[level.id]?.[word.id]?.status === 7){
                    wordsCountUpdated.skipped += 1
                  }
                }
              })
          }
      });
    });
    setWordsCount(wordsCountUpdated)
  }

  const getProgress = async() => {
    try {
      var progress = await AsyncStorage.getItem('progress');
      if (progress !== null) {
        progress = JSON.parse(progress);
        normalizeData(progress)
      }else{
        normalizeData({'user': null, data: {}})
      }
    } catch (e) {
      console.warn(e);
    } 
  }

  const content = [
    {
      id: 1,
      title: 'Выученные',
      description: 'Выполнены все повторения',
      image: require('../src/learned.png'),
      state: 'learned'
    },
    {
      id: 2,
      title: 'Учу сейчас',
      description: 'Ещё остались повторения',
      image: require('../src/learning.png'),
      state: 'learning'
    },
    {
      id: 3,
      title: 'Пропущено',
      description: 'Вы пропустили эти слова',
      image: require('../src/skipped.png'),
      state: 'skipped'
    }
  ]
    return (
      <SafeAreaView style={styles.container}>
        <FlatList 
          data={content}
          style={{width: '90%', marginTop: 10}}
          contentContainerStyle={{gap: 8}}
          keyExtractor={item=>item.id}
          renderItem={({item}) => (
            <TouchableOpacity onPress={() => navigation.push("HistoryScreen", {title: item.title, mode: item.state})} style={styles.button}>
              <Image style={{width: 48, height: 48}} source={item.image} />
              <View style={{gap: 2}}>
                <Text style={styles.title}>{item.title} · {wordsCount[item.state].toString()}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
              <Svg style={{position: 'absolute', right: 12}} width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M16.4989 12.0165C16.4996 12.3662 16.3776 12.7052 16.1539 12.9745L10.1539 20.4592C9.89934 20.7649 9.53347 20.9572 9.13683 20.9937C8.74019 21.0302 8.34527 20.9079 8.03895 20.6538C7.73262 20.3997 7.53999 20.0346 7.50342 19.6388C7.46685 19.243 7.58934 18.8488 7.84395 18.5431L13.0639 12.0165L8.08395 5.48979C7.95935 5.33667 7.8663 5.16049 7.81015 4.97136C7.75401 4.78224 7.73587 4.58391 7.75677 4.38777C7.77768 4.19163 7.83723 4.00154 7.93199 3.82844C8.02675 3.65534 8.15486 3.50263 8.30895 3.3791C8.46318 3.24201 8.64412 3.13819 8.84043 3.07413C9.03674 3.01007 9.24419 2.98716 9.44979 3.00684C9.65538 3.02651 9.85469 3.08834 10.0352 3.18846C10.2158 3.28858 10.3736 3.42484 10.4989 3.58868L16.2439 11.0734C16.4322 11.3505 16.522 11.6825 16.4989 12.0165Z" fill="rgba(255, 255, 255, 0.2)"/>
              </Svg>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center', 
    backgroundColor: '#000000'
  },
  button: {
    alignSelf: 'center', 
    gap: 12, 
    width: '100%', 
    alignItems: 'center',
    padding: 16, 
    backgroundColor: '#1C1F26',
    flexDirection: 'row', 
    borderRadius: 16
  },
  title: {
    color: 'white', 
    fontSize: 16, 
    lineHeight: 20, 
    fontFamily: 'Inter-Bold'
  },
  description: {
    color: 'rgba(255, 255, 255, 0.50))', 
    fontSize: 14, 
    lineHeight: 16, 
    fontFamily: 'Inter-Regular'
  }
})

export default HistoryMain