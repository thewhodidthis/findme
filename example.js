import process from "process"
import finder from "./main.js"

// Credentials sourced from a git-ignored '.npmrc' or 'package.json' config
// block, or passed in as environment variables
const {
  PASSWORD,
  npm_config_password: password = PASSWORD,
  APPLE_ID,
  npm_config_apple_id: apple_id = APPLE_ID,
} = process.env

// 1. Pass in credentials
const findme = finder({ apple_id, password })

// 2. Stage response callback handler
const run = () =>
  findme((error, result) => {
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
run()

// Try again to check cookie's been properly set
setTimeout(run, 30000)
