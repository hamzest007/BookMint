import Reactotron from 'reactotron-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

if (__DEV__) {
  const tron = Reactotron.setAsyncStorageHandler(AsyncStorage)
    .configure({
      name: 'BookMint App',
      host: 'localhost',
    })
    .useReactNative()
    .connect();

  tron.clear();

  (console as any).tron = tron;
}

export default Reactotron;
