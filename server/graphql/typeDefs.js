const { loadSchemaSync } = require('@graphql-tools/load');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');

const schmea = loadSchemaSync('./**/*.gql', {
  loaders: [new GraphQLFileLoader()]
});

module.exports = schmea;