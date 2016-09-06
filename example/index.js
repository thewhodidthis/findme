var Findme = require('../index.js');

var config = require('./config')();
var findme = new Findme(config.user, config.pass);

findme.find();

// Try again to check cookie, findmeUrl and expiresOn have been properly set
setTimeout(function() {
  findme.find();
}, 30000);

findme.on('data', function _onData(data) {
  console.log(data);
});

findme.on('error', function _onError(error) {
  console.error(error);
  process.exit(1);
});
