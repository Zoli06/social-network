const connection = require('../db/sql_connect.js');
const snakeCase = require('lodash.snakecase');
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const authenticate = user => {
  if (!user) throw new Error('You are not authenticated!')
}

const resolvers = {
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
          { id: parent.user_id }
        )
      )[0];
    }
  },
  Query: {
    async user(_, { userId }, context) {
      authenticate(context.user)
      return (await connection.promise().query(`SELECT * FROM users WHERE user_id = ?`, [userId]))[0][0];
    },
    async me(_, __, { user }) {
      if (!user) throw new Error('You are not authenticated!')
      return await resolvers.Query.user(_, { userId: user.userId }, { user: user });
    }
  },
  Mutation: {
    async register(_, { input: {
      firstName,
      lastName,
      middleName,
      userName,
      mobileNumber,
      email,
      password
    } }) {
      const userId = (await connection.promise().query(
        `INSERT INTO users (first_name, last_name, middle_name, user_name, mobile_number, email, password)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [firstName, lastName, middleName, userName, mobileNumber, email, await bcrypt.hash(password, 10)]
      ))[0].insertId;
      const user = await resolvers.Query.user({}, { userId }, { user: { userId } });
      const token = jsonwebtoken.sign(
        { id: user.userId, userId: user.user_id },
        process.env.JWT_SECRET,
        { expiresIn: '1y' }
      );
      return { token, user };
    },
    async login(_, { email, password }) {
      const user = (await connection.promise().query(`SELECT * FROM users WHERE email = ?`, [email]))[0][0]
      if (!user) {
        throw new Error('No user with that email')
      }
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        throw new Error('Incorrect password')
      }
      const token = jsonwebtoken.sign(
        { id: user.id, userId: user.user_id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      )
      return {
        token, user
      }
    },
    updateUser(_, { input: { userId, firstName, lastName, middleName, userName, mobileNumber, email, password } }, { user }) {
      authenticate(user)
      return (
        connection.promise().query(
          `UPDATE users
          SET first_name = ?, last_name = ?, middle_name = ?, user_name = ?, mobile_number = ?, email = ?, password = ?
          WHERE user_id = ?`,
          [firstName, lastName, middleName, userName, mobileNumber, email, password, userId]
        )
      );
    }
  }
}

const fieldResolver = (source, _, __, info) => {
  return source[snakeCase(info.fieldName)]
}

module.exports = { fieldResolver, resolvers };