const { connection } = require('../db/sql_connect.js');
const snakeCase = require('lodash.snakecase');
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');
var GraphQLDate = require('graphql-date');

const authenticate = (user) => {
  if (!user) throw new Error('You are not authenticated!');
};

const resolvers = {
  Date: GraphQLDate,
  User: {
    async userRelationships(parent, _, { user }) {
      authenticate(user);

      return [
        ...(await this.friends(parent, _, { user })),
        ...(await this.incomingFriendRequests(parent, _, { user })),
        ...(await this.outgoingFriendRequests(parent, _, { user })),
        ...(await this.blockedUsers(parent, _, { user })),
      ];
    },
    async friends(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT users.*, uur1.*, LEAST(uur1.created_at, uur2.created_at) AS real_created_at, GREATEST(uur1.updated_at, uur2.updated_at) AS real_updated_at
        FROM user_user_relationships AS uur1
        JOIN user_user_relationships AS uur2
        ON uur1.initiating_user_id = uur2.target_user_id AND uur1.target_user_id = uur2.initiating_user_id
        JOIN users
        ON user_id = uur1.initiating_user_id
        WHERE 
          uur1.type = 'friend'
          AND uur2.type = 'friend'
          AND (uur1.initiating_user_id = :id OR uur1.target_user_id = :id)
          AND user_id != :id
        GROUP BY user_id`,
          { id: parent.user_id }
        )
      )[0].map((record) => ({
        user: record,
        type: record.type,
        created_at: record.real_created_at,
        updated_at: record.real_updated_at,
      }));
    },
    async incomingFriendRequests(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT *
          FROM user_user_relationships AS uur1
          LEFT JOIN user_user_relationships AS uur2
          ON uur1.initiating_user_id = uur2.target_user_id AND uur1.target_user_id = uur2.initiating_user_id
          JOIN users
          ON user_id = uur1.initiating_user_id
          WHERE
            uur1.type = 'friend'
            AND ((uur2.type != 'friend' AND uur2.type != 'blocked' AND uur1.updated_at > uur2.updated_at) OR uur2.type IS NULL)
            AND uur1.target_user_id = :id
            AND user_id != :id`,
          { id: parent.user_id }
        )
      )[0].map((record) => ({
        user: record,
        type: 'incoming_friend_request',
        created_at: record.created_at,
        updated_at: record.updated_at,
      }));
    },
    async outgoingFriendRequests(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT *
          FROM user_user_relationships AS uur1
          LEFT JOIN user_user_relationships AS uur2
          ON uur1.initiating_user_id = uur2.target_user_id AND uur1.target_user_id = uur2.initiating_user_id
          JOIN users
          ON user_id = uur1.target_user_id
          WHERE
            uur1.type = 'friend'
            AND ((uur2.type != 'friend' AND uur2.type != 'blocked' AND uur1.updated_at > uur2.updated_at) OR uur2.type IS NULL)
            AND uur1.initiating_user_id = :id
            AND user_id != :id`,
          { id: parent.user_id }
        )
      )[0].map((record) => ({
        user: record,
        type: 'outgoing_friend_request',
        created_at: record.created_at,
        updated_at: record.updated_at,
      }));
    },
    async blockedUsers(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT *
          FROM user_user_relationships
          JOIN users
          ON user_id = target_user_id
          WHERE type = 'blocked' AND initiating_user_id = ?`,
          [parent.user_id]
        )
      )[0].map((record) => ({
        user: record,
        type: record.type,
        created_at: record.created_at,
        updated_at: record.updated_at,
      }));
    },
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
      return await resolvers.Query.user(
        {},
        { userId: parent.created_by_user_id },
        { user }
      );
    },
    async members(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM group_user_relationships
          JOIN users
          USING (user_id)
          WHERE group_id = ? AND type = 'member'`,
          [parent.group_id]
        )
      )[0];
    },
    async memberRequests(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM group_user_relationships
          JOIN users
          USING (user_id)
          WHERE group_id = ? AND type = 'member_request'`,
          [parent.group_id]
        )
      )[0];
    },
    async bannedUsers(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM group_user_relationships
          JOIN users
          USING (user_id)
          WHERE group_id = ? AND type = 'banned'`,
          [parent.group_id]
        )
      )[0];
    },
    async invitedUsers(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM group_user_relationships
          JOIN users
          USING (user_id)
          WHERE group_id = ? AND type = 'invited'`,
          [parent.group_id]
        )
      )[0];
    },
    async admins(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM group_user_relationships
          JOIN users
          USING (user_id)
          WHERE group_id = ? AND type = 'admin'`,
          [parent.group_id]
        )
      )[0];
    },
    async notificationFrequency(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT notification_frequency FROM group_user_relationships
          WHERE group_id = ? AND user_id = ?`,
          [parent.group_id, user.id]
        )
      )[0][0].notification_frequency;
    },
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
    async group(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM groups
          WHERE group_id = ?`,
          [parent.group_id]
        )
      )[0][0];
    },
    async reactions(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM reactions
          WHERE message_id = ? AND type IS NOT NULL`,
          [parent.message_id]
        )
      )[0];
    },
    async reaction(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM reactions
          WHERE message_id = ? AND user_id = ? AND type IS NOT NULL`,
          [parent.message_id, user.id]
        )
      )[0][0];
    },
    async upVotes(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT COUNT(*) FROM votes
          WHERE message_id = ? AND type = 'up'`,
          [parent.message_id]
        )
      )[0][0]['COUNT(*)'];
    },
    async downVotes(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT COUNT(*) FROM votes
          WHERE message_id = ? AND type = 'down'`,
          [parent.message_id]
        )
      )[0][0]['COUNT(*)'];
    },
    async mentionedUsers(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM mentioned_users
          JOIN users
          USING(user_id)
          WHERE message_id = ?`,
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
    },
    async responseToMessage(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM messages
          WHERE message_id = ?`,
          [parent.response_to_message_id]
        )
      )[0][0];
    },
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
    },
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
    },
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
    },
  },
  Query: {
    async user(_, { userId }, context) {
      authenticate(context.user);
      return (
        await connection.query(`SELECT * FROM users WHERE user_id = ?`, [
          userId,
        ])
      )[0][0];
    },
    async me(_, __, { user }) {
      authenticate(user);
      return await resolvers.Query.user(_, { userId: user.id }, { user });
    },
    async group(_, { groupId }, { user }) {
      authenticate(user);
      return (
        await connection.query(`SELECT * FROM groups WHERE group_id = ?`, [
          groupId,
        ])
      )[0][0];
    },
    async message(_, { messageId }, { user }) {
      authenticate(user);
      return (
        await connection.query(`SELECT * FROM messages WHERE message_id = ?`, [
          messageId,
        ])
      )[0][0];
    },
    async reaction(_, { messageId, userId }, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM reactions WHERE message_id = ? AND user_id = ? AND type IS NOT NULL`,
          [messageId, userId]
        )
      )[0][0];
    },
    async media(_, { mediaId }, { user }) {
      authenticate(user);
      return (
        await connection.query(`SELECT * FROM medias WHERE media_id = ?`, [
          mediaId,
        ])
      )[0][0];
    }
  },
  Mutation: {
    async register(
      _,
      {
        user: {
          firstName,
          lastName,
          middleName,
          userName,
          mobileNumber,
          email,
          password,
        },
      }
    ) {
      const userId = (
        await connection.query(
          `INSERT INTO users (first_name, last_name, middle_name, user_name, mobile_number, email, password)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            firstName,
            lastName,
            middleName,
            userName,
            mobileNumber,
            email,
            await bcrypt.hash(password, 10),
          ]
        )
      )[0].insertId;
      const user = await resolvers.Query.user(
        {},
        { userId },
        { user: { userId } }
      );
      const token = jsonwebtoken.sign(
        { id: user.userId },
        process.env.JWT_SECRET,
        { expiresIn: '1y' }
      );
      return { token, user };
    },
    async login(_, { email, password }) {
      const user = (
        await connection.query(`SELECT * FROM users WHERE email = ?`, [email])
      )[0][0];
      if (!user) {
        throw new Error('No user with that email');
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new Error('Incorrect password');
      }
      await connection.query(
        `UPDATE users SET last_login_at = DEFAULT WHERE user_id = ?`,
        [user.user_id]
      );
      const token = jsonwebtoken.sign(
        { id: user.user_id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      return {
        token,
        user,
      };
    },
    async updateUser(
      _,
      {
        user: {
          firstName,
          lastName,
          middleName,
          userName,
          mobileNumber,
          email,
          password,
        },
      },
      { user }
    ) {
      authenticate(user);
      await connection.query(
        `UPDATE users
          SET first_name = ?, last_name = ?, middle_name = ?, user_name = ?, mobile_number = ?, email = ?, password = ?, updated_at = DEFAULT
          WHERE user_id = ?`,
        [
          firstName,
          lastName,
          middleName,
          userName,
          mobileNumber,
          email,
          password,
          user.id,
        ]
      );
      return await resolvers.Query.user({}, { userId: user.id }, { user });
    },
    async createGroup(
      _,
      { group: { name, visibility, description } },
      { user }
    ) {
      authenticate(user);
      const groupId = (
        await connection.query(
          `INSERT INTO groups (created_by_user_id, name, visibility, description) VALUES (?, ?, ?, ?)`,
          [user.id, name, visibility, description]
        )
      )[0].insertId;

      return await resolvers.Query.group({}, { groupId }, { user });
    },
    async updateGroup(
      _,
      { group: { name, visibility, description }, groupId },
      { user }
    ) {
      authenticate(user);
      await connection.query(
        `UPDATE groups
          SET name = ?, visibility = ?, description = ?, updated_at = DEFAULT
          WHERE group_id = ?`,
        [name, visibility, description, groupId]
      );
      return await resolvers.Query.group({}, { groupId }, { user });
    },
    async deleteGroup(_, { groupId }, { user }) {
      authenticate(user);
      await connection.query(
        `DELETE FROM groups WHERE group_id = ?`,
        [groupId]
      );
      return groupId;
    },
    async sendMessage(
      _,
      {
        message: { text, responseToMessageId, mentionedUserIds, mediaIds },
        groupId,
      },
      { user }
    ) {
      authenticate(user);
      const messageId = (
        await connection.query(
          `INSERT INTO messages (user_id, text, response_to_message_id, group_id) VALUES (?, ?, ?, ?)`,
          [user.id, text, responseToMessageId, groupId]
        )
      )[0].insertId;
      if (mentionedUserIds) {
        await connection.query(
          `INSERT INTO mentioned_users (message_id, user_id) VALUES ?`,
          [mentionedUserIds.map((userId) => [messageId, userId])]
        );
      }
      if (mediaIds) {
        await connection.query(
          `INSERT INTO message_medias (message_id, media_id) VALUES ?`,
          [mediaIds.map((mediaId) => [messageId, mediaId])]
        );
      }
      return await resolvers.Query.message({}, { messageId }, { user });
    },
    async editMessage(_, { message: { text, responseToMessageId, mentionedUserIds, mediaIds }, messageId, }, { user }) {
      authenticate(user);
      await connection.query(
        `UPDATE messages
          SET text = ?, response_to_message_id = ?, updated_at = DEFAULT
          WHERE message_id = ?`,
        [text, responseToMessageId, messageId]
      );
      await connection.query(
        `DELETE FROM mentioned_users WHERE message_id = ?`,
        [messageId]
      );
      await connection.query(
        `INSERT INTO mentioned_users (message_id, user_id) VALUES ?`,
        [mentionedUserIds.map((userId) => [messageId, userId])]
      );
      await connection.query(
        `DELETE FROM message_medias WHERE message_id = ?`,
        [messageId]
      );
      await connection.query(
        `INSERT INTO message_medias (message_id, media_id) VALUES ?`,
        [mediaIds.map((mediaId) => [messageId, mediaId])]
      );
      return await resolvers.Query.message({}, { messageId }, { user });
    },
    async deleteMessage(_, { messageId }, { user }) {
      authenticate(user);
      await connection.query(
        `DELETE FROM mentioned_users WHERE message_id = ?`,
        [messageId]
      );
      await connection.query(
        `DELETE FROM message_medias WHERE message_id = ?`,
        [messageId]
      );
      await connection.query(`DELETE FROM messages WHERE message_id = ?`, [
        messageId,
      ]);
      return messageId;
    },
    async createReaction(_, { messageId, type }, { user }) {
      authenticate(user);
      await connection.query(
        `INSERT INTO reactions (user_id, message_id, type) VALUES (:userId, :messageId, :type)
        ON DUPLICATE KEY UPDATE type = :type, updated_at = DEFAULT`,
        { userId: user.id, messageId, type }
      );
      return await resolvers.Query.reaction(
        {},
        { messageId, userId: user.id },
        { user }
      );
    },
    async createVote(_, { messageId, type }, { user }) {
      authenticate(user);
      await connection.query(
        `INSERT INTO votes (user_id, message_id, type) VALUES (:userId, :messageId, :type)
        ON DUPLICATE KEY UPDATE type = :type, updated_at = DEFAULT`,
        { userId: user.id, messageId, type }
      );
      return type;
    },
    async createMedia(_, { media: { url, caption } }, { user }) {
      authenticate(user);
      const mediaId = (
        await connection.query(
          `INSERT INTO medias (user_id, url, caption) VALUES (?, ?, ?)`,
          [user.id, url, caption]
        )
      )[0].insertId;
      return await resolvers.Query.media({}, { mediaId }, { user });
    },
    async deleteMedia(_, { mediaId }, { user }) {
      authenticate(user);
      await connection.query(`DELETE FROM medias WHERE media_id = ?`, [mediaId]);
      return mediaId;
    }
  },
};

const fieldResolver = (source, _, __, info) => {
  return source[snakeCase(info.fieldName)];
};

module.exports = { fieldResolver, resolvers };
