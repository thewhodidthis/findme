> Just another take on the old sosumi class

### Setup
```sh
# Fetch latest from github
npm i thewhodidthis/findme
```

### Usage
This server side script will only track device info. Please lookup other modules such as [find-my-iphone](https://github.com/matt-kruse/find-my-iphone) for extra functionality.
```js
const config = require('./config')()
const findme = require('@thewhodidthis/findme')(config)

findme((error, { content }) => {
    if (error) {
        console.error(error)
    } else {
        content.forEach((device) => {
            console.log(device.deviceModel)
        })
    }
})
```

```js
// config.js
module.exports = function () {
    return {
        apple_id: 'foo@bar.com',
        password: '***'
    }
}
```
