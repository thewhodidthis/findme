import https from "https"

// Helps query find my iPhone service
export default function find(credentials = {}) {
  // Format and store login information
  const id = Object.assign({}, credentials, { extended_login: true })
  const login = { id: JSON.stringify(id), expires: Date() }

  // Request settings store, mutated past login
  const options = {}

  // An intermediate step required to log in or when cookie expired
  const pivot = callback =>
    (error, result, response) => {
      if (error) {
        callback(error)

        return
      }

      const { webservices = {} } = JSON.parse(result)
      const { findme = {} } = webservices
      const { status } = findme

      // Break away if service is turned off
      if (status !== "active") {
        callback(Error("Service disabled"))

        return
      }

      // Get cookie array
      const cookie = response.headers["set-cookie"]

      if (cookie) {
        // Set the expiry date based on this cookie entry
        const webauth = cookie.filter(item => item.includes("X-APPLE-WEBAUTH-USER")).shift()
        const expires = webauth.match(/Expires=(.*GMT+);/).pop()

        login.expires = Date(expires)

        // Clean up cookie array before passing back to set respective header
        options.cookie = cookie.map(item => item.substr(0, item.indexOf(";"))).join("; ")
      }

      // Clean up web service url, update request path and hostname
      options.hostname = findme.url.replace(":443", "").replace("https://", "")
      options.path = "/fmipservice/client/web/initClient"

      // Make the call now that login achieved
      send(options, callback)
    }

  return (callback = v => v) => {
    // If session within limits
    if (login.expires > Date()) {
      // Go ahead
      send(options, callback)
    } else {
      // Log in or back again
      send({ content: login.id }, pivot(callback))
    }
  }
}

// Wraps `https.request()` to post to the API and pass back the response
function send(options = {}, callback) {
  // Defaults reflect initial login setup
  const { content, cookie, hostname = "setup.icloud.com", path = "/setup/ws/1/login" } = options
  const method = "POST"
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Origin": "https://www.icloud.com",
  }

  // When credentials are present on initial login
  if (content) {
    headers["Content-Length"] = Buffer.byteLength(content)
  }

  // After successful login
  if (cookie) {
    headers["Cookie"] = cookie
  }

  https
    .request({ headers, hostname, method, path })
    .on("error", callback)
    .on("response", (response) => {
      const { statusMessage, statusCode } = response

      // Blanket reject all non-OK responses
      if (statusCode === 200) {
        const data = []

        response
          .on("data", (chunk) => {
            data.push(chunk)
          })
          .on("end", () => {
            const result = Buffer.concat(data).toString()

            callback(null, result, response)
          })
      } else {
        const error = Error(`HTTP ${statusCode} ${statusMessage}`)

        callback(error)
      }
    })
    .end(content)
}
