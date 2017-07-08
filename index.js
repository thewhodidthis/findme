'use strict'

const https = require('https')

const defaults = {
  headers: { 'Content-Type': 'application/json; charset=utf-8', Origin: 'https://www.icloud.com' },
  hostname: 'setup.icloud.com',
  method: 'POST',
  path: '/setup/ws/1/login',
}

const send = ({ request = defaults, callback = (() => {}), data = '' } = {}) => {
  Object.assign(request.headers, { 'Content-Length': Buffer.byteLength(data) })

  https.request(request)
    .on('error', callback)
    .on('response', (response) => {
      const body = []

      if (response.statusCode === 200) {
        response
          .on('data', (chunk) => {
            body.push(chunk)
          })
          .on('end', () => callback(null, response, JSON.parse(Buffer.concat(body))))
      } else {
        callback(Error(`HTTP ${response.statusCode}`), response, null)
      }

      response.on('error', callback)
    })
    .end(data)
}

/**
 * Helps query find my iPhone service
 * @module findme
 * @param {Object} - apple id
 * @returns {Function}
 * @example
 * const finder = findme({ apple_id: ***, password: *** });
 */
const find = (appleId) => {
  const request = Object.assign({}, defaults)

  const id = Object.assign(appleId, { extended_login: true })
  const login = { id: JSON.stringify(id), expires: Date() }

  const pivot = callback => (error, response, body) => {
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
      const webauth = cookie.filter(entry => entry.includes('X-APPLE-WEBAUTH-USER')).shift()
      const expires = webauth.match(/Expires=(.*GMT+);/).pop()

      login.expires = Date(expires)

      // Cleanup cookie array and update headers
      request.headers.Cookie = cookie.map(entry => entry.substr(0, entry.indexOf(';'))).join('; ')
    }

    // Cleanup webservice url, update path, hostname
    request.hostname = findme.url.replace(':443', '').replace('https://', '')
    request.path = '/fmipservice/client/web/initClient'

    // Make the call
    send({ request, callback })
  }

  return (callback) => {
    // If session within limits
    if (login.expires > Date()) {
      // Go ahead
      send({ request, callback })
    } else {
      // Login first
      send({ callback: pivot(callback), data: login.id })
    }
  }
}

module.exports = find
