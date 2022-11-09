const { loadSchemaSync } = require("@graphql-tools/load");
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");

module.exports = loadSchemaSync("./**/*.gql", {
  loaders: [new GraphQLFileLoader()],
});
