const { connection } = require('../db/sql_connect.js');
const snakeCase = require('lodash.snakecase');
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');
var GraphQLDate = require('graphql-date');

const authenticate = user => {
  if (!user) throw new Error('You are not authenticated!')
}

const resolvers = {
  Date: GraphQLDate,
  User: {
    async friends(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM user_user_relationships
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
  Channel: {
    async messages(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM messages
          WHERE channel_id = :id`,
          { id: parent.channel_id }
        )
      )[0];
    },
    async createdByUser(parent, _, { user }) {
      authenticate(user);
      return await resolvers.Query.user({}, { userId: parent.created_by_user_id }, { user });
    }
  },
  Message: {
    async user(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM users
          WHERE user_id = ?`,
          [ parent.user_id ]
        )
      )[0][0];
    },
    async reactions(parent, _, { user }) {
      authenticate(user);
      console.log(parent.message_id)
      return (
        await connection.query(
          `SELECT * FROM reactions
          WHERE message_id = ?`,
          [ parent.message_id ]
        )
      )[0];
    },
    async votes(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM votes
          WHERE message_id = ?`,
          [ parent.message_id ]
        )
      )[0];
    },
    async mentionedUsers(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM mentioned_users
          JOIN users
          USING(user_id)
          WHERE message_id = 1`,
          [ parent.message_id ]
        )
      )[0];
    }
  },
  Reaction: {
    async user(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM users
          WHERE user_id = ?`,
          [ parent.user_id ]
        )
      )[0][0];
    }
  },
  Vote: {
    async user(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM users
          WHERE user_id = ?`,
          [parent.user_id]
        )
      )[0][0];
    }
  },
  Query: {
    async user(_, { userId }, context) {
      authenticate(context.user)
      return (await connection.query(`SELECT * FROM users WHERE user_id = ?`, [userId]))[0][0];
    },
    async me(_, __, { user }) {
      authenticate(user)
      return await resolvers.Query.user(_, { userId: user.id }, { user });
    },
    async channel(_, { channelId }, { user }) {
      authenticate(user)
      return (await connection.query(`SELECT * FROM channels WHERE channel_id = ?`, [channelId]))[0][0];
    },
    async message(_, { messageId }, { user }) {
      authenticate(user)
      return (await connection.query(`SELECT * FROM messages WHERE message_id = ?`, [messageId]))[0][0];
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
      const userId = (await connection.query(
        `INSERT INTO users (first_name, last_name, middle_name, user_name, mobile_number, email, password)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [firstName, lastName, middleName, userName, mobileNumber, email, await bcrypt.hash(password, 10)]
      ))[0].insertId;
      const user = await resolvers.Query.user({}, { userId }, { user: { userId } });
      const token = jsonwebtoken.sign(
        { id: user.userId },
        process.env.JWT_SECRET,
        { expiresIn: '1y' }
      );
      return { token, user };
    },
    async login(_, { email, password }) {
      const user = (await connection.query(`SELECT * FROM users WHERE email = ?`, [email]))[0][0]
      if (!user) {
        throw new Error('No user with that email')
      }
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        throw new Error('Incorrect password')
      }
      const token = jsonwebtoken.sign(
        { id: user.id },
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
        connection.query(
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