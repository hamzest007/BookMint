import scale from '../utils/scale';

export const Colors = {
  // Primary colors
  primary: '#002045',
  'on-primary': '#ffffff',
  'primary-container': '#1a365d',
  'on-primary-container': '#86a0cd',
  'primary-fixed': '#d6e3ff',
  'on-primary-fixed': '#001b3c',
  'primary-fixed-dim': '#adc7f7',
  'inverse-primary': '#adc7f7',

  // Secondary colors
  secondary: '#775a19',
  'on-secondary': '#ffffff',
  'secondary-container': '#fed488',
  'on-secondary-container': '#785a1a',
  'secondary-fixed': '#ffdea5',
  'on-secondary-fixed': '#261900',
  'on-secondary-fixed-variant': '#5d4201',
  'secondary-fixed-dim': '#e9c176',

  // Tertiary colors
  tertiary: '#122234',
  'on-tertiary': '#ffffff',
  'tertiary-container': '#28374a',
  'on-tertiary-container': '#91a0b7',
  'tertiary-fixed': '#d4e4fc',
  'on-tertiary-fixed': '#0d1c2e',
  'on-tertiary-fixed-variant': '#39485c',
  'tertiary-fixed-dim': '#b8c8e0',

  // Error colors
  error: '#ba1a1a',
  'on-error': '#ffffff',
  'error-container': '#ffdad6',
  'on-error-container': '#93000a',

  // Surface colors
  surface: '#fbf9f4',
  'on-surface': '#1b1c19',
  'surface-variant': '#e4e2dd',
  'on-surface-variant': '#43474e',
  'surface-container': '#f0eee9',
  'surface-container-high': '#eae8e3',
  'surface-container-highest': '#e4e2dd',
  'surface-container-low': '#f5f3ee',
  'surface-container-lowest': '#ffffff',
  'surface-bright': '#fbf9f4',
  'surface-dim': '#dbdad5',
  'surface-tint': '#455f88',

  // Background colors
  background: '#fbf9f4',
  'on-background': '#1b1c19',

  // Outline colors
  outline: '#74777f',
  'outline-variant': '#c4c6cf',

  // Inverse colors
  'inverse-surface': '#30312e',
  'inverse-on-surface': '#f2f1ec',

  // Legacy colors (for backward compatibility)
  Natural: '#F9F7F2',
  green: '#4CAF50',
  gold: '#C5A059',
  white: '#ffffff',
  gray100: '#fbf9f4',
  gray500: '#74777f',
  gray700: '#43474e',
  black: '#1b1c19',
  canceled: '#ba1a1a',
  canceledBorder: '#d32f2f',
  completed: '#4CAF50',
  completedBorder: '#388E3C',
  pending: '#FF9800',
  delete: '#ba1a1a',
  ratingStar: '#FFC107',
  primaryAlt: '#455f88',
  primaryAltAlpha25: 'rgba(69, 95, 136, 0.25)',
  secondaryDeep: '#5d4201',
  overlayBlack35: 'rgba(0, 0, 0, 0.35)',
  overlayBlack50: 'rgba(0, 0, 0, 0.5)',
  overlayBlack90: 'rgba(0, 0, 0, 0.9)',
  whiteAlpha25: 'rgba(255, 255, 255, 0.25)',
  whiteAlpha30: 'rgba(255, 255, 255, 0.3)',
  tabInactiveText: '#74777f',
  panelLight: '#ffffff',
  panelDark: '#1b1c19',
  borderLight: '#e4e2dd',
  danger500: '#ba1a1a',
  dangerPure: '#ba1a1a',
  addressBadge: '#e4e2dd',
  addressBadgeBorder: '#c4c6cf',
  aboutTopFade: 'linear-gradient(180deg, rgba(251, 249, 244, 0) 0%, rgba(251, 249, 244, 1) 100%)',
  favoritePink: '#E91E63',
};

export const Gradients = {
  auth: ['#002045', '#1a365d'] as const,
  darkShade: ['rgba(0, 32, 69, 0.8)', 'rgba(0, 32, 69, 0.0)'] as const,
  glow: ['rgba(197, 160, 89, 0.3)', 'rgba(197, 160, 89, 0.0)'] as const,
};

export const Spacing = {
  // Base unit
  unit: scale.mWidth(8),

  // Stack spacing (vertical spacing between elements)
  'stack-sm': scale.mWidth(12),
  'stack-md': scale.mWidth(24),
  'stack-lg': scale.mWidth(48),

  // Gutter spacing (horizontal spacing between grid items)
  gutter: scale.mWidth(24),

  // Margin spacing (padding around content)
  'margin-mobile': scale.mWidth(20),
  'margin-desktop': scale.mWidth(64),

  // Container max width
  'container-max': 1280,

  // Legacy spacing (for backward compatibility)
  xs: scale.mWidth(5),
  sm: scale.mWidth(10),
  md: scale.mWidth(15),
  lg: scale.mWidth(20),
  xl: scale.mWidth(30),
};

export type TypographyLocale = 'en' | 'ar';

export type FontFamily = {
  light: string;
  regular: string;
  medium: string;
  semibold: string;
  bold: string;
};

const englishFamily: FontFamily = {
  light: 'Inter-Light',
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
};

const displayFamily: FontFamily = {
  light: 'PlayfairDisplay-Light',
  regular: 'PlayfairDisplay-Regular',
  medium: 'PlayfairDisplay-Medium',
  semibold: 'PlayfairDisplay-SemiBold',
  bold: 'PlayfairDisplay-Bold',
};

const arabicFamily: FontFamily = {
  light: 'NotoNaskhArabic-Light',
  regular: 'NotoNaskhArabic-Regular',
  medium: 'NotoNaskhArabic-Medium',
  semibold: 'NotoNaskhArabic-SemiBold',
  bold: 'NotoNaskhArabic-Bold',
};

let activeTypographyLocale: TypographyLocale = 'en';

export const setActiveTypographyLocale = (locale: TypographyLocale) => {
  activeTypographyLocale = locale;
};

export const getFontFamily = (locale: TypographyLocale): FontFamily =>
  locale === 'ar' ? arabicFamily : englishFamily;

export const Typography = {
  familyEnglish: englishFamily,
  familyArabic: arabicFamily,
  familyDisplay: displayFamily,
  get family(): FontFamily {
    return getFontFamily(activeTypographyLocale);
  },
  size: {
    // Label sizes
    'label-caps': scale.font(12),

    // Body sizes
    'body-md': scale.font(16),
    'body-lg': scale.font(18),

    // Title sizes
    'title-sm': scale.font(20),

    // Headline sizes
    'headline-md-mobile': scale.font(24),
    'headline-md': scale.font(32),

    // Display sizes
    'display-lg-mobile': scale.font(32),
    'display-lg': scale.font(48),

    // Legacy sizes (for backward compatibility)
    caption: scale.font(12),
    body: scale.font(14),
    bodyMedium: scale.font(16),
    h4: scale.font(18),
    h3: scale.font(20),
    h2: scale.font(24),
    h1: scale.font(28),
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  } as const,
  lineHeight: {
    tight: 1.2,
    normal: 1.3,
    relaxed: 1.4,
    loose: 1.6,
    extraLoose: 1.7,
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '-0.01em',
    wide: '0.1em',
  },
};

export const BorderRadius = {
  xs: scale.mWidth(2),
  sm: scale.mWidth(4),
  md: scale.mWidth(6),
  lg: scale.mWidth(8),
  xl: scale.mWidth(12),
  full: 9999,
};

export const Shadows = {
  ambient: {
    shadowColor: '#002045',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
  },
  overlay: {
    shadowColor: '#002045',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 8,
  },
  mobileNav: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
  },
};

export const Opacity = {
  disabled: 0.38,
  hover: 0.8,
  focus: 0.12,
  pressed: 0.12,
};
