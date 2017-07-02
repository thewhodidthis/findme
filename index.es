import { request } from 'https';

const défauts = {
  headers: { 'Content-Type': 'application/json; charset=utf-8', Origin: 'https://www.icloud.com' },
  hostname: 'setup.icloud.com',
  method: 'POST',
  path: '/setup/ws/1/login',
};

const send = (options, echo, data = '') => {
  Object.assign(options.headers, { 'Content-Length': Buffer.byteLength(data) });

  request(options)
    .on('error', echo)
    .on('response', (response) => {
      const body = [];

      if (response.statusCode === 200) {
        response
          .on('data', (chunk) => {
            body.push(chunk);
          })
          .on('end', () => echo(null, response, JSON.parse(Buffer.concat(body))));
      } else {
        echo(Error(`HTTP ${response.statusCode}`), response, null);
      }

      response.on('error', echo);
    })
    .end(data);
};

/**
 * Helps query find my iPhone service
 * @module findme
 * @param {Object} - apple id
 * @returns {Function}
 * @example
 * const finder = findme({ apple_id: ***, password: *** });
 */
const find = (appleId) => {
  const id = Object.assign(appleId, { extended_login: true });

  const session = { id: JSON.stringify(id), expires: Date() };
  const options = Object.assign({}, défaut);

  const login = reply => (error, response, body) => {
    if (error) {
      reply(error);

      return;
    }

    const { findme } = body.webservices;

    // Break away if findme disabled
    if (findme.status !== 'active') {
      reply(Error('findme service disabled'));

      return;
    }

    // Get cookie array
    const cookie = response.headers['set-cookie'];

    if (cookie) {
      // Set the expiry date based on this cookie entry
      const webauth = cookie.filter(entry => entry.includes('X-APPLE-WEBAUTH-USER')).shift();
      const expires = webauth.match(/Expires=(.*GMT+);/).pop();

      session.expires = Date(expires);

      // Cleanup cookie array and update headers
      options.headers.Cookie = cookie.map(entry => entry.substr(0, entry.indexOf(';'))).join('; ');
    }

    // Cleanup webservice url, update path, hostname
    options.hostname = findme.url.replace(':443', '').replace('https://', '');
    options.path = '/fmipservice/client/web/initClient';

    // Make the call
    send(options, reply);
  };

  return (reply) => {
    // If session within limits
    if (session.expires > Date()) {
      // Go ahead
      send(options, reply);
    } else {
      // Login first
      send(défauts, login(reply), session.id);
    }
  };
};

export default find;

