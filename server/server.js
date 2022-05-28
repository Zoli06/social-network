console.log("Hello world");

const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const { fieldResolver, resolvers } = require('./graphql/resolvers.js');
const connection = require('./db/sql_connect.js');
const typeDefs = require('./graphql/typeDefs.js');
const jwt = require('jsonwebtoken');

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

const apolloServer = new ApolloServer({
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
});

apolloServer.start().then(() => {
  const app = express();
  apolloServer.applyMiddleware({ app });

  // app.get("/rest", (req, res) => {
  //   res.json({
  //     data: "API is working...",
  //   });
  // });

  app.listen(process.env.PORT || PORT, () => console.log('Server running on port ' + (process.env.PORT || PORT)));
});