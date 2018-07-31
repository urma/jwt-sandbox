const config = require('config')
const express = require('express')
const expressWinston = require('express-winston')
const jsonwebtoken = require('jsonwebtoken')
const jwt = require('express-jwt')
const winston = require('winston')

const app = express()

/* Logging setup */
app.locals.logger = winston.createLogger({
  transports: [ new winston.transports.Console() ]
})
app.use(expressWinston.logger({ winstonInstance: app.locals.logger }))

/* Enable body parsers */
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

/* Enable JWT authentication */
app.use(jwt({
  secret: config.jwt.sharedSecret,
  credentialsRequired: true,
  getToken: (req) => {
    if (req.headers.authorization && req.headers.authorization.split(/\s+/)[0] === 'Bearer') {
      const token = req.headers.authorization.split(/\s+/)[1]
      const header = JSON.parse(Buffer.from(token.split(/\./)[0], 'base64').toString('utf8'))
      
      /* Only return the secret after we validated the header */
      if (header && header.alg === config.jwt.algorithm) {
        return token
      }
      app.locals.logger.warn({ error: 'Invalid header parameters', header })
    }
    return null
  }
}).unless({
  path: [ '/login' ]
}))

/* Enable custom error handling; catpure any JWT authentication errors */
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ status: 'Unauthorized' })
  }
})

/* Anything that is posted to /login will get signed and turned into a valid JWT */
app.post('/login', (req, res) => {
  jsonwebtoken.sign(req.body, config.jwt.sharedSecret, {
    algorithm: config.jwt.algorithm,
    expiresIn: config.jwt.expiration,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  }, (err, token) => {
    if (err) {
      return res.send(500).json({ error: err })
    }
    return res.status(200).json({ payload: req.body, jwt: token })
  })
})

/* Any other URL will just output the JWT claims back as a JSON document */
app.all(/\S*/, (req, res) => {
  return res.status(200).json({ user: req.user })
})

/* Application startup */
app.listen(3000, () => {
  app.locals.logger.info('Listening on http://0.0.0.0:3000/')
})