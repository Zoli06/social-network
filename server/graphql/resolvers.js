const snakeCase = require('lodash.snakecase');
const { mergeResolvers } = require('@graphql-tools/merge');
const { loadFilesSync } = require('@graphql-tools/load-files');

const resolverFiles = loadFilesSync(`${__dirname}/resolvers/*`);

const resolvers = mergeResolvers(resolverFiles);

const fieldResolver = (source, _, __, info) => {
  return source[snakeCase(info.fieldName)];
};

module.exports = { fieldResolver, resolvers };
