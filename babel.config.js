module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin'],
  env: {
    production: {
      plugins: [['transform-remove-console', {exclude: ['error', 'warn']}]],
    },
  },
};
