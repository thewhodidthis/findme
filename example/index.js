const config = require('../config')();
const finder = require('../')(config);

const logger = (error, response, body) => {
  if (error) {
    console.error(error);
    process.exit(1);
  } else {
    body.content.forEach(console.log);
  }
};

const findme = () => finder(logger);

findme();

// Try again to check cookie's been properly set
setTimeout(findme, 30000);

