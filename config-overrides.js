const webpack = require('webpack');
const path = require('path');

module.exports = function override(config, env) {
  // fallbacks 설정 추가
  config.resolve.fallback = {
    // Node.js 폴리필들
    "buffer": require.resolve("buffer"),
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "util": require.resolve("util"),
    "process": require.resolve("process/browser"),
    "zlib": require.resolve("browserify-zlib"),
    "url": require.resolve("url"),
    "timers": require.resolve("timers-browserify"),
    "net": false,
    "tls": false,
    "fs": false,
    "path": false,
    "http": false,
    "https": false,
    "os": false
  };
  
  // React Router 관련 문제 해결을 위한 설정
  config.resolve.alias = {
    ...config.resolve.alias,
    'process/browser': require.resolve('process/browser')
  };

  // plugins 설정 추가
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  );

  return config;
};
