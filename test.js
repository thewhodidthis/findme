'use strict'

const assert = require('tapeless')

const config = require('./config')()
const findme = require('./')(config)

const { ok, equal, doesNotThrow } = assert

doesNotThrow(findme, Error, 'does not throw', 'will proceed sans callback')

findme((error, { content }) => {
  equal(error, null, 'response errors none', 'will report')

  ok(content.length)
  equal(content[0].msg.statusCode, 200)
})

