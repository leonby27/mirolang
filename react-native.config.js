module.exports = {
  dependencies: {
    'react-native-flipper': {
      platforms: {
        ios: null,
      },
    },
  },
  project: {
    name: 'MiroLang',
    slug: 'mirolang',
    version: '2.3.2',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },
    assetBundlePatterns: ['**/*'],
    ios: {},
    android: {},
    androidNavigationBar: {
      barStyle: 'light-content',
      backgroundColor: '#1C1F26',
    },
    androidStatusBar: {
      backgroundColor: '#000000',
      barStyle: 'light-content',
    },
  },
  assets: ['./src/fonts'],
};
