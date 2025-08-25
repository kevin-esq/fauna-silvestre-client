// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  wrapWithReanimatedMetroConfig
} = require('react-native-reanimated/metro-config');

const config = {};

module.exports = mergeConfig(
  getDefaultConfig(__dirname),
  wrapWithReanimatedMetroConfig(config)
);
