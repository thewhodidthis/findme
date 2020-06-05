'use strict'

// Credentials sourced from a git-ignored
// '.npmrc' or 'package.json' config block, or
// passed in as environment variables
const {
  PASSWORD, npm_config_password: password = PASSWORD,
  APPLE_ID, npm_config_apple_id: apple_id = APPLE_ID
} = process.env

// 1. Pass in credentials
const finder = require('./')({ password, apple_id })

// 2. Stage response callback handler
const findme = () => finder((error, { content = [] } = {}) => {
  if (error) {
    console.error(error)
    process.exit(1)
  } else {
    content.forEach(console.log)
  }
})

// 3. Send request
findme()

// Try again to check cookie's been properly set
setTimeout(findme, 30000)
