import * as https from 'https';
import EventEmitter from 'events';

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
      const options = {
        hostname: 'setup.icloud.com',
        path: '/setup/ws/1/login'
      };

      // Do login
      this.post(options, this.login, (error, response, body) => {
        if (error) {
          return this.emit('error', error);
        }

        // Break if findme webservice disabled
        if (body.webservices.findme.status !== 'active') {
          return this.emit('error', new Error('findme service disabled'));
        }

        // I think it's safe to assume the headers key is part of the response
        if ({}.hasOwnProperty.call(response.headers, 'set-cookie') && Object.keys(this.cookie).length === 0) {
          const cookieArray = response.headers['set-cookie'];
          // Cleanup the cookie array returned after logging in
          this.cookie.content = cookieArray.map((entry) => {
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
        return this.ping();
      });
    }
  }

  ping() {
    const options = {
      headers: {
        Cookie: this.cookie.content
      },
      hostname: this.https.hostname,
      path: '/fmipservice/client/web/initClient'
    };

    // Send for device info
    this.post(options, (error, response, body) => {
      if (error) {
        return this.emit('error', error);
      }

      // Alert all of device data
      return this.emit('data', body.content);
    });
  }

  post(o, p, c) {
    let params = p;
    let callback = c;

    // Set the callback if no params are passed
    if (typeof p === 'function') {
      callback = p;
      params = {};
    }

    const data = JSON.stringify(params);
    const options = Object.assign({}, this.https, o);

    options.headers = Object.assign({}, this.https.headers, options.headers);
    options.headers['Content-Length'] = Buffer.byteLength(data);

    https
      .request(options)
      .on('error', callback)
      .on('response', (response) => {
        const body = [];

        if (response.statusCode === 200) {
          response
            .on('data', (chunk) => {
              body.push(chunk);
            })
            .on('end', () => callback(null, response, JSON.parse(Buffer.concat(body))));
        } else {
          callback(new Error(`HTTP ${response.statusCode}`), response, null);
        }

        response.on('error', callback);
      })
      .end(data);
  }
}

export default Findme;
