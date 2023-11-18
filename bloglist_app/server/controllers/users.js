const userRouter = require('express').Router()
const { User, Blog } = require('../models')
const { userExtractor, tokenExtractor, isAdmin } = require('../utils/middleware')


// 13.8 - fetch all users
userRouter.get('/', async (request, response, next) => { // async function that returns all users

  try {
    const users = await User.findAll({
      include: {
        model: Blog
      }
    })
    console.log(JSON.stringify(users, null, 2))
    return response.status(200).json(users)
  }
  catch (error) {
    next(error)
  }
})



userRouter.get('/:id', async (request, response, next) => { // async function that returns a single user
  const { read } = request.query // search is a query parameter ?read=true or ?read=false in the URL
  const where = {} // all q

  if (read === 'true' || read === 'false') {
    // Set the where condition based on the read query parameter
    where.read = (read === 'true')
  }
  
  try {
    const user = await User.findByPk(request.params.id, {
      attributes: {
        exclude: ['id', 'disabled', 'admin']
      },
      include: { // 13.20 - include reading list
        model: Blog,
        as: 'readings',
        attributes: {
          exclude: ['userId'],
          include: ['year'],
        },
        through: { // This will exclude the reading_list
          as: 'readinglists',
          attributes: [ // 13.21 - include reading list id and read
            'read', 'id'
          ],
          where
        },
      },
    })


    if (user === null) {
      return next('user could not be found by id')
    }

    console.log(JSON.stringify(user, null, 2))
    return response.status(200).json(user)
  } catch (error) {
    return next('user could not be found by id')
  }
})





// 13.8 - post new user
userRouter.post('/', async (request, response, next) => {

  const body = request.body

  const newUser = {
    username: body.username,
    name: body.name,
    passwordHash: 'salainen',
  }

  try {
    const savedUser = await User.create(newUser)
    console.log(`saved user: ${JSON.stringify(savedUser, null, 2)}`)
    return response.status(201).json(savedUser) // created
  } catch (error) {
    console.log(error)
    next(error)
  }

})




// 13.8 - update user
userRouter.put('/:username', tokenExtractor, userExtractor, isAdmin, async (request, response, next) => {

  const updatedUser = await User.findOne({ where: { username: request.params.username } })

  if (updatedUser) {
    try {
      updatedUser.disabled = request.body.disabled
      await updatedUser.save()
      return response.status(200).json(updatedUser)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
})





module.exports = userRouter