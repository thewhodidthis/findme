## about

Just another take on the old [sosumi](https://en.wikipedia.org/wiki/Sosumi) class. Tracks device data only. 

## setup

Fetch the latest version from GitHub directly:

```sh
# No side deps
npm install thewhodidthis/findme

# Try example
export $(cat .npmrc) && node node_modules/@thewhodidthis/findme/example.js
```

## usage

Please create an [`.npmrc`](https://docs.npmjs.com/files/npmrc#per-project-config-file) with your own `PASSWORD` and `APPLE_ID` information to test or to get the enclosed example working locally. 

```npmrc
APPLE_ID=baz@bar.foo
PASSWORD=***
```

In practice, credentials may, of course, be loaded using a CJS module along the lines of:

```js
// Sample 'config.js'
module.exports = () => ({ apple_id: 'foo@bar', password: '***' })
```

To then be exracting model information for each of your devices for example,

```js
// Load credentials
const config = require('./config')()
// Import and initialize in one go
const findme = require('@thewhodidthis/findme')(config)

// Issue request
findme((error, result) => {
  if (error) {
    console.error(error)
  } else {
    const { content } = JSON.parse(result)

    content.forEach((device) => {
      console.log(device.deviceModel)
    })
  }
})
```

## see also

- [find-my-iphone](https://github.com/matt-kruse/find-my-iphone)
