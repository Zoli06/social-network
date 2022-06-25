const GraphQLDate = require('graphql-date');

const EXAMPLE = 'EXAMPLE';

module.exports = {
  Date: GraphQLDate,
  Subscription: {
    example: {
      subscribe: (_, __, { pubsub }) => {
        return pubsub.asyncIterator(EXAMPLE);
      }
    }
  },
  Mutation: {
    callExample: (_, { foo }, { pubsub }) => {
      pubsub.publish(EXAMPLE, { example: foo });
      return foo;
    }
  }
}