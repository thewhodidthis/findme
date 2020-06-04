'use strict'

// Using a local '.npmrc' is an easy way of sourcing private keys
const { npm_config_password: password, npm_config_apple_id: apple_id } = process.env
const findme = require('./')({ password, apple_id })

const { ok, equal, doesNotThrow } = require('tapeless')

doesNotThrow
  .describe('does not throw', 'will proceed sans callback')
  .test(findme, Error)

findme((error, { content }) => {
  equal
    .describe('response errors none', 'will report')
    .test(error, null)

  ok.test(content.length)
  equal.test(content[0].msg.statusCode, 200)
})
