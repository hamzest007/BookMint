import { Colors, Gradients } from './tokens';

export type ThemeMode = 'light' | 'dark';

export type AppTheme = {
  mode: ThemeMode;
  gradients: {
    auth: readonly string[];
    darkShade: readonly string[];
    glow: readonly string[];
  };
  colors: {
    green: string;
    gold: string;
    background: string;
    white: string;
    card: string;
    text: string;
    secondary: string;
    mutedText: string;
    border: string;
    primary: string;
    danger: string;
    success: string;
    pending: string;
    completed: string;
    completedBorder: string;
    canceled: string;
    canceledBorder: string;
    delete: string;
    ratingStar: string;
    icon: string;
    black: string;
    gray500: string;
    gray700: string;
    primaryAlt: string;
    primaryAltAlpha25: string;
    secondaryDeep: string;
    overlayBlack35: string;
    overlayBlack50: string;
    overlayBlack90: string;
    whiteAlpha25: string;
    whiteAlpha30: string;
    tabInactiveText: string;
    panelLight: string;
    panelDark: string;
    borderLight: string;
    danger500: string;
    dangerPure: string;
    addressBadge: string;
    addressBadgeBorder: string;
    aboutTopFade: string;
    favoritePink: string;
  };
  fonts: {
    light: string;
    regular: string;
    medium: string;
    semiBold: string;
    bold: string;
  };
};

const sharedGradients = {
  auth: Gradients.auth,
  darkShade: Gradients.darkShade,
  glow: Gradients.glow,
};

const sharedColors = {
  green: Colors.green,
  gold: Colors.gold,
  white: Colors.white,
  card: Colors.gray100,
  text: Colors.secondary,
  secondary: Colors.secondary,
  mutedText: Colors.gray700,
  border: Colors.gray500,
  primary: Colors.primary,
  danger: Colors.canceled,
  success: Colors.completed,
  pending: Colors.pending,
  completed: Colors.completed,
  completedBorder: Colors.completedBorder,
  canceled: Colors.canceled,
  canceledBorder: Colors.canceledBorder,
  delete: Colors.delete,
  ratingStar: Colors.ratingStar,
  icon: Colors.gray500,
  black: Colors.black,
  gray500: Colors.gray500,
  gray700: Colors.gray700,
  primaryAlt: Colors.primaryAlt,
  primaryAltAlpha25: Colors.primaryAltAlpha25,
  secondaryDeep: Colors.secondaryDeep,
  overlayBlack35: Colors.overlayBlack35,
  overlayBlack50: Colors.overlayBlack50,
  overlayBlack90: Colors.overlayBlack90,
  whiteAlpha25: Colors.whiteAlpha25,
  whiteAlpha30: Colors.whiteAlpha30,
  tabInactiveText: Colors.tabInactiveText,
  panelLight: Colors.panelLight,
  panelDark: Colors.panelDark,
  borderLight: Colors.borderLight,
  danger500: Colors.danger500,
  dangerPure: Colors.dangerPure,
  addressBadge: Colors.addressBadge,
  addressBadgeBorder: Colors.addressBadgeBorder,
  aboutTopFade: Colors.aboutTopFade,
  favoritePink: Colors.favoritePink,
};

const sharedFonts = {
  light: 'Inter-Light',
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
};

export const lightTheme: AppTheme = {
  mode: 'light',
  gradients: sharedGradients,
  colors: { ...sharedColors, background: Colors.gray100 },
  fonts: sharedFonts,
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  gradients: sharedGradients,
  colors: { ...sharedColors, background: Colors.secondary },
  fonts: sharedFonts,
};
