import snakeCase from 'lodash.snakecase';
import { mergeResolvers } from '@graphql-tools/merge';
import { loadFilesSync } from '@graphql-tools/load-files';

const resolverFiles = loadFilesSync(`${__dirname}/resolvers/*`);

export const resolvers = mergeResolvers(resolverFiles);

// middleware to convert to snake_case
// this is a workaround for the fact that graphql-middleware doesn't support fieldResolver option in ApolloServer
export const fieldResolverMiddleware = async (
  resolve: (root: any, args: any, context: any, info: any) => any,
  root: any,
  args: any,
  context: any,
  info: {
    fieldName: string;
    operation: {
      operation: string;
    };
    [key: string]: any;
  }
) => {
  if (info.operation.operation === 'subscription')
    return resolve(root, args, context, info);

  return resolve(root, args, context, {
    ...info,
    fieldName: snakeCase(info.fieldName),
  });
};
