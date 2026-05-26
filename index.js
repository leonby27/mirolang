/**
 * @format
 */

// Init i18n BEFORE any component module that imports `useTranslation`
// evaluates — otherwise react-i18next logs a NO_I18NEXT_INSTANCE warning
// for every component that grabs the hook on first render.
import './src/i18n';

import {AppRegistry, TouchableOpacity} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Soften press feedback. React Native's default activeOpacity is 0.2
// (drop of 0.8 from full opacity), which strobes the UI on every tap.
// 0.85 keeps a faint hint of press without anything visibly fading.
// Individual TouchableOpacity instances can override this prop locally.
TouchableOpacity.defaultProps = {
  ...(TouchableOpacity.defaultProps || {}),
  activeOpacity: 0.85,
};

AppRegistry.registerComponent(appName, () => App);
