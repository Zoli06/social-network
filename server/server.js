const { ApolloServer } = require('apollo-server')
const { fieldResolver, resolvers } = require('./graphql/resolvers.js');
const typeDefs = require('./graphql/typeDefs.js');
const jwt = require('jsonwebtoken');

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
    return { user: getUser(token.replace('Bearer', ''))}
  },
  introspection: true,
  playground: true
})

server.listen(3000, () => console.log('Server running on port 3000'));