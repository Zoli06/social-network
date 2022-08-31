const { Query: { user: getUser } } = require('./user.js');
const { isGroupMember } = require('../helpers/group.js');
const { isMessageCreator } = require('../helpers/message.js');
const Grapheme = require('grapheme-splitter');
const splitter = new Grapheme();

module.exports = {
  Message: {
    async user({ user_id }, _, { user, connection }) {
      user.authenticate();
      return await getUser({}, { userId: user_id }, { user, connection });
    },
    async group({ group_id }, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT * FROM groups
          WHERE group_id = ?`,
          [group_id]
        )
      )[0][0];
    },
    async reactions({ message_id }, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT * FROM reactions
          WHERE message_id = ? AND type IS NOT NULL`,
          [message_id]
        )
      )[0];
    },
    async reaction({ message_id }, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT * FROM reactions
          WHERE message_id = ? AND user_id = ? AND type IS NOT NULL`,
          [message_id, user.id]
        )
      )[0][0];
    },
    async upVotes({ message_id }, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT COUNT(*) FROM votes
          WHERE message_id = ? AND type = 'up'`,
          [message_id]
        )
      )[0][0]['COUNT(*)'];
    },
    async downVotes({ message_id }, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT COUNT(*) FROM votes
          WHERE message_id = ? AND type = 'down'`,
          [message_id]
        )
      )[0][0]['COUNT(*)'];
    },
    async vote({ message_id }, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT * FROM votes
          JOIN users
          USING(user_id)
          WHERE message_id = ? AND user_id = ?`,
          [message_id, user.id]
        )
      )[0][0]?.['type'];
    },
    async mentionedUsers({ message_id }, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT * FROM mentioned_users
          JOIN users
          USING(user_id)
          WHERE message_id = ?`,
          [message_id]
        )
      )[0];
    },
    async medias({ message_id }, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT * FROM message_medias
          JOIN medias
          USING(media_id)
          WHERE message_id = ?`,
          [message_id]
        )
      )[0];
    },
    async responseTo({ response_to_message_id }, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT * FROM messages
          WHERE message_id = ?`,
          [response_to_message_id]
        )
      )[0][0];
    },
    async responses({ message_id }, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT * FROM messages
          WHERE response_to_message_id = ?`,
          [message_id]
        )
      )[0];
    },
    async responseTree({ message_id }, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          // thank you stackoverflow for this one
          `SELECT *
          FROM (SELECT * FROM messages
            ORDER BY response_to_message_id, message_id) messages_sorted,
            (SELECT @pv := ?) initialisation
          WHERE find_in_set(response_to_message_id, @pv)
          AND LENGTH(@pv := concat(@pv, ',', message_id))`,
          [message_id]
        )
      )[0];
    },
    async responsesCount({ message_id }, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT COUNT(*) FROM messages
          WHERE response_to_message_id = ? `,
          [message_id]
        )
      )[0][0]['COUNT(*)'];
    }
  },
  Reaction: {
    async user({ user_id }, _, { user, connection }) {
      user.authenticate();
      return await getUser({}, { userId: user_id }, { user, connection });
    },
  },
  // Vote: {
  //   async user({ user_id }, _, { user, connection }) {
  //     user.authenticate();
  //     return await getUser({}, { userId: user_id }, { user, connection });
  //   },
  // },
  Query: {
    async message(_, { messageId }, { user, connection }) {
      user.authenticate();
      const message = (
        await connection.query(`SELECT * FROM messages WHERE message_id = ? `, [
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
      { user, connection, pubsub }
    ) {
      user.authenticate();
      await isGroupMember(user.id, groupId, connection, true);
      const messageId = (
        await connection.query(
          `INSERT INTO messages(user_id, text, response_to_message_id, group_id) VALUES(?, ?, ?, ?)`,
          [user.id, text, responseToMessageId, groupId]
        )
      )[0].insertId;
      if (mentionedUserIds) {
        await connection.query(
          `INSERT INTO mentioned_users(message_id, user_id) VALUES ? `,
          [mentionedUserIds.map((userId) => [messageId, userId])]
        );
      }
      if (mediaIds) {
        await connection.query(
          `INSERT INTO message_medias(message_id, media_id) VALUES ? `,
          [mediaIds.map((mediaId) => [messageId, mediaId])]
        );
      }
      const createdMessage = await module.exports.Query.message({}, { messageId }, { user, connection });
      pubsub.publish(`MESSAGE_ADDED_${groupId}`, { messageAdded: createdMessage });
      return createdMessage;
    },
    async editMessage(_, { message: { text, responseToMessageId, mentionedUserIds, mediaIds }, messageId, }, { user, connection, pubsub }) {
      user.authenticate();
      const groupId = (
        await connection.query(
          `SELECT group_id FROM messages WHERE message_id = ? `,
          [messageId]
        )
      )[0][0].group_id;
      await isGroupMember(user.id, groupId, connection, true);
      await isMessageCreator(user.id, messageId, connection, true);
      await connection.query(
        `UPDATE messages
          SET text = ?, response_to_message_id = ?, updated_at = DEFAULT
          WHERE message_id = ? `,
        [text, responseToMessageId, messageId]
      );
      await connection.query(
        `DELETE FROM mentioned_users WHERE message_id = ? `,
        [messageId]
      );
      await connection.query(
        `INSERT INTO mentioned_users(message_id, user_id) VALUES ? `,
        [mentionedUserIds.map((userId) => [messageId, userId])]
      );
      await connection.query(
        `DELETE FROM message_medias WHERE message_id = ? `,
        [messageId]
      );
      await connection.query(
        `INSERT INTO message_medias(message_id, media_id) VALUES ? `,
        [mediaIds.map((mediaId) => [messageId, mediaId])]
      );
      const editedMessage = await module.exports.Query.message({}, { messageId }, { user, connection });
      pubsub.publish(`MESSAGE_EDITED_${groupId}`, { messageEdited: editedMessage });
      return editedMessage;
    },
    async deleteMessage(_, { messageId }, { user, connection, pubsub }) {
      user.authenticate();
      const groupId = (
        await connection.query(
          `SELECT group_id FROM messages WHERE message_id = ? `,
          [messageId]
        )
      )[0][0].group_id;
      await isGroupMember(user.id, groupId, connection, true);
      await isMessageCreator(user.id, messageId, connection, true);
      await connection.query(
        `DELETE FROM mentioned_users WHERE message_id = ? `,
        [messageId]
      );
      await connection.query(
        `DELETE FROM message_medias WHERE message_id = ? `,
        [messageId]
      );
      await connection.query(`DELETE FROM messages WHERE message_id = ? `, [
        messageId,
      ]);
      pubsub.publish(`MESSAGE_DELETED_${groupId}`, { messageDeleted: messageId });
      return messageId;
    },
    async createReaction(_, { messageId, type }, { user, connection, pubsub }) {
      user.authenticate();
      emoji = type ? String.fromCodePoint(type) : null;
      if (emoji != null && (splitter.splitGraphemes(emoji).length !== 1 || !/\p{Extended_Pictographic}/u.test(emoji))) {
        throw new Error('Invalid emoji');
      }
      const groupId = (
        await connection.query(
          `SELECT group_id FROM messages WHERE message_id = ? `,
          [messageId]
        )
      )[0][0].group_id;
      await isGroupMember(user.id, groupId, connection, true);
      await connection.query(
        `INSERT INTO reactions(user_id, message_id, type) VALUES(:userId, :messageId, :type)
        ON DUPLICATE KEY UPDATE type = :type, updated_at = DEFAULT`,
        { userId: user.id, messageId, type }
      );
      const reaction = await module.exports.Message.reaction({ message_id: messageId }, {}, { user, connection });
      console.log(messageId)
      pubsub.publish(`MESSAGE_REACTED_${messageId}`, {
        messageReacted: module.exports.Message.reactions({ message_id: messageId }, {}, { user, connection }),
      });
      return reaction;
    },
    async createVote(_, { messageId, type }, { user, connection, pubsub }) {
      user.authenticate();
      const groupId = (
        await connection.query(
          `SELECT group_id FROM messages WHERE message_id = ? `,
          [messageId]
        )
      )[0][0].group_id;
      await isGroupMember(user.id, groupId, connection, true);
      await connection.query(
        `INSERT INTO votes(user_id, message_id, type) VALUES(:userId, :messageId, :type)
        ON DUPLICATE KEY UPDATE type = :type, updated_at = DEFAULT`,
        { userId: user.id, messageId, type }
      );
      pubsub.publish(
        `MESSAGE_VOTED_${messageId}`,
        {
          messageVoted: {
            upVotes: await module.exports.Message.upVotes({ message_id: messageId }, {}, { user, connection }),
            downVotes: await module.exports.Message.downVotes({ message_id: messageId }, {}, { user, connection }),
          }
        }
      );
      return await module.exports.Message.vote({ message_id: messageId }, {}, { user, connection });
    }
  },
  Subscription: {
    messageAdded: {
      subscribe: async (_, { groupId }, { user, connection, pubsub }) => {
        user.authenticate();
        await isGroupMember(user.id, groupId, connection, true);
        return pubsub.asyncIterator(`MESSAGE_ADDED_${groupId}`);
      }
    },
    messageEdited: {
      subscribe: async (_, { groupId }, { user, connection, pubsub }) => {
        user.authenticate();
        await isGroupMember(user.id, groupId, connection, true);
        return pubsub.asyncIterator(`MESSAGE_EDITED_${groupId}`);
      }
    },
    messageDeleted: {
      subscribe: async (_, { groupId }, { user, connection, pubsub }) => {
        user.authenticate();
        await isGroupMember(user.id, groupId, connection, true);
        return pubsub.asyncIterator(`MESSAGE_DELETED_${groupId}`);
      }
    },
    messageReacted: {
      subscribe: async (_, { messageId }, { user, connection, pubsub }) => {
        user.authenticate();
        await isGroupMember(user.id, (await module.exports.Query.message({}, { messageId }, { user, connection })).group_id, connection, true);
        return pubsub.asyncIterator(`MESSAGE_REACTED_${messageId}`);
      }
    },
    messageVoted: {
      subscribe: async (_, { messageId }, { user, connection, pubsub }) => {
        user.authenticate();
        await isGroupMember(user.id, (await module.exports.Query.message({}, { messageId }, { user, connection })).group_id, connection, true);
        return pubsub.asyncIterator(`MESSAGE_VOTED_${messageId}`);
      }
    }
  }
}