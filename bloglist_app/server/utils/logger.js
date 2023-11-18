const info = (...params) => {
  if (process.env.NODE_ENV !== 'test') {  // if testing is going on, nothing is printed
    console.log(...params)
  }
}

const error = (...params) => { // error logger
  if (process.env.NODE_ENV !== 'test') {
    console.error(...params)
  }
}


module.exports = {
  info, error
}