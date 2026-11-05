/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { enableScreens } from 'react-native-screens';
import App from './App';
import { name as appName } from './app.json';

enableScreens();

// Import Reactotron config for debugging
if (__DEV__) {
    import('./src/utils/reactotronConfig');
}

AppRegistry.registerComponent(appName, () => App);
