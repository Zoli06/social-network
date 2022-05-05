const snakeCase = require('lodash.snakecase');

const resolvers = {
  ...require('./resolvers/group.js'),
  ...require('./resolvers/media.js'),
  ...require('./resolvers/message.js'),
  ...require('./resolvers/root.js'),
  ...require('./resolvers/user.js')
};

const fieldResolver = (source, _, __, info) => {
  return source[snakeCase(info.fieldName)];
};

module.exports = { fieldResolver, resolvers };
