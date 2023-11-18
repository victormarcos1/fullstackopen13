const loginRouter = require('express').Router()
const { User, ActiveSession } = require('../models')


loginRouter.post('/', async (request, response) => { // 13.10 - login route
  

  const { username, password } = request.body

  const user = await User.findOne({ where: { username } })

  const passwordCorrect = user === null // check if password is correct by comparing the password given in the request body to the passwordHash stored in the database
    ? false
    : password === 'salainen'

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  if (user.disabled) {
    return response.status(401).json({
      error: 'account disabled, please contact an administrator'
    })
  }

  console.log(`user: ${JSON.stringify(user, null, 2)}`)

  const token = await user.generateToken() // generate token for user using the generateToken method defined in the User model
  await ActiveSession.create({ token: token, userId: user.id }) // create an active session for the user


  return response.status(200).send({
    token: token, // generate token for user using the generateToken method defined in the User model
    username: user.username,
    name: user.name,
  })

})

module.exports = loginRouter