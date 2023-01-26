import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";

export default loadSchemaSync("./**/*.gql", {
  loaders: [new GraphQLFileLoader()],
});
