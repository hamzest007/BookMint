import { RootNavigator } from './src/navigations/RootNavigator';
import { BookProvider } from './src/context/BookContext';
import { AuthProvider } from './src/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <BookProvider>
          <RootNavigator />
        </BookProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;