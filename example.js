'use strict'

const config = require('./config')()
const finder = require('./')(config)

// Prep
const findme = () => finder((error, { content }) => {
  if (error) {
    console.error(error)
    process.exit(1)
  } else {
    content.forEach(console.log)
  }
})

// Go
findme()

// Try again to check cookie's been properly set
setTimeout(findme, 30000)
