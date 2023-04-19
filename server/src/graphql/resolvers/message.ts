import User from './user';
import GraphemeSplitter from 'grapheme-splitter';
import { Context } from '../context';
import { deleteMessageAndReplies } from '../helpers/message';

const {
  Query: { user: getUser },
} = User;
const splitter = new GraphemeSplitter();
const resolvers = {
  Message: {
    async author({ user_id }: { user_id: number }, _: any, context: Context) {
      return await getUser({}, { userId: user_id }, context);
    },
    async group(
      { group_id }: { group_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM \`groups\`
          WHERE group_id = ?`,
          [group_id]
        )
      )[0][0];
    },
    async reactions(
      { message_id }: { message_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM reactions
          WHERE message_id = ? AND type IS NOT NULL`,
          [message_id]
        )
      )[0];
    },
    async reaction(
      { message_id }: { message_id: number },
      _: any,
      { user, connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM reactions
          WHERE message_id = ? AND user_id = ? AND type IS NOT NULL`,
          [message_id, user.userId]
        )
      )[0][0];
    },
    async upVotes(
      { message_id }: { message_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT COUNT(*) FROM votes
          WHERE message_id = ? AND type = 'up'`,
          [message_id]
        )
      )[0][0]['COUNT(*)'];
    },
    async downVotes(
      { message_id }: { message_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT COUNT(*) FROM votes
          WHERE message_id = ? AND type = 'down'`,
          [message_id]
        )
      )[0][0]['COUNT(*)'];
    },
    async vote(
      { message_id }: { message_id: number },
      _: any,
      { user, connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM votes
          JOIN users
          USING(user_id)
          WHERE message_id = ? AND user_id = ?`,
          [message_id, user.userId]
        )
      )[0][0]?.['type'];
    },
    async mentionedUsers(
      { message_id }: { message_id: number },
      _: any,
      { connection }: Context
    ) {
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
    async medias(
      { message_id }: { message_id: number },
      _: any,
      { connection }: Context
    ) {
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
    async responseTo(
      { response_to_message_id }: { response_to_message_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM messages
          WHERE message_id = ?`,
          [response_to_message_id]
        )
      )[0][0];
    },
    async responses(
      { message_id }: { message_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM messages
          WHERE response_to_message_id = ?`,
          [message_id]
        )
      )[0];
    },
    async responseTree(
      { message_id }: { message_id: number | null },
      { maxDepth }: { maxDepth: number },
      { connection }: Context
    ) {
      const columns = (
        await connection.query(
          `SELECT column_name AS columns FROM information_schema.columns WHERE table_schema = 'social_network' AND table_name = 'messages'`
        )
      )[0].map((element: { columns: string }) => element.columns);

      const noMaxDepth = maxDepth === undefined;

      return (
        await connection.query(
          `WITH RECURSIVE message_tree (${columns}, lvl) AS
          (
            SELECT ${columns}, 0 lvl
              FROM messages
              WHERE response_to_message_id <=> ?
            UNION ALL
            SELECT ${columns.map(
              (element: string) => 'm.' + element
            )},mt.lvl + 1
              FROM message_tree AS mt JOIN messages AS m
                ON mt.message_id = m.response_to_message_id
          )
          SELECT * FROM message_tree WHERE lvl < ? OR ?;`,
          [message_id, maxDepth, noMaxDepth]
        )
      )[0];
    },
    async responsesCount(
      { message_id }: { message_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT COUNT(*) FROM messages
          WHERE response_to_message_id = ? `,
          [message_id]
        )
      )[0][0]['COUNT(*)'];
    },
    async myPermissionToMessage(
      { group_id, message_id }: { group_id: number; message_id: number },
      _: any,
      { user, connection }: Context
    ) {
      // author, admin or none of the above
      const isAuthor = (
        await connection.query(
          `SELECT * FROM messages
          WHERE message_id = ? AND user_id = ?`,
          [message_id, user.userId]
        )
      )[0][0];

      const isAdmin = (
        await connection.query(
          `SELECT * FROM group_user_relationships
          WHERE group_id = ? AND user_id = ? AND type = 'admin'`,
          [group_id, user.userId]
        )
      )[0][0];

      return isAuthor ? 'author' : isAdmin ? 'admin' : 'none';
    },
  },
  Reaction: {
    async user({ user_id }: { user_id: number }, _: any, context: Context) {
      return await getUser({}, { userId: user_id }, context);
    },
  },
  Query: {
    async message(
      _: any,
      { messageId }: { messageId: number },
      { connection }: Context
    ) {
      const message = (
        await connection.query(`SELECT * FROM messages WHERE message_id = ? `, [
          messageId,
        ])
      )[0][0];

      return message;
    },
    async searchMessages(
      _: any,
      { query }: { query: string },
      { connection, user: { userId } }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM messages AS m
          JOIN \`groups\` AS g
            ON m.group_id = g.group_id
          JOIN group_user_relationships AS gur
            ON g.group_id = gur.group_id AND gur.user_id = :userId
          WHERE
            MATCH text AGAINST (:query IN NATURAL LANGUAGE MODE)
            AND (
              g.visibility = 'open'
              OR g.created_by_user_id = :userId
              OR gur.type = 'admin'
              OR gur.type = 'member'
            )
          `,
          { query, userId }
        )
      )[0];
    },
    async topMessages (
      _: any,
      { limit = 10, offset = 0 }: { limit: number; offset: number },
      { connection, user }: Context
    ) {
      return (
        await connection.query(
          `SELECT DISTINCT m.*, SUM(v.type = 'up') - SUM(v.type = 'down') AS votes
          FROM messages AS m
          LEFT JOIN votes AS v
            ON m.message_id = v.message_id
          JOIN group_user_relationships AS gur
            ON gur.group_id = m.group_id
          JOIN \`groups\` AS g
            ON g.group_id = m.group_id
          WHERE
            gur.user_id = :userId
            AND m.response_to_message_id IS NULL
            AND
              (g.visibility = 'open'
              OR g.created_by_user_id = :userId
              OR gur.type = 'admin'
              OR gur.type = 'member')
          GROUP BY m.message_id
          HAVING votes > 0
          ORDER BY votes DESC, m.message_id
          LIMIT :limit
          OFFSET :offset`,
          { limit, offset, userId: user.userId }
        )
      )[0];
    },
    async trendingMessages(
      _: any,
      { limit = 10, offset = 0 }: { limit: number; offset: number },
      { connection, user }: Context
    ) {
      const result = (
        await connection.query(
          `SELECT DISTINCT m.*, SUM(v.type = 'up') - SUM(v.type = 'down') AS votes
          FROM messages AS m
          LEFT JOIN votes AS v
            ON m.message_id = v.message_id
          JOIN group_user_relationships AS gur
            ON gur.group_id = m.group_id
          JOIN \`groups\` AS g
            ON g.group_id = m.group_id
          WHERE
            gur.user_id = :userId
            AND m.response_to_message_id IS NULL
            AND
              (g.visibility = 'open'
              OR g.created_by_user_id = :userId
              OR gur.type = 'admin'
              OR gur.type = 'member')
            AND v.created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
          GROUP BY m.message_id
          HAVING votes > 0
          ORDER BY votes DESC, m.message_id
          LIMIT :limit
          OFFSET :offset`,
          { limit, offset, userId: user.userId }
        )
      )[0];

      console.log(result);

      return result;
    }
  },
  Mutation: {
    async sendMessage(
      _: any,
      {
        message: {
          text,
          groupId,
          responseToMessageId,
          mentionedUserIds,
          mediaIds,
        },
      }: {
        message: {
          text: string;
          groupId: number;
          responseToMessageId: number;
          mentionedUserIds: number[];
          mediaIds: number[];
        };
      },
      context: Context
    ) {
      const { user, connection, pubsub, sendNotifications } = context;

      if (responseToMessageId != null) {
        // TODO: lot's of sql query like this, maybe we should make a helper function
        const _parentGroupId = (
          await connection.query(
            `SELECT group_id FROM messages WHERE message_id = ? `,
            [responseToMessageId]
          )
        )[0][0].group_id.toString();

        if (!!responseToMessageId && groupId !== _parentGroupId)
          throw new Error('Parent message is in different group!');
      }

      const messageId = (
        await connection.query(
          `INSERT INTO messages(user_id, text, response_to_message_id, group_id) VALUES(?, ?, ?, ?)`,
          [user.userId, text, responseToMessageId, groupId]
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

      const memberUserIdsToNotify = (
        await connection.query(
          `SELECT group_user_relationships.user_id, notification_frequency FROM group_user_relationships
          JOIN users ON group_user_relationships.user_id = users.user_id
          WHERE group_id = ?`,
          [createdMessage.group_id]
        )
      )[0]
        .filter(
          ({
            user_id: userId,
            notification_frequency: notificationFrequency,
          }: {
            user_id: number;
            notification_frequency: 'frequent' | 'low' | 'off';
          }) => {
            const willNotify =
              notificationFrequency === 'frequent' ||
              (notificationFrequency === 'low' && Math.random() < 0.2);
            return willNotify && userId !== user.userId;
          }
        )
        .map(({ user_id: userId }: { user_id: number }) => userId);

      const groupName = (
        await connection.query(
          `SELECT name FROM \`groups\` WHERE group_id = ?`,
          [createdMessage.group_id]
        )
      )[0][0].name;

      if (memberUserIdsToNotify.length > 0) {
        await sendNotifications({
          userIds: memberUserIdsToNotify,
          title: `New message in ${groupName}`,
          description: text,
          urlPath: `/group/${createdMessage.group_id}/message/${createdMessage.message_id}`,
        });
      }

      if (mentionedUserIds?.length > 0) {
        await sendNotifications({
          userIds: mentionedUserIds,
          title: `You were mentioned in ${groupName}`,
          description: text,
          urlPath: `/group/${createdMessage.group_id}/message/${createdMessage.message_id}`,
        });
      }

      return createdMessage;
    },
    async editMessage(
      _: any,
      {
        message: { messageId, text, mentionedUserIds, mediaIds },
      }: {
        message: {
          messageId: number;
          text: string;
          mentionedUserIds: number[];
          mediaIds: number[];
        };
      },
      { connection, pubsub }: Context
    ) {
      const groupId = (
        await connection.query(
          `SELECT group_id FROM messages WHERE message_id = ? `,
          [messageId]
        )
      )[0][0].group_id;
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
    async deleteMessage(
      _: any,
      { messageId }: { messageId: number },
      { connection, pubsub }: Context
    ) {
      const groupId = (
        await connection.query(
          `SELECT group_id FROM messages WHERE message_id = ? `,
          [messageId]
        )
      )[0][0].group_id;

      const messagesToDelete = await deleteMessageAndReplies(
        messageId,
        connection
      );

      pubsub.publish(`MESSAGES_DELETED_${groupId}`, {
        messagesDeleted: messagesToDelete,
      });
      return messagesToDelete;
    },
    async createReaction(
      _: any,
      { messageId, type }: { messageId: number; type: number },
      context: Context
    ) {
      const { connection, user, pubsub, sendNotifications } = context;
      const emoji = type ? String.fromCodePoint(type) : null;
      if (
        emoji != null &&
        (splitter.splitGraphemes(emoji).length !== 1 ||
          !/\p{Extended_Pictographic}/u.test(emoji))
      ) {
        throw new Error('Invalid emoji');
      }
      await connection.query(
        `INSERT INTO reactions(user_id, message_id, type) VALUES(:userId, :messageId, :type)
        ON DUPLICATE KEY UPDATE type = :type, updated_at = DEFAULT`,
        { userId: user.userId, messageId, type }
      );

      pubsub.publish(`MESSAGE_REACTED_${messageId}`, {
        messageReacted: resolvers.Message.reactions(
          { message_id: messageId },
          {},
          context
        ),
      });

      const reaction = await resolvers.Message.reaction(
        { message_id: messageId },
        {},
        context
      );

      if (type !== null) {
        const userName = (
          await connection.query(
            `SELECT user_name FROM users WHERE user_id = ?`,
            [user.userId]
          )
        )[0][0].user_name;

        const userId = (
          await connection.query(
            `SELECT user_id FROM messages WHERE message_id = ?`,
            [messageId]
          )
        )[0][0].user_id;

        const groupId = (
          await connection.query(
            `SELECT group_id FROM messages WHERE message_id = ?`,
            [messageId]
          )
        )[0][0].group_id;

        await sendNotifications({
          userIds: [userId],
          title: 'New reaction',
          description: `${userName} reacted to your message`,
          urlPath: `/group/${groupId}/message/${messageId}`,
        });
      }

      return reaction;
    },
    async createVote(
      _: any,
      { messageId, type }: { messageId: number; type: number },
      context: Context
    ) {
      const { connection, user, pubsub, sendNotifications } = context;

      const existingVotes = (
        await connection.query(
          `
        SELECT * FROM votes WHERE message_id = ?`,
          [messageId]
        )
      )[0];

      const willNotify = existingVotes.length === 0;

      await connection.query(
        `INSERT INTO votes(user_id, message_id, type) VALUES(:userId, :messageId, :type)
        ON DUPLICATE KEY UPDATE type = :type, updated_at = DEFAULT`,
        { userId: user.userId, messageId, type }
      );

      pubsub.publish(`MESSAGE_VOTED_${messageId}`, {
        messageVoted: {
          // don't use await here
          upVotes: resolvers.Message.upVotes(
            { message_id: messageId },
            {},
            context
          ),
          downVotes: resolvers.Message.downVotes(
            { message_id: messageId },
            {},
            context
          ),
        },
      });

      if (willNotify) {
        const message = (
          await connection.query(
            `SELECT user_id, group_id FROM messages WHERE message_id = ?`,
            [messageId]
          )
        )[0][0];

        const userName = (
          await connection.query(
            `SELECT user_name FROM users WHERE user_id = ?`,
            [user.userId]
          )
        )[0][0].user_name;

        await sendNotifications({
          userIds: [message.user_id],
          title: 'New vote on your message',
          description: `${userName} voted to your message`,
          urlPath: `/group/${message.group_id}/message/${messageId}`,
        });
      }

      const vote = resolvers.Message.vote(
        { message_id: messageId },
        {},
        context
      );

      return vote;
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: async (
        _: any,
        { groupId }: { groupId: number },
        { pubsub }: Context
      ) => {
        return pubsub.asyncIterator(`MESSAGE_ADDED_${groupId}`);
      },
    },
    messageEdited: {
      subscribe: async (
        _: any,
        { groupId }: { groupId: number },
        { pubsub }: Context
      ) => {
        return pubsub.asyncIterator(`MESSAGE_EDITED_${groupId}`);
      },
    },
    messagesDeleted: {
      subscribe: async (
        _: any,
        { groupId }: { groupId: number },
        { pubsub }: Context
      ) => {
        return pubsub.asyncIterator(`MESSAGES_DELETED_${groupId}`);
      },
    },
    messageReacted: {
      subscribe: async (
        _: any,
        { messageId }: { messageId: number },
        { pubsub }: Context
      ) => {
        return pubsub.asyncIterator(`MESSAGE_REACTED_${messageId}`);
      },
    },
    messageVoted: {
      subscribe: async (
        _: any,
        { messageId }: { messageId: number },
        { pubsub }: Context
      ) => {
        return pubsub.asyncIterator(`MESSAGE_VOTED_${messageId}`);
      },
    },
  },
};

export default resolvers;
