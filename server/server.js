const express = require('express');
const app = express();
let cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { fieldResolver, resolvers } = require('./graphql/resolvers.js');
const typeDefs = require('./graphql/types.js');

app.use(cors());

const schema = makeExecutableSchema({typeDefs, resolvers});

app.use('/api', graphqlHTTP({
  fieldResolver,
  schema,
  graphiql: true
}));

app.listen(3000, () => console.log('Server running on port 3000'));