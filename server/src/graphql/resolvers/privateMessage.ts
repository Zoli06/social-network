import User from './user';
import { Context } from '../context';
const { user: getUser } = User.Query;

export const resolvers = {
  PrivateMessage: {
    senderUser: async (
      { sender_user_id }: { sender_user_id: number },
      _: any,
      context: Context
    ) => {
      return await getUser(_, { userId: sender_user_id }, context);
    },
    receiverUser: async (
      { receiver_user_id }: { receiver_user_id: number },
      _: any,
      context: Context
    ) => {
      return await getUser(_, { userId: receiver_user_id }, context);
    },
  },
  Query: {
    privateMessage: async (
      _: any,
      { privateMessageId }: { privateMessageId: number },
      { connection }: Context
    ) => {
      const privateMessage = (
        await connection.query(
          `SELECT * FROM private_messages WHERE private_message_id = ?`,
          [privateMessageId]
        )
      )[0][0];
      return {
        ...privateMessage,
        text: privateMessage.is_deleted ? '' : privateMessage.text,
      };
    },
  },
  Mutation: {
    sendPrivateMessage: async (
      _: any,
      {
        privateMessage: { receiverUserId, text },
      }: { privateMessage: { receiverUserId: number; text: string } },
      context: Context
    ) => {
      const { user, connection, pubsub, sendNotifications } = context;
      const privateMessageId = (
        await connection.query(
          `INSERT INTO private_messages (sender_user_id, receiver_user_id, text) VALUES (?, ?, ?)`,
          [user.userId, receiverUserId, text]
        )
      )[0].insertId;

      pubsub.publish(
        `PRIVATE_MESSAGE_ADDED_FROM_${user.userId}_TO_${receiverUserId}`,
        {
          privateMessageAdded: privateMessageId,
        }
      );

      const { user_name: senderUserName } = await getUser(
        _,
        { userId: user.userId },
        context
      );

      await sendNotifications({
        userIds: [receiverUserId],
        title: `New private message from ${senderUserName}`,
        description: text,
        urlPath: `/user/${user.userId}`,
      });

      return await resolvers.Query.privateMessage(
        _,
        { privateMessageId },
        context
      );
    },
    editPrivateMessage: async (
      _: any,
      {
        privateMessage: { privateMessageId, text },
      }: { privateMessage: { privateMessageId: number; text: string } },
      context: Context
    ) => {
      const { connection, pubsub } = context;

      // TODO: move updated_at to mysql event
      await connection.query(
        `UPDATE private_messages SET text = ?, updated_at = DEFAULT WHERE private_message_id = ?`,
        [text, privateMessageId]
      );

      const privateMessage = await resolvers.Query.privateMessage(
        _,
        { privateMessageId },
        context
      );

      pubsub.publish(
        `PRIVATE_MESSAGE_EDITED_FROM_${privateMessage.sender_user_id}_TO_${privateMessage.receiver_user_id}`,
        {
          privateMessageEdited: privateMessageId,
        }
      );

      return privateMessage;
    },
    deletePrivateMessage: async (
      _: any,
      { privateMessageId }: { privateMessageId: number },
      { connection, pubsub }: Context
    ) => {
      const privateMessage = (
        await connection.query(
          `SELECT * FROM private_messages WHERE private_message_id = ?`,
          [privateMessageId]
        )
      )[0][0];

      await connection.query(
        `UPDATE private_messages SET text = "", is_deleted = 1 WHERE private_message_id = ?`,
        [privateMessageId]
      );

      pubsub.publish(
        `PRIVATE_MESSAGE_DELETED_FROM_${privateMessage.sender_user_id}_TO_${privateMessage.receiver_user_id}`,
        {
          privateMessageDeleted: privateMessageId,
        }
      );

      return true;
    },
  },
  Subscription: {
    privateMessageAdded: {
      subscribe: async (
        _: any,
        { senderUserId }: { senderUserId: number },
        { pubsub, user }: Context
      ) => {
        return pubsub.asyncIterator(
          `PRIVATE_MESSAGE_ADDED_FROM_${senderUserId}_TO_${user.userId}`
        );
      },
    },
    privateMessageEdited: {
      subscribe: async (
        _: any,
        { senderUserId }: { senderUserId: number },
        { pubsub, user }: Context
      ) => {
        return pubsub.asyncIterator(
          `PRIVATE_MESSAGE_EDITED_FROM_${senderUserId}_TO_${user.userId}`
        );
      },
    },
    privateMessageDeleted: {
      subscribe: async (
        _: any,
        { senderUserId }: { senderUserId: number },
        { pubsub, user }: Context
      ) => {
        return pubsub.asyncIterator(
          `PRIVATE_MESSAGE_DELETED_FROM_${senderUserId}_TO_${user.userId}`
        );
      },
    },
  },
};
