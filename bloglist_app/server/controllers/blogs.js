const blogRouter = require('express').Router() // requiring express router
const { Blog, User, Readinglist } = require('../models')
const { tokenExtractor, userExtractor } = require('../utils/middleware')
const { Op } = require('../utils/database.js')


// 13.4 - fetch all blogs 
blogRouter.get('/', async (request, response, next) => {
  const { search } = request.query // search is a query parameter ?search= in the url
  const where = {} // all q

  if (search) {
    where[Op.or] = [ // 13.14 - search blogs by title or author
      {
        title: {
          [Op.iLike]: `%${search}%`
        }
      },
      {
        author: {
          [Op.iLike]: `%${search}%`
        }
      },
    ]
  }



  try {
    const blogs = await Blog.findAll({
      attributes: {
        exclude: ['userId']
      },
      include: {
        model: User,
        attributes: ['username', 'name']
      },
      where,
      order: [
        ['likes', 'DESC'] // 13.15 - sort blogs by likes
      ]
    })
    console.log(JSON.stringify(blogs, null, 2))
    response.status(200).json(blogs)
  }
  catch (error) {
    next(error)
  }
})





// fetch single blog
blogRouter.get('/:id', async (request, response, next) => {

  const blog = await Blog.findByPk(request.params.id, {
    attributes: {
      exclude: ['userId']
    },
    include: {
      model: User,
      attributes: ['username', 'name']
    }
  })

  if (blog === null) {
    return next('blog could not be found by id')
  }

  try {
    console.log(JSON.stringify(blog, null, 2))
    return response.json(blog)
  } catch (error) {
    next(error)
  }

})




// 13.4 - add new blog
blogRouter.post('/', tokenExtractor, userExtractor, async (request, response, next) => {

  const body = request.body

  const newBlog = {
    author: body.author,
    url: body.url,
    title: body.title,
    likes: body.likes,
    userId: request.user.id // comes from userFinder middleware
  }

  try {
    const savedBlog = await Blog.create(newBlog)
    console.log(`saved blog: ${JSON.stringify(savedBlog, null, 2)}`)
    return response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})



// 13.4 - delete blog
blogRouter.delete('/:id', tokenExtractor, userExtractor, async (request, response, next) => { // 13.11 - delete blog
  
  const blog = await Blog.findByPk(request.params.id)

  if (blog === null) {
    return next('blog could not be found by id')
  }
  if (blog.userId !== request.user.id) {
    return response.status(401).json({ error: 'unauthorized user' })
  }


  try {
    await Readinglist.destroy({
      where: {
        blog_id: blog.id
      }
    })
    await Blog.destroy({
      where: {
        id: blog.id
      }
    })
    console.log(`deleted blog`)
    return response.status(204).end()
  } catch (error) {
    next(error)
  }

})



// 13.6 - edit blog
blogRouter.put('/:id', async (request, response, next) => {

  const blog = await Blog.findByPk(request.params.id)

  console.log(`blog: ${JSON.stringify(blog, null, 2)}`)

  if (request.blog === null) {
    return next('blog could not be found by id')
  }

  const body = request.body

  // can update likes, and also other fields if needed
  const updatedBlog = {
    author: !body.author ? blog.author : body.author,
    url: !body.url ? blog.url : body.url,
    title: !body.title ? blog.title : body.title,
    likes: !body.likes ? blog.likes : body.likes
  }

  try {

    await Blog.update(updatedBlog, {
      where: {
        id: blog.id
      }
    })

    console.log(`updated blog: ${JSON.stringify(updatedBlog, null, 2)}`)
    return response.status(200).json(updatedBlog)
  } catch (error) {
    next(error)
  }

})




module.exports = blogRouter