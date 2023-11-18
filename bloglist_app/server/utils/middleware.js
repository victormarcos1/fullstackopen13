const logger = require('./logger')
const { User, Blog, ActiveSession } = require('../models')
const jwt = require('jsonwebtoken')
const { ALLOWED_ORIGINS } = require('./config')
const { SECRET } = require('./config')

const requestLogger = (request, response, next) => { // middleware for logging requests
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => { // middleware for unknown endpoints
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {  // 13.7 - error handling middleware
  logger.error(error.message)

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'invalid token' })
  } else if (error.name === 'SequelizeDatabaseError') {
    return response.status(500).json({ error: error.message })
  } else if (error.name === 'TypeError') {
    return response.status(500).json({ error: error.message })
  } else if (error.name === 'SequelizeValidationError') {
    return response.status(500).json({ error: error.message })
  }

  console.log(error.name)
  next(error) // if none of the above, pass error to default error handler
}




const headers = (req, res, next) => { // middleware for headers, allows cross origin requests
  res.header('Access-Control-Allow-Origin', ALLOWED_ORIGINS) // allow origins from config
  res.header('Access-Control-Allow-Credentials', true) // allow credentials
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept') // allow these headers
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE') // allow these methods
  next()
}



const tokenExtractor = (req, res, next) => { // middleware for extracting token from request
  const authorization = req.get('Authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {

      req.decodedToken = jwt.verify(authorization.substring(7), SECRET) // gives user object

    } catch (error) {
      console.log(error)
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}


const validateToken = async (req, res, next) => {
  const authorization = req.get('Authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {

    const token = authorization.substring(7)
    
    try {
      if (!token) {
        return res.status(401).send({ message: 'Missing token' })
      }

      const active_sessions = await ActiveSession.findOne({
        where: { token: token },
      })

      if (!active_sessions) {
        return res.status(401).send({ message: 'Invalid token' })
      }

      req.active_sessions = active_sessions
      
      next()
    } catch (error) {
      console.log(error)
      await ActiveSession.destroy({
        where: { token: token },
      })
      
      return res.status(401).json({ error: 'token invalid' })
    }
  }


}



const userExtractor = async (request, response, next) => {  // middleware for finding user by token

  if (!request.decodedToken) {
    return next('token missing or invalid')
  }

  request.user = await User.findByPk(request.decodedToken.id)

  if (!request.user) {
    return next('user not found')
  }

  next()

}



const userFinder = async (req, res, next) => { // middleware for finding user by id
  try {
    req.user = await User.findByPk(req.params.id, {
      include: {
        model: Blog,
        attributes: ['title', 'author', 'url', 'likes'] // include blogs in response
      }
    })

    if (req.user === null) {
      return next('user could not be found by id')
    }

    next()
  } catch (error) {
    return next('user could not be found by id')
  }
}



const isAdmin = async (req, res, next) => { // middleware for checking if user is admin
  if (!req.user.admin) {
    return res.status(401).json({ error: 'operation not permitted' })
  }
  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  headers,
  tokenExtractor,
  userExtractor,
  userFinder,
  isAdmin,
  validateToken
}