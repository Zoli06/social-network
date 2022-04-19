const connection = require('../db/sql_connect.js');
const snakeCase = require('lodash.snakecase');

const resolvers = {
  Query: {
    async user(_, { id }) {
      return (await connection.promise().query(`SELECT * FROM users WHERE user_id = ?`, id))[0][0];
    }
  },
  User: {
    async friends(parent) {
      return (
        await connection.promise().query(
        `SELECT * FROM user_user_relationship_history
        JOIN users
        ON user_id = initiating_user_id OR user_id = target_user_id
        WHERE (initiating_user_id = :id OR target_user_id = :id)
          AND relationship_type = 2
          AND user_id != :id`,
          { id: parent.user_id })
      )[0];
    }
  }
}

const fieldResolver = (source, _, __, info) => {
  return source[snakeCase(info.fieldName)]
}

module.exports = { fieldResolver, resolvers };