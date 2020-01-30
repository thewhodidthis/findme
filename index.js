'use strict'

const https = require('https')

// Fill in these request options in advance, override later if need be
const defaults = {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Origin': 'https://www.icloud.com'
  },
  hostname: 'setup.icloud.com',
  method: 'POST',
  path: '/setup/ws/1/login'
}

// Built-in `https` request wrapper
const send = ({ callback = v => v, settings = defaults, data = '' } = {}) => {
  Object.assign(settings.headers, { 'Content-Length': Buffer.byteLength(data) })

  https
    .request(settings)
    .on('error', callback)
    .on('response', (response) => {
      if (response.statusCode === 200) {
        const body = []

        response
          .on('data', (chunk) => { body.push(chunk) })
          .on('end', () => { callback(null, JSON.parse(Buffer.concat(body)), response) })
      } else {
        callback(Error(`HTTP ${response.statusCode}`), null, response)
      }

      response.on('error', callback)
    })
    .end(data)
}

/**
 * Helps query find my iPhone service
 * @module findme
 * @param {object} config - apple login info
 * @param {string} config.apple_id - email
 * @param {string} config.password - secret
 * @returns {function} - accepts a response handler
 * @example
 * const finder = findme({ apple_id: ***, password: *** })
 */
const find = (config) => {
  const settings = Object.assign({}, defaults)

  const id = Object.assign(config, { extended_login: true })
  const login = { id: JSON.stringify(id), expires: Date() }

  const pivot = callback => (error, body, response) => {
    if (error) {
      callback(error)

      return
    }

    const { findme } = body.webservices

    // Break away if findme disabled
    if (findme.status !== 'active') {
      callback(Error('findme service disabled'))

      return
    }

    // Get cookie array
    const cookie = response.headers['set-cookie']

    if (cookie) {
      // Set the expiry date based on this cookie entry
      const webauth = cookie.filter(item => item.includes('X-APPLE-WEBAUTH-USER')).shift()
      const expires = webauth.match(/Expires=(.*GMT+);/).pop()

      login.expires = Date(expires)

      // Cleanup cookie array and update headers
      settings.headers.Cookie = cookie.map(item => item.substr(0, item.indexOf(';'))).join('; ')
    }

    // Cleanup webservice url, update request path, hostname
    settings.hostname = findme.url.replace(':443', '').replace('https://', '')
    settings.path = '/fmipservice/client/web/initClient'

    // Make the call
    send({ callback, settings })
  }

  return (callback) => {
    // If session within limits
    if (login.expires > Date()) {
      // Go ahead
      send({ callback, settings })
    } else {
      // Login first
      send({ callback: pivot(callback), data: login.id })
    }
  }
}

module.exports = find
