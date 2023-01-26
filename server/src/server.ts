import { config } from 'dotenv';
config();

const variablesToCheck = [
  'NODE_ENV',
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'PORT',
];

variablesToCheck.forEach((variable) => {
  if (!process.env[variable]) {
    throw new Error(`Environment variable ${variable} is not set!`);
  }
});

import { createServer } from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { json } from 'body-parser';
import cors from 'cors';
import { applyMiddleware } from 'graphql-middleware';

import getDynamicContext, { Context } from './graphql/context';
import { fieldResolverMiddleware, resolvers } from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';
import permissions from './graphql/permissions';

let schema = applyMiddleware(
  makeExecutableSchema({ typeDefs, resolvers }),
  fieldResolverMiddleware,
  permissions
);

const app = express();
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const serverCleanup = useServer(
  {
    schema,
    context: getDynamicContext,
  },
  wsServer
);

const server = new ApolloServer({
  schema,
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
  introspection: true,
});

server.start().then(() => {
  app.use(
    '/graphql',
    cors(),
    json(),
    expressMiddleware(server, {
      // @ts-ignore
      context: getDynamicContext,
    })
  );

  const PORT = parseInt(process.env.PORT!);
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
});
