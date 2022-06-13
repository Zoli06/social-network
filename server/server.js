console.log("Hello world");

const { ApolloServer } = require('apollo-server-express');
const { createServer } = require('http');
const express = require('express');
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');

const { fieldResolver, resolvers } = require('./graphql/resolvers.js');
const connection = require('./db/sql_connect.js');
const typeDefs = require('./graphql/typeDefs.js');
const jwt = require('jsonwebtoken');
const bodyParser = require("body-parser");
const path = require('path').resolve(__dirname, '../client/build');

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();

app.use(express.static(path));
app.use(bodyParser.json());
app.get('/*', (req, res) => {
  res.sendFile(path + "/index.html");
});
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});
const serverCleanup = useServer({ schema }, wsServer);

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
  schema,
  fieldResolver,
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
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),

    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
  debug: true,
  tracing: true,
  introspection: true,
  playground: true
});

PORT = process.env.PORT || 8080;
server.start().then(() => {
  server.applyMiddleware({ app });
  httpServer.listen(PORT, () => console.log('Server running on port ' + PORT));
});