import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Book } from '../data/books';

export type MainTabParamList = {
  Home: undefined;
  Library: undefined;
  Upload: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  BookReader: { book: Book };
  TopRatedBooks: undefined;
  Notifications: undefined;
  Login: undefined;
  Signup: undefined;
  APITest: undefined;
  UploadBook: undefined;
};
