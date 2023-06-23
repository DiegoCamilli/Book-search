const jwt = require('jsonwebtoken')

// set token secret and expiration
const secret = 'mysecretsshhhhh'
const expiration = '2h'

module.exports = {
  // function for our auth
  authMiddleware: function ({ req }) {
    let token = req.headers.authorization || ''

    if (token) {
      token = token.replace('Bearer ', '')
    }

    if (!token) {
      throw new Error('You have no token!')
    }

    // verify token
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration })
      req.user = data
    } catch {
      console.log('Invalid token')
      throw new Error('Invalid token!')
    }
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id }

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration })
  },
}