const express = require('express');
const app = express();
let cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLSchema
} = require('graphql');

app.use(cors());