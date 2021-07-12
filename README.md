## about

Just another take on the old [sosumi](https://en.wikipedia.org/wiki/Sosumi) class. Tracks device data only.

## setup

Fetch the latest version from GitHub directly:

```sh
# No side deps
npm install thewhodidthis/findme
```

## usage

Please create an [`.npmrc`](https://docs.npmjs.com/files/npmrc#per-project-config-file) with your own `PASSWORD` and `APPLE_ID` information to test or to get the enclosed example working locally.

```npmrc
# Sample .npmrc
APPLE_ID=baz@bar.foo
PASSWORD=***
```

That would make it possible to, for example,

```sh
# Let example know of your login information
export $(cat .npmrc) && node node_modules/@thewhodidthis/findme/example.js
```

In practice, credentials may, of course, be loaded using a JS module along the lines of:

```js
// Sample 'config.js'
exports default () => ({ apple_id: "foo@bar", password: "***" })
```

To then be exracting model information for each of your devices for example,

```js
import finder from "@thewhodidthis/findme"
import config from "./config.js"

// Initialize
const findme = finder(config)

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
