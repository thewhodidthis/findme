'use strict'

const test = require('tape')

const config = require('./config')()
const findme = require('./')(config)

test('will report', (t) => {
  t.plan(3)

  findme((error, body) => {
    t.error(error, 'Response errors none')
    t.ok(body.content.length)
    t.ok(body.content[0].msg.statusCode, 200)
  })
})

test('will run sans callback', (t) => {
  t.doesNotThrow(findme)
  t.end()
})
