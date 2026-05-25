export default {
  "expo": {
    "name": "MiroLang",
    "slug": "mirolang",
    "version": "2.3.2",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "plugins": [
      "@react-native-google-signin/google-signin",
      "expo-apple-authentication",
      [
      'expo-build-properties',
        {
          ios: {
            deploymentTarget: '16.4'
          }
        }
      ]
    ],
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.mirolang",
      "googleServicesFile": process.env.GOOGLE_SERVICES_INFOPLIST,
      "usesAppleSignIn": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.mirolang",
      "versionCode": 42,
      "googleServicesFile": process.env.GOOGLE_SERVICES_JSON,
    },
    "androidNavigationBar": {
      "barStyle": "light-content",
      "backgroundColor": "#1C1F26"
    },
    "androidStatusBar": {
      "backgroundColor": "#000000",
      "barStyle": "light-content"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "5b062b01-a4e9-40fc-9117-668050bc154b"
      }
    },
    "runtimeVersion": {
      "policy": "appVersion"
    },
    "updates": {
      "url": "https://u.expo.dev/5b062b01-a4e9-40fc-9117-668050bc154b"
    }
  }
}