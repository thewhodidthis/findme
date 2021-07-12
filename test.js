import process from "process"
import { assert, report } from "tapeless"
import finder from "./main.js"

// Using a local '.npmrc' is an easy way of sourcing private keys
const { npm_config_password: password, npm_config_apple_id: apple_id } = process.env
const { ok, equal } = assert

const findme = finder({ apple_id, password })

findme((error, result) => {
  equal
    .describe("response errors none", "will report")
    .test(error, null)

  const { content = [] } = JSON.parse(result)

  ok.test(content.length)
  equal.test(content[0].msg.statusCode, "200")

  report()
})
