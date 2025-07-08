const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), wrapWithReanimatedMetroConfig(config));