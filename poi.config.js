const webpack = require('webpack');
const glob = require('glob').sync;
const {name} = require('./package.json');

module.exports = {
  entry: glob('./src/**/*.vue'),
  filename: {
    js: name + '.min.js',
    css: name + '.min.css',
  },
  sourceMap: true,
  html: false,
  moduleName: 'VueAutocomplete'
};
