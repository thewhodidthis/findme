const test = require('tape');

const config = require('../config')();
const findme = require('../')(config);

test('will report', (t) => {
  t.plan(3);

  findme((error, response, body) => {
    t.error(error, 'Response errors none');
    t.ok(body.content.length);
    t.ok(body.content[0].msg.statusCode, 200);
  });
});

