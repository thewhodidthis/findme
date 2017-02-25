'use strict';

const Findme = require('../index.js');

const config = require('./config')();
const findme = new Findme(config.user, config.pass);

findme.find();

// Try again to check cookie's been properly set
setTimeout(() => {
  findme.find();
}, 30000);

findme.on('data', (data) => {
  data.forEach(console.log);
});

findme.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
