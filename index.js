/**
 * @format
 */

// Init i18n BEFORE any component module that imports `useTranslation`
// evaluates — otherwise react-i18next logs a NO_I18NEXT_INSTANCE warning
// for every component that grabs the hook on first render.
import './src/i18n';

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
