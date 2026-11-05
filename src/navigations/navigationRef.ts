import type { RootStackParamList } from './types';
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();
