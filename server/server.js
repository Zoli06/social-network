console.log("Hello world");

const { ApolloServer } = require('apollo-server-express');
const { createServer } = require('http');
const express = require('express');
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { PubSub } = require('graphql-subscriptions');

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
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const pubsub = new PubSub();

const getDynamicContext = (ctx) => {
  const token = (ctx.req?.get('Authorization') || ctx.connectionParams?.Authorization || '').replace('Bearer', '').trim();
  console.log(token);
  const user = getUser(token);
  return {
    user: {
      ...user,
      authenticate: () => { if (!user) throw new Error('You are not authenticated!'); }
    },
    connection,
    pubsub
  }
}

const serverCleanup = useServer(
  {
    schema,
    context: getDynamicContext
  },
  wsServer
);

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
  context: getDynamicContext,
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