import { getDefaultConfig, mergeConfig } from '@react-native/metro-config';
import {
  wrapWithReanimatedMetroConfig
} from 'react-native-reanimated/metro-config';

const config = {};

module.exports = mergeConfig(
  getDefaultConfig(__dirname),
  wrapWithReanimatedMetroConfig(config)
);
