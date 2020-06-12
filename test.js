'use strict'

// Using a local '.npmrc' is an easy way of sourcing private keys
const { npm_config_PASSWORD: password, npm_config_APPLE_ID: apple_id } = process.env
const findme = require('./')({ apple_id, password })

const { ok, equal, doesNotThrow } = require('tapeless')

doesNotThrow
  .describe('does not throw', 'will proceed sans callback')
  .test(findme, Error)

findme((error, result) => {
  equal
    .describe('response errors none', 'will report')
    .test(error, null)

  const { content = [] } = JSON.parse(result)

  ok.test(content.length)
  equal.test(content[0].msg.statusCode, 200)
})
