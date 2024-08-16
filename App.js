import {useEffect} from 'react';
import {View, Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Svg, {Path, G, ClipPath, Rect, Defs} from 'react-native-svg';

import AccountMain from './screens/AccountMain';
import HistoryMain from './screens/HistoryMain';
import LevelsMain from './screens/LevelsMain';
import Prestart from './screens/Prestart';
import SplashScreen from 'react-native-splash-screen';
import Login from './screens/Login';
import HistoryScreen from './screens/HistoryScreen';
import Overview from './screens/Overview';
import LearnScreen from './screens/Learn';
import AccountSettings from './screens/AccountSettings';
import Support from './screens/Support';

const Stack = createNativeStackNavigator();
const BottomTab = createBottomTabNavigator();
const stackOptions = {
  headerShadowVisible: false,
  headerTitleAlign: 'center',
  headerTintColor: Platform.OS == 'android' ? 'white' : 'default',
  headerTitleStyle: {
    color: 'white',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Inter-Bold',
  },
  headerStyle: {
    backgroundColor: '#000000',
  },
};

function Levels() {
  return (
    <View style={{flex: 1, backgroundColor: '#000000'}}>
      <Stack.Navigator>
        <Stack.Screen
          options={{headerShown: false, title: 'Уровни'}}
          name="LevelsMain"
          component={LevelsMain}
        />
        <Stack.Screen
          options={({route}) => ({
            ...stackOptions,
            title: route.params.title,
            headerBackTitle: 'Назад',
            headerBackTitleStyle: {fontSize: 18, fontFamily: 'Inter-Regular'},
          })}
          name="Prestart"
          component={Prestart}
        />
        <Stack.Screen
          options={{
            ...stackOptions,
            headerTitleAlign: 'center',
            title: 'Войти в аккаунт',
          }}
          name="Login"
          component={Login}
        />
      </Stack.Navigator>
    </View>
  );
}

function History() {
  return (
    <View style={{flex: 1, backgroundColor: '#000000'}}>
      <Stack.Navigator>
        <Stack.Screen
          options={{...stackOptions, title: 'История'}}
          name="HistoryMain"
          component={HistoryMain}
        />
        <Stack.Screen
          options={({route}) => ({...stackOptions, title: route.params.title})}
          name="HistoryScreen"
          component={HistoryScreen}
        />
      </Stack.Navigator>
    </View>
  );
}

function Account() {
  return (
    <View style={{flex: 1, backgroundColor: '#000000'}}>
      <Stack.Navigator>
        <Stack.Screen
          options={{
            ...stackOptions,
            headerTitleAlign: 'left',
            title: 'Аккаунт',
          }}
          name="AccountMain"
          component={AccountMain}
        />
        <Stack.Screen
          options={{
            ...stackOptions,
            headerTitleAlign: 'center',
            title: 'Войти в аккаунт',
          }}
          name="Login"
          component={Login}
        />
        <Stack.Screen
          options={{
            ...stackOptions,
            headerTitleAlign: 'center',
            title: 'Настройки аккаунта',
          }}
          name="AccountSettings"
          component={AccountSettings}
        />
        <Stack.Screen
          options={{
            ...stackOptions,
            headerTitleAlign: 'center',
            title: 'Поддержка',
          }}
          name="Support"
          component={Support}
        />
      </Stack.Navigator>
    </View>
  );
}

function ScreensWihBottomTab() {
  return (
    <BottomTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#1D2026',
          backgroundColor: '#14161B',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          lineHeight: 12,
          fontFamily: 'Inter-Regular',
        },
        tabBarActiveTintColor: '#F1CC06',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
      }}>
      <BottomTab.Screen
        options={{
          title: 'Уровни',
          tabBarIcon: ({color}) => (
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path
                d="M20.4374 4.30183L18.299 4C18.3459 4.20027 18.3698 4.40524 18.3703 4.61095V17.8133C18.3696 18.5375 18.0825 19.2318 17.5721 19.7439C17.0617 20.256 16.3697 20.544 15.6479 20.5448H15L18.1012 20.9823C18.3373 21.0156 18.5775 21.0019 18.8083 20.942C19.0391 20.8821 19.2558 20.7772 19.4462 20.6332C19.6366 20.4893 19.7968 20.3091 19.9177 20.103C20.0387 19.897 20.118 19.669 20.1511 19.4321L21.9824 6.35821C22.0493 5.87996 21.9241 5.39463 21.6344 5.00899C21.3446 4.62335 20.9141 4.36898 20.4374 4.30183Z"
                fill={color}
              />
              <Path
                d="M16.112 3H13C13.299 3.20286 13.5514 3.45784 13.7425 3.7503C13.9337 4.04276 14.0599 4.36694 14.1139 4.70422L16.0176 17.1228C16.1208 17.7852 15.9388 18.4583 15.5101 19H16.112C16.6127 19 17.0929 18.8178 17.447 18.4934C17.8011 18.169 18 17.729 18 17.2703V4.72973C18 4.27098 17.8011 3.83101 17.447 3.50663C17.0929 3.18224 16.6127 3 16.112 3Z"
                fill={color}
              />
              <Path
                d="M14.9831 17.9389L13.2257 5.49065C13.161 5.03569 12.9174 4.62492 12.5487 4.34858C12.1799 4.07225 11.716 3.95294 11.2589 4.01687L3.4974 5.10097C3.04038 5.16542 2.62775 5.40784 2.35016 5.77497C2.07257 6.14209 1.95273 6.60389 2.01695 7.05893L3.77215 19.5072C3.80395 19.7327 3.88007 19.9497 3.99614 20.146C4.11222 20.3422 4.266 20.5137 4.44868 20.6508C4.63136 20.7879 4.83937 20.8877 5.06084 20.9448C5.28231 21.0018 5.51289 21.0148 5.73941 20.9831L13.5009 19.8969C13.9582 19.8328 14.3713 19.5906 14.6492 19.2234C14.9272 18.8562 15.0473 18.3942 14.9831 17.9389Z"
                fill={color}
              />
            </Svg>
          ),
        }}
        name="Home"
        component={Levels}
      />
      <BottomTab.Screen
        options={{
          title: 'История',
          tabBarIcon: ({color}) => (
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path
                d="M16.669 2C20.07 2 21.99 3.929 22 7.33V16.67C22 20.07 20.07 22 16.669 22H7.33C3.929 22 2 20.07 2 16.67V7.33C2 3.929 3.929 2 7.33 2H16.669ZM12.5 6.13C12.219 5.96 11.879 5.96 11.61 6.13C11.339 6.299 11.19 6.61 11.219 6.92V17.11C11.27 17.54 11.629 17.86 12.049 17.86C12.48 17.86 12.839 17.54 12.879 17.11V6.92C12.919 6.61 12.77 6.299 12.5 6.13ZM7.83 9.41C7.56 9.24 7.219 9.24 6.95 9.41C6.679 9.58 6.53 9.889 6.56 10.2V17.11C6.599 17.54 6.959 17.86 7.389 17.86C7.82 17.86 8.179 17.54 8.219 17.11V10.2C8.25 9.889 8.099 9.58 7.83 9.41ZM17.089 13.04C16.82 12.87 16.48 12.87 16.2 13.04C15.929 13.21 15.78 13.509 15.82 13.83V17.11C15.86 17.54 16.219 17.86 16.65 17.86C17.07 17.86 17.429 17.54 17.48 17.11V13.83C17.509 13.509 17.36 13.21 17.089 13.04Z"
                fill={color}
              />
            </Svg>
          ),
        }}
        name="Settings"
        component={History}
      />
      <BottomTab.Screen
        options={{
          title: 'Аккаунт',
          tabBarIcon: ({color}) => (
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <G clip-path="url(#clip0_2201_1255)">
                <Path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C10.8119 19.2 9.64218 18.906 8.59528 18.3441C7.54837 17.7823 6.65678 16.9701 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C17.3432 16.9701 16.4516 17.7823 15.4047 18.3441C14.3578 18.906 13.1881 19.2 12 19.2Z"
                  fill={color}
                />
              </G>
              <Defs>
                <ClipPath id="clip0_2201_1255">
                  <Rect width="24" height="24" fill="white" />
                </ClipPath>
              </Defs>
            </Svg>
          ),
        }}
        name="Profile"
        component={Account}
      />
    </BottomTab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <View style={{flex: 1, backgroundColor: '#000000'}}>
      <NavigationContainer style={{backgroundColor: '#000000'}}>
        <GestureHandlerRootView
          style={{flex: 1, marginTop: Platform.OS == 'ios'}}>
          <BottomSheetModalProvider style={{flex: 1}}>
            <Stack.Navigator>
              <Stack.Screen
                options={{headerShown: false}}
                name="ScreensWithBottomTab"
                component={ScreensWihBottomTab}
              />
              <Stack.Screen
                options={{
                  ...stackOptions,
                  headerTitle: '',
                  headerBackTitle: 'Назад',
                  headerBackTitleStyle: {
                    fontSize: 18,
                    fontFamily: 'Inter-Regular',
                  },
                }}
                name="LearnScreen"
                component={LearnScreen}
              />
              <Stack.Screen
                options={{
                  ...stackOptions,
                  headerTitle: '',
                  headerBackTitle: 'Назад',
                  headerBackTitleStyle: {
                    fontSize: 18,
                    fontFamily: 'Inter-Regular',
                  },
                }}
                name="Overview"
                component={Overview}
              />
            </Stack.Navigator>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </NavigationContainer>
    </View>
  );
}
