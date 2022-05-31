const { Query: { user: getUser } } = require('./user.js');
const { isGroupMember } = require('../helpers/group.js');
const { isMessageCreator } = require('../helpers/message.js');

module.exports = {
  Message: {
    async user(parent, _, { user, connection }) {
      user.authenticate();
      return await getUser({}, { userId: parent.user_id }, { user, connection });
    },
    async group(parent, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT * FROM groups
          WHERE group_id = ?`,
          [parent.group_id]
        )
      )[0][0];
    },
    async reactions(parent, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT * FROM reactions
          WHERE message_id = ? AND type IS NOT NULL`,
          [parent.message_id]
        )
      )[0];
    },
    async reaction(parent, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT * FROM reactions
          WHERE message_id = ? AND user_id = ? AND type IS NOT NULL`,
          [parent.message_id, user.id]
        )
      )[0][0];
    },
    async upVotes(parent, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT COUNT(*) FROM votes
          WHERE message_id = ? AND type = 'up'`,
          [parent.message_id]
        )
      )[0][0]['COUNT(*)'];
    },
    async downVotes(parent, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT COUNT(*) FROM votes
          WHERE message_id = ? AND type = 'down'`,
          [parent.message_id]
        )
      )[0][0]['COUNT(*)'];
    },
    async vote(parent, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT * FROM votes
          JOIN users
          USING(user_id)
          WHERE message_id = ?`,
          [parent.message_id]
        )
      )[0];
    },
    async mentionedUsers(parent, _, { user, connection }) {
      user.authenticate();
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
    async medias(parent, _, { user, connection }) {
      user.authenticate();
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
    async responseToMessage(parent, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT * FROM messages
          WHERE message_id = ?`,
          [parent.response_to_message_id]
        )
      )[0][0];
    },
    async responses(parent, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT * FROM messages
          WHERE response_to_message_id = ?`,
          [parent.message_id]
        )
      )[0];
    }
  },
  Reaction: {
    async user(parent, _, { user, connection }) {
      user.authenticate();
      return await getUser({}, { userId: parent.user_id }, { user, connection });
    },
  },
  Vote: {
    async user(parent, _, { user, connection }) {
      user.authenticate();
      return await getUser({}, { userId: parent.user_id }, { user, connection });
    },
  },
  Query: {
    async message(_, { messageId }, { user, connection }) {
      user.authenticate();
      const message = (
        await connection.query(`SELECT * FROM messages WHERE message_id = ?`, [
          messageId,
        ])
      )[0][0];

      await isGroupMember(user.id, message.group_id, connection, true);

      return message;
    }
  },
  Mutation: {
    async sendMessage(
      _,
      {
        message: { text, responseToMessageId, mentionedUserIds, mediaIds },
        groupId,
      },
      { user, connection }
    ) {
      user.authenticate();
      await isGroupMember(user.id, groupId, connection, true);
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
      return await module.exports.Query.message({}, { messageId }, { user, connection });
    },
    async editMessage(_, { message: { text, responseToMessageId, mentionedUserIds, mediaIds }, messageId, }, { user, connection }) {
      user.authenticate();
      await isGroupMember(user.id, groupId, connection, true);
      await isMessageCreator(user.id, messageId, connection, true);
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
      return await module.exports.Query.message({}, { messageId }, { user, connection });
    },
    async deleteMessage(_, { messageId }, { user, connection }) {
      user.authenticate();
      await isGroupMember(user.id, groupId, connection, true);
      await isMessageCreator(user.id, messageId, connection, true);
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
    async createReaction(_, { messageId, type }, { user, connection }) {
      user.authenticate();
      await isGroupMember(user.id, groupId, connection, true);
      await connection.query(
        `INSERT INTO reactions (user_id, message_id, type) VALUES (:userId, :messageId, :type)
        ON DUPLICATE KEY UPDATE type = :type, updated_at = DEFAULT`,
        { userId: user.id, messageId, type }
      );
      return await module.exports.Message.reaction(
        { message_id: messageId },
        {},
        { user, connection }
      );
    },
    async createVote(_, { messageId, type }, { user, connection }) {
      user.authenticate();
      await isGroupMember(user.id, groupId, connection, true);
      await connection.query(
        `INSERT INTO votes (user_id, message_id, type) VALUES (:userId, :messageId, :type)
        ON DUPLICATE KEY UPDATE type = :type, updated_at = DEFAULT`,
        { userId: user.id, messageId, type }
      );
      return type;  // TODO: return actual updated vote
    }
  }
}