console.log("Hello world");

const { ApolloServer } = require('apollo-server')
const { fieldResolver, resolvers } = require('./graphql/resolvers.js');
const typeDefs = require('./graphql/typeDefs.js');
const jwt = require('jsonwebtoken');
const PORT = 8080;

const getUser = token => {
  try {
    if (token) {
      return jwt.verify(token, process.env.JWT_SECRET);
    }
    return null
  } catch (error) {
    return null
  }
}

const server = new ApolloServer({
  fieldResolver,
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.get('Authorization') || ''
    return { user: getUser(token.replace('Bearer', '')) }
  },
  debug: true,
  tracing: true,
  introspection: true,
  playground: true
})


server.listen(process.env.PORT || PORT, () => console.log('Server running on port ' + process.env.PORT || PORT));