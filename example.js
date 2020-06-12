'use strict'

// Credentials sourced from a git-ignored
// '.npmrc' or 'package.json' config block, or
// passed in as environment variables
const {
  PASSWORD, npm_config_PASSWORD: password = PASSWORD,
  APPLE_ID, npm_config_APPLE_ID: apple_id = APPLE_ID
} = process.env

// 1. Pass in credentials
const finder = require('./')({ apple_id, password })

// 2. Stage response callback handler
const findme = () => finder((error, result) => {
  if (error) {
    console.error(error)
    process.exit(1)
  } else {
    const { content = [] } = JSON.parse(result)

    content.forEach((data) => {
      console.log(data)
    })
  }
})

// 3. Send request
findme()

// Try again to check cookie's been properly set
setTimeout(findme, 30000)
