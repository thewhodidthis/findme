'use strict'

const assert = require('tapeless')

const config = require('./config')()
const findme = require('./')(config)

const { ok, equal, doesNotThrow } = assert

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
