const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable Metro bundler optimizations
config.transformer.minifierConfig = {
  keep_quoted_props: true,
  mangle: {
    keep_fnames: true,
  },
};

// Enable tree shaking
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Optimize asset resolution
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

module.exports = config;
