## Findme
> Just another take on the old sosumi class

### Setup
```sh
npm install thewhodidthis/findme
```

### Usage
This server side script will only track device info. Please lookup other modules such as [find-my-iphone](https://github.com/matt-kruse/find-my-iphone) for extra functionality.
```js
const config = require('./config')();
const findme = require('@thewhodidthis/findme')(config);

findme((error, response, body) => {
	if (error) {
		console.error(error);
	} else {
		body.content.forEach((device) => {
			console.log(device.deviceModel)
		});
	}
});
```
