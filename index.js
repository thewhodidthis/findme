'use strict';

// For setting up inheritance
var util = require('util');

// For handling icloud api interaction
var https = require('https');

// Inherits from
var EventEmitter = require('events').EventEmitter;

function Findme(user, pass) {
  EventEmitter.call(this);

  // Store settings
  // TODO: add key, cert options for https
  for (var key in Findme.defaults) {
    this[key] = Findme.defaults[key];
  }

  // Store credentials
  this.login.apple_id = user;
  this.login.password = pass;
}

util.inherits(Findme, EventEmitter);

Findme.prototype.sendRequest = function (data, options, callback) {
  options = Object.assign({}, this.request, options);

  options.headers = Object.assign({}, this.request.headers, options.headers);
  options.headers['Content-Length'] = Buffer.byteLength(data);

  https.request(options).on('error', function _onRequestError(error) {

    // Request unsuccesful
    return callback(error, null, null);
  }).on('response', function _onResponse(response) {
    var body = [];

    if (response.statusCode === 200) {
      response.on('data', function _onData(chunk) {
        body.push(chunk);
      });

      response.on('end', function _onEnd() {
        return callback(null, response, JSON.parse(Buffer.concat(body)));
      });
    } else {

      // Response unsuccesful
      return callback(new Error('status code ' + response.statusCode), response, null);
    }

    response.on('error', function _onResponseError(error) {

      // Response errors
      return callback(error, response, null);
    });
  }).end(data);
};

Findme.prototype.makeServiceCall = function () {
  var options = {
    headers: {
      Cookie: this.cookie.content
    },
    hostname: this.request.hostname,
    path: '/fmipservice/client/web/initClient'
  };

  // Send for device info
  this.sendRequest('', options, function _onCallSuccessful(error, response, body) {
    if (error) {
      return this.emit('error', error);
    }

    // Alert all of device data
    this.emit('data', body.content);
  }.bind(this));
};

Findme.prototype.find = function () {

  // Make the call if session available
  if (this.cookie && this.cookie.expires && this.cookie.expires > new Date()) {
    this.makeServiceCall();
  } else {

    var data = JSON.stringify(this.login);
    var options = {
      hostname: 'setup.icloud.com',
      path: '/setup/ws/1/login'
    };

    // Do login
    // TODO: Lotsa binding going on
    this.sendRequest(data, options, function _onLoginSuccessful(error, response, body) {
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
        this.cookie.content = cookieArray.map(function _forEachEntry(entry, idx) {

          // Set the expiry date based on this cookie entry
          if (entry.includes('X-APPLE-WEBAUTH-USER')) {
            this.cookie.expires = new Date(entry.match(/Expires=(.*GMT+);/)[1]);
          }

          // Keep the part up to the first semicolon
          return entry.substr(0, entry.indexOf(';'));
        }.bind(this)).join('; ');
      } else {

        // Reset the cookie store
        this.cookie = {};
      }

      // Cleanup webservice url
      this.request.hostname = body.webservices.findme.url.replace(':443', '').replace('https://', '');

      this.makeServiceCall();
    }.bind(this));
  }
};

Findme.defaults = {
  login: {
    apple_id: '',
    password: '',
    extended_login: true
  },
  cookie: {},
  request: {
    headers: {
      Origin: 'https://www.icloud.com',
      'Content-Type': 'application/json; charset=utf-8'
    },
    method: 'POST'
  }
};

module.exports = Findme;
