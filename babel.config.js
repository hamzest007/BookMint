module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: [
          '.ios.js',
          '.android.js',
          '.js',
          '.jsx',
          '.json',
          '.tsx',
          '.ts',
        ],
        alias: {
          '@config': './src/config',
          '@constants': './src/constants',
          '@assets': './src/assets',
          '@components': './src/components',
          '@context': './src/context',
          '@hooks': './src/hooks',
          '@navigation': './src/navigations',
          '@screens': './src/screens',
          '@store': './src/store',
          '@theme': './src/theme',
          '@appTypes': './src/types',
          '@utils': './src/utils',
        },
      },
    ],
  ],
};
