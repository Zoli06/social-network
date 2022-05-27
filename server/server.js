console.log("Hello world");

const { ApolloServer } = require('apollo-server')
const { fieldResolver, resolvers } = require('./graphql/resolvers.js');
const connection = require('./db/sql_connect.js');
const typeDefs = require('./graphql/typeDefs.js');
const jwt = require('jsonwebtoken');
const PORT = 8080;

const getUser = token => {
  try {
    if (token) {
      try {
        jwt.verify(token, process.env.JWT_SECRET)
      } catch (err) {
        if (process.env.NODE_ENV === 'development') return { id: token };
      }
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
    const token = req.get('Authorization') || '';
    const user = getUser(token.replace('Bearer', '').trim());
    return {
      user: {
        ...user,
        authenticate: () => { if (!user) throw new Error('You are not authenticated!'); }
      },
      connection
    }
  },
  debug: true,
  tracing: true,
  introspection: true,
  playground: true
})

server.listen(process.env.PORT || PORT, () => console.log('Server running on port ' + process.env.PORT || PORT));