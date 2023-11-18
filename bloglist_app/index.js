
const app = require('./server/app.js')
const http = require('http') 
const logger = require('./server/utils/logger.js')
const { connectToDatabase } = require('./server/utils/database.js') 
const { PORT } = require('./server/utils/config.js')

const server = http.createServer(app) // create server

const startServer = async () => {
  try {
    await connectToDatabase() // connect to database
    server.listen(PORT, () => { // listen to port
      logger.info(`Server running on port ${PORT}`)
    })
  } catch (error) {
    logger.error('error connecting to database:', error)
  }
}

startServer()