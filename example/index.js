'use strict';

const Findme = require('../index.js');

const config = require('./config')();
const findme = new Findme(config.user, config.pass);

findme.find();

// Try again to check cookie's been properly set
setTimeout(function() {
  findme.find();
}, 30000);

findme.on('data', function _onData(data) {
  data.forEach(function _logDeviceInfo(device) {
    console.log(device);
  });
});

findme.on('error', function _onError(error) {
  console.error(error);
  process.exit(1);
});
