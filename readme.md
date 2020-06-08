## about

Just another take on the old [sosumi](https://en.wikipedia.org/wiki/Sosumi) class.

## setup

Fetch the latest version from GitHub directly:

```sh
# No deps
npm install thewhodidthis/findme
```

## usage

This server side script will only track device data. Please create an [`.npmrc`](https://docs.npmjs.com/files/npmrc#per-project-config-file) with your own `password` and `apple_id` information to test or to get the enclosed example working locally. Alternatively, credentials may be loaded using a CJS module as follows:

```js
// Sample 'config.js'
module.exports = function () {
  return {
    apple_id: 'foo@bar.com',
    password: '***'
  }
}
```

To then be exracting model information for each of your devices for example,

```js
// Load credentials
const config = require('./config')()
// Import and initialize in one go
const findme = require('@thewhodidthis/findme')(config)

// Issue request
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

## see also
- [find-my-iphone](https://github.com/matt-kruse/find-my-iphone)
