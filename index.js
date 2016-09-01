'use strict';

// Use the inherits method instead of Object.create()
var util = require('util');

// For handling api interaction
var https = require('https');

// Inherits from
var EventEmitter = require('events').EventEmitter;

function Findme(user, pass) {
  EventEmitter.call(this);

  // Store credentials
  this.auth = {
    apple_id: user,
    password: pass,
    extended_login: true
  };
}

util.inherits(Findme, EventEmitter);

Findme.prototype.sendRequest = function (options, callback) {
  var _this = this;

  var data = options.data;
  var path = options.path;
  var hostname = options.hostname;

  var headers = {
    Origin: 'https://www.icloud.com',
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data)
  };

  if (options.headers) {
    headers = Object.assign(headers, options.headers);
  }

  https.request({
    path: path,
    method: 'POST',
    headers: headers,
    hostname: hostname
  }).on('error', function _onRequestError(error) {

    // Send request errors
    _this.emit('error', new Error('Request error: ' + error.message));
  }).on('response', function _onResponse(response) {
    var body = [];
    var cookies = response.headers['set-cookie'];

    if (cookies && _this.cookie === '') {

      // Cleanup the cookie array returned after logging in
      // There's probably better ways of doing this
      cookies.forEach(function _forEachCookieEntry(entry, idx) {

        // Set the exapiry date based on this cookie entry
        if (entry.includes('X-APPLE-WEBAUTH-USER')) {
          _this.expiresOn = new Date(entry.match(/Expires=(.*GMT+);/)[1]);
        }

        // Keep the part up to the first semicolon
        entry = entry.substr(0, entry.indexOf(';'));

        // If this is the last entry skip the semicolon
        if (idx < cookies.length - 1) {
          entry += '; ';
        }

        _this.cookie += entry;
      });
    }

    if (response.statusCode === 200) {
      response.on('data', function _onData(chunk) {
        body.push(chunk);
      });

      response.on('end', function _onEnd() {
        callback(JSON.parse(Buffer.concat(body)));
      });
    } else {

      // Request unsuccesful
      _this.emit('error', new Error('Response error: ' + response.statusCode));
    }

    response.on('error', function _onResponseError(error) {

      // Alert response errors
      _this.emit('error', new Error('Response error: ' + error.message));
    });
  }).end(data);
};

Findme.prototype.makeServiceCall = function () {

  // Can only procced after login succesful, ie. cookie and service url have beed set
  var options = {
    data: '',
    path: '/fmipservice/client/web/initClient',
    headers: {
      Cookie: this.cookie
    },
    hostname: this.findmeUrl
  };

  // Send for device info
  this.sendRequest(options, function _onCallSuccessful(data) {

    // Alert all of device data
    this.emit('data', data.content);
  }.bind(this));
};

Findme.prototype.find = function () {
  if (this.findmeUrl && this.cookie && this.expiresOn && this.expiresOn > new Date()) {
    this.makeServiceCall();
  } else {

    // Login details
    var options = {
      data: JSON.stringify(this.auth),
      path: '/setup/ws/1/login',
      hostname: 'setup.icloud.com'
    };

    // Store session data
    this.cookie = '';
    this.expiresOn = '';
    this.findmeUrl = '';

    // Login
    this.sendRequest(options, function _onLoginSuccessful(data) {

      // Assuming data contains all those keys, break if findme webservice disabled
      if (data.webservices.findme.status !== 'active') {
        return;
      }

      // Cleanup the findme webservice url
      this.findmeUrl = data.webservices.findme.url.replace(':443', '').replace('https://', '');
      this.makeServiceCall();
    }.bind(this));
  }
};

module.exports = Findme;
