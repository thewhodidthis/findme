'use strict';

// For handling icloud api interaction
const https = require('https');

// Inherits from
const EventEmitter = require('events').EventEmitter;

class Findme extends EventEmitter {
  constructor(user, pass) {
    super(user, pass);

    // For making repeated calls once logged in
    this.cookie = {};

    // Store credentials
    this.login = {
      apple_id: user,
      password: pass,
      extended_login: true
    };

    // Request defaults
    this.https = {
      headers: {
        Origin: 'https://www.icloud.com',
        'Content-Type': 'application/json; charset=utf-8'
      },
      method: 'POST'
    };
  }

  find() {

    // If session available
    if (this.cookie && this.cookie.expires && this.cookie.expires > new Date()) {

      // Skip login
      this.ping();
    } else {
      let data = JSON.stringify(this.login);
      let options = {
        hostname: 'setup.icloud.com',
        path: '/setup/ws/1/login'
      };

      // Do login
      this.post(data, options, (error, response, body) => {
        if (error) {
          return this.emit('error', error);
        }

        // Break if findme webservice disabled
        if (body.webservices.findme.status !== 'active') {
          return this.emit('error', new Error('findme service disabled'));
        }

        // I think it's safe to assume the headers key is part of the response
        if (response.headers.hasOwnProperty('set-cookie') && Object.keys(this.cookie).length === 0) {
          var cookieArray = response.headers['set-cookie'];

          // Cleanup the cookie array returned after logging in
          this.cookie.content = cookieArray.map((entry, idx) => {

            // Set the expiry date based on this cookie entry
            if (entry.includes('X-APPLE-WEBAUTH-USER')) {
              this.cookie.expires = new Date(entry.match(/Expires=(.*GMT+);/)[1]);
            }

            // Keep the part up to the first semicolon
            return entry.substr(0, entry.indexOf(';'));
          }).join('; ');
        } else {

          // Reset the cookie store
          this.cookie = {};
        }

        // Cleanup webservice url
        this.https.hostname = body.webservices.findme.url.replace(':443', '').replace('https://', '');

        // Go
        this.ping();
      });
    }
  }

  ping() {
    let data = '';
    let options = {
      headers: {
        Cookie: this.cookie.content
      },
      hostname: this.https.hostname,
      path: '/fmipservice/client/web/initClient'
    };

    // Send for device info
    this.post(data, options, (error, response, body) => {
      if (error) {
        return this.emit('error', error);
      }

      // Alert all of device data
      this.emit('data', body.content);
    });
  }

  post(data, options, callback) {
    options = Object.assign({}, this.https, options);

    options.headers = Object.assign({}, this.https.headers, options.headers);
    options.headers['Content-Length'] = Buffer.byteLength(data);

    https
      .request(options)
      .on('error', callback)
      .on('response', response => {
        const body = [];

        if (response.statusCode === 200) {
          response.on('data', chunk => {
            body.push(chunk);
          });

          response.on('end', () => {
            return callback(null, response, JSON.parse(Buffer.concat(body)));
          });
        } else {
          return callback(new Error('status code ' + response.statusCode), response, null);
        }

        response.on('error', callback);
      })
      .end(data);
  }
}

module.exports = Findme;
