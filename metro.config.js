const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable Metro bundler optimizations
config.transformer.minifierConfig = {
  mangle: {
    keep_fnames: true,
  },
};

// Enable tree shaking
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

module.exports = config;
