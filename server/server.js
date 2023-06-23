const express = require('express')
const path = require('path')
const { ApolloServer } = require('apollo-server-express')
const { authMiddleware } = require('./utils/auth')
const { typeDefs, resolvers } = require('./schema/index')
const db = require('./config/connection')

const app = express()
const PORT = process.env.PORT || 3001

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
  })

  await server.start()

  server.applyMiddleware({ app })
}

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')))
}

// Comment out the existing routes middleware
// app.use(routes)

db.once('open', () => {
  startApolloServer().then(() => {
    app.listen(PORT, () =>
      console.log(`🌍 Now listening on localhost:${PORT}`)
    )
  })
})