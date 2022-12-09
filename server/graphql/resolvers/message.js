const {
  Query: { user: getUser },
} = require("./user.js");
const { isGroupMember, isGroupAdmin } = require("../helpers/group.js");
const { isMessageCreator } = require("../helpers/message.js");
const Grapheme = require("grapheme-splitter");
const splitter = new Grapheme();

module.exports = {
  Message: {
    async author({ user_id }, _, { user, connection }) {
      user.authenticate();
      return await getUser({}, { userId: user_id }, { user, connection });
    },
    async group({ group_id }, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT * FROM \`groups\`
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
      )[0][0]["COUNT(*)"];
    },
    async downVotes({ message_id }, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT COUNT(*) FROM votes
          WHERE message_id = ? AND type = 'down'`,
          [message_id]
        )
      )[0][0]["COUNT(*)"];
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
      )[0][0]?.["type"];
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
    async responseTree({ message_id }, { maxDepth }, { user, connection }) {
      user.authenticate();
      const columns = (
        await connection.query(
          `select column_name as columns from information_schema.columns where table_schema = 'social_network' and table_name = 'messages'`
        )
      )[0].map((element) => element.columns);

      const noMaxDepth = maxDepth === undefined;

      return (
        await connection.query(
          `WITH RECURSIVE message_tree (${columns}, lvl) AS
          (
            SELECT ${columns}, 0 lvl
              FROM messages
              WHERE response_to_message_id <=> ?
            UNION ALL
            SELECT ${columns.map((element) => "m." + element)},mt.lvl + 1
              FROM message_tree AS mt JOIN messages AS m
                ON mt.message_id = m.response_to_message_id
          )
          SELECT * FROM message_tree WHERE lvl < ? OR ?;`,
          [message_id, maxDepth, noMaxDepth]
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
      )[0][0]["COUNT(*)"];
    },
    async userPermissionToMessage({group_id, message_id}, _, { user, connection }) {
      // author, admin or none of the above
      user.authenticate();
      const isAuthor = await isMessageCreator(user.id, message_id, connection, false, false);
      const isAdmin = await isGroupAdmin(user.id, group_id, connection, false);
      return isAuthor ? "author" : isAdmin ? "admin" : "none";
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
    },
  },
  Mutation: {
    async sendMessage(
      _,
      {
        message: {
          text,
          groupId,
          responseToMessageId,
          mentionedUserIds,
          mediaIds,
        },
      },
      { user, connection, pubsub }
    ) {
      user.authenticate();

      if (responseToMessageId != null) {
        // TODO: lot's of sql query like this, maybe we should make a helper function
        const _parentGroupId = (
          await connection.query(
            `SELECT group_id FROM messages WHERE message_id = ? `,
            [responseToMessageId]
          )
        )[0][0].group_id.toString();

        if (!!responseToMessageId && groupId !== _parentGroupId)
          throw new Error("Parent message is in different group!");
      }

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
      pubsub.publish(`MESSAGE_ADDED_${groupId}`, { messageAdded: messageId });
      const createdMessage = (
        await connection.query(`SELECT * FROM messages WHERE message_id = ? `, [
          messageId,
        ])
      )[0][0];
      return createdMessage;
    },
    async editMessage(
      _,
      { message: { messageId, text, mentionedUserIds, mediaIds } },
      { user, connection, pubsub }
    ) {
      user.authenticate();
      const groupId = (
        await connection.query(
          `SELECT group_id FROM messages WHERE message_id = ? `,
          [messageId]
        )
      )[0][0].group_id;
      await isGroupMember(user.id, groupId, connection, true);
      await isMessageCreator(user.id, messageId, connection, false, true);
      await connection.query(
        `UPDATE messages
          SET text = ?, updated_at = DEFAULT
          WHERE message_id = ? `,
        [text, messageId]
      );
      await connection.query(
        `DELETE FROM mentioned_users WHERE message_id = ? `,
        [messageId]
      );
      if (mentionedUserIds) {
        await connection.query(
          `INSERT INTO mentioned_users(message_id, user_id) VALUES ? `,
          [mentionedUserIds.map((userId) => [messageId, userId])]
        );
      }
      await connection.query(
        `DELETE FROM message_medias WHERE message_id = ? `,
        [messageId]
      );
      if (mediaIds) {
        await connection.query(
          `INSERT INTO message_medias(message_id, media_id) VALUES ? `,
          [mediaIds.map((mediaId) => [messageId, mediaId])]
        );
      }
      pubsub.publish(`MESSAGE_EDITED_${groupId}`, { messageEdited: messageId });
      const editedMessage = (
        await connection.query(`SELECT * FROM messages WHERE message_id = ? `, [
          messageId,
        ])
      )[0][0];
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

      let messagesToDelete = [];

      const findMessagesToDeleteRecursively = async (messageId) => {
        messagesToDelete.push(messageId.toString());
        const responses = (
          await connection.query(
            `SELECT message_id FROM messages WHERE response_to_message_id = ? `,
            [messageId]
          )
        )[0];
        if (responses.length > 0) {
          for (const response of responses) {
            await findMessagesToDeleteRecursively(response.message_id);
          }
        }
      };

      await findMessagesToDeleteRecursively(messageId);

      //TODO: maybe we can execute the first three query simultaneously
      await connection.query(`DELETE FROM reactions WHERE message_id IN (?) `, [
        messagesToDelete,
      ]);

      await connection.query(
        `DELETE FROM mentioned_users WHERE message_id IN (?) `,
        [messagesToDelete]
      );

      await connection.query(
        `DELETE FROM message_medias WHERE message_id IN (?) `,
        [messagesToDelete]
      );

      await connection.query(`DELETE FROM votes WHERE message_id IN (?) `, [
        messagesToDelete,
      ]);

      messagesToDelete = messagesToDelete.reverse();

      for (const message of messagesToDelete) {
        await connection.query(`DELETE FROM messages WHERE message_id = ? `, [
          message,
        ]);
      }

      pubsub.publish(`MESSAGES_DELETED_${groupId}`, {
        messagesDeleted: messagesToDelete,
      });
      return messagesToDelete;
    },
    async createReaction(_, { messageId, type }, { user, connection, pubsub }) {
      user.authenticate();
      emoji = type ? String.fromCodePoint(type) : null;
      if (
        emoji != null &&
        (splitter.splitGraphemes(emoji).length !== 1 ||
          !/\p{Extended_Pictographic}/u.test(emoji))
      ) {
        throw new Error("Invalid emoji");
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
      const reaction = await module.exports.Message.reaction(
        { message_id: messageId },
        {},
        { user, connection }
      );
      pubsub.publish(`MESSAGE_REACTED_${messageId}`, {
        messageReacted: module.exports.Message.reactions(
          { message_id: messageId },
          {},
          { user, connection }
        ),
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
      pubsub.publish(`MESSAGE_VOTED_${messageId}`, {
        messageVoted: {
          upVotes: await module.exports.Message.upVotes(
            { message_id: messageId },
            {},
            { user, connection }
          ),
          downVotes: await module.exports.Message.downVotes(
            { message_id: messageId },
            {},
            { user, connection }
          ),
        },
      });
      return await module.exports.Message.vote(
        { message_id: messageId },
        {},
        { user, connection }
      );
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: async (_, { groupId }, { user, connection, pubsub }) => {
        user.authenticate();
        await isGroupMember(user.id, groupId, connection, true);
        return pubsub.asyncIterator(`MESSAGE_ADDED_${groupId}`);
      },
    },
    messageEdited: {
      subscribe: async (_, { groupId }, { user, connection, pubsub }) => {
        user.authenticate();
        await isGroupMember(user.id, groupId, connection, true);
        return pubsub.asyncIterator(`MESSAGE_EDITED_${groupId}`);
      },
    },
    messagesDeleted: {
      subscribe: async (_, { groupId }, { user, connection, pubsub }) => {
        user.authenticate();
        await isGroupMember(user.id, groupId, connection, true);
        return pubsub.asyncIterator(`MESSAGES_DELETED_${groupId}`);
      },
    },
    messageReacted: {
      subscribe: async (_, { messageId }, { user, connection, pubsub }) => {
        user.authenticate();
        await isGroupMember(
          user.id,
          (
            await module.exports.Query.message(
              {},
              { messageId },
              { user, connection }
            )
          ).group_id,
          connection,
          true
        );
        return pubsub.asyncIterator(`MESSAGE_REACTED_${messageId}`);
      },
    },
    messageVoted: {
      subscribe: async (_, { messageId }, { user, connection, pubsub }) => {
        user.authenticate();
        await isGroupMember(
          user.id,
          (
            await module.exports.Query.message(
              {},
              { messageId },
              { user, connection }
            )
          ).group_id,
          connection,
          true
        );
        return pubsub.asyncIterator(`MESSAGE_VOTED_${messageId}`);
      },
    },
  },
};
