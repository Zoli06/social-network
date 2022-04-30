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
          `SELECT * FROM user_user_relationship_history AS uurh
          JOIN users
          ON user_id = initiating_user_id OR user_id = target_user_id
          WHERE (initiating_user_id = :id OR target_user_id = :id)
            AND type = 'friend'
            AND user_id != :id
          ORDER BY uurh.created_at DESC
          LIMIT 1`,
          { id: parent.user_id }
        )
      )[0];
    },
    async incomingFriendRequests(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM user_user_relationship_history AS uurh
          JOIN users
          ON user_id = initiating_user_id
          WHERE target_user_id = ? AND type = 'friend_request'
          ORDER BY uurh.created_at DESC
          LIMIT 1`,
          [parent.user_id]
        )
      )[0];
    },
    async outgoingFriendRequests(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM user_user_relationship_history AS uurh
          JOIN users
          ON user_id = target_user_id
          WHERE initiating_user_id = ? AND type = 'friend_request'
          ORDER BY uurh.created_at DESC
          LIMIT 1`,
          [parent.user_id]
        )
      )[0];
    },
    async blockedUsers(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM user_user_relationship_history AS uurh
          JOIN users
          ON user_id = target_user_id
          WHERE initiating_user_id = ?
            AND type = 'blocked'
          ORDER BY uurh.created_at DESC
          LIMIT 1`,
          [parent.user_id]
        )
      )[0];
    }
  },
  Group: {
    async messages(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM messages
          WHERE group_id = ?`,
          [parent.group_id]
        )
      )[0];
    },
    async createdByUser(parent, _, { user }) {
      authenticate(user);
      return await resolvers.Query.user({}, { userId: parent.created_by_user_id }, { user });
    },
    async members(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM group_user_relationship_history AS gurh
          JOIN users
          USING (user_id)
          WHERE group_id = ? AND type = 'member'
          ORDER BY gurh.created_at DESC
          LIMIT 1`,
          [parent.group_id]
        )
      )[0];
    },
    async memberRequests(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM group_user_relationship_history AS gurh
          JOIN users
          USING (user_id)
          WHERE group_id = ? AND type = 'member_request'
          ORDER BY gurh.created_at DESC
          LIMIT 1`,
          [parent.group_id]
        )
      )[0];
    },
    async blockedUsers(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM group_user_relationship_history AS gurh
          JOIN users
          USING (user_id)
          WHERE group_id = ? AND type = 'blocked'
          ORDER BY gurh.created_at DESC
          LIMIT 1`,
          [parent.group_id]
        )
      )[0];
    },
    async admins(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM group_user_relationship_history AS gurh
          JOIN users
          USING (user_id)
          WHERE group_id = ? AND type = 'admin'
          ORDER BY gurh.created_at DESC
          LIMIT 1`,
          [parent.group_id]
        )
      )[0];
    },
    async notificationFrequency(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT notification_frequency FROM group_user_relationship_history AS gurh
          WHERE group_id = ? AND user_id = ?
          ORDER BY gurh.created_at DESC
          LIMIT 1`,
          [parent.group_id, user.id]
        )
      )[0][0].notification_frequency;
    },
    async details(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM group_details
          WHERE group_id = ?`,
          [parent.group_id]
        )
      )[0];
    }
  },
  Message: {
    async user(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM users
          WHERE user_id = ?`,
          [parent.user_id]
        )
      )[0][0];
    },
    async reactions(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM reactions
          WHERE message_id = ?`,
          [parent.message_id]
        )
      )[0];
    },
    async votes(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM votes
          WHERE message_id = ?`,
          [parent.message_id]
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
          [parent.message_id]
        )
      )[0];
    },
    async medias(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM message_medias
          JOIN medias
          USING(media_id)
          WHERE message_id = ?`,
          [parent.message_id]
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
          [parent.user_id]
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
  Media: {
    async user(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM medias
          JOIN users
          USING(user_id)
          WHERE media_id = ?`,
          [parent.media_id]
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
    async group(_, { groupId }, { user }) {
      authenticate(user)
      return (await connection.query(`SELECT * FROM groups WHERE group_id = ?`, [groupId]))[0][0];
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
        { id: user.user_id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      )
      return {
        token, user
      }
    },
    updateUser(_, { input: { firstName, lastName, middleName, userName, mobileNumber, email, password } }, { user }) {
      authenticate(user)
      return (
        connection.query(
          `UPDATE users
          SET first_name = ?, last_name = ?, middle_name = ?, user_name = ?, mobile_number = ?, email = ?, password = ?
          WHERE user_id = ?`,
          [firstName, lastName, middleName, userName, mobileNumber, email, password, user.id]
        )
      );
    }
  }
}

const fieldResolver = (source, _, __, info) => {
  return source[snakeCase(info.fieldName)]
}

module.exports = { fieldResolver, resolvers };