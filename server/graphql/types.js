const { loadSchemaSync } = require('@graphql-tools/load');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');

const typeDefs = loadSchemaSync('./**/*.gql', {
  loaders: [new GraphQLFileLoader()]
});

module.exports = typeDefs;