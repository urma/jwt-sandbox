const express = require('express')
const expressWinston = require('express-winston')
const jwt = require('express-jwt')
const winston = require('winston')

const app = express()

/* Logging setup */
app.locals.logger = winston.createLogger({
  transports: [ new winston.transports.Console() ]
})
app.use(expressWinston.logger({ winstonInstance: app.locals.logger }))

/* Enable JWT authentication */
app.use(jwt({
  secret: 'thisIsMySuperAwesomeSecret',
  credentialsRequired: true,
  getToken: (req) => {
    if (req.headers.authorization && req.headers.authorization.split(/\s+/)[0] === 'Bearer') {
      const token = req.headers.authorization.split(/\s+/)[1]
      const header = JSON.parse(Buffer.from(token.split(/\./)[0], 'base64').toString('utf8'))
      
      /* Only return the secret after we validated the header */
      if (header && header.alg === 'HS512') {
        return token
      }
      app.locals.logger.warn({ error: 'Invalid header parameters', header })
    }
    return null
  }
}))

/* Enable custom error handling */
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ status: 'Unauthorized' })
  }
})

app.all(/\S*/, (req, res) => {
  return res.status(200).json({ user: req.user })
})

/* Application startup */
app.listen(3000, () => {
  app.locals.logger.info('Listening on http://0.0.0.0:3000/')
})