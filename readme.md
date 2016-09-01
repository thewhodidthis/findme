## Findme
> Just another take on the old sosumi class.

This server side module will only track device info. Please lookup other modules such as [find-my-iphone](https://github.com/matt-kruse/find-my-iphone) for extra functionality.

### Setup
```sh
npm install thewhodidthis/findme --save
```

### Usage
```js
var Config = require('./config');
var Sosumi = require('@thewhodidthis/findme');

var config = new Config();
var sosumi = new Sosumi(config.user, config.pass);

sosumi.find();

sosumi.on('data', function _onData(devices) {
	devices.forEach(function _forEachDevice(device) {
		console.log(device.location);
	});
});

sosumi.on('error', function _onError(error) {
	console.error(error);
});
```
