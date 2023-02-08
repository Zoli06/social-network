import { rule } from 'graphql-shield';
import context from '../context';

// TODO: refactor these functions
const findGroupId = async (
  args: {
    group_id?: number;
    groupId?: number;
    group?: {
      group_id?: number;
      groupId?: number;
    };
    message?: {
      group_id?: number;
      groupId?: number;
    };
    messageId?: number;
  },
  parent: {
    group_id?: number;
    groupId?: number;
    group?: {
      group_id?: number;
      groupId?: number;
    };
    message?: {
      group_id?: number;
      groupId?: number;
    };
  },
  connection: any
) => {
  const groupId =
    args?.groupId ||
    args?.group?.groupId ||
    args.message?.groupId ||
    parent?.group_id ||
    parent?.group?.group_id ||
    parent?.message?.group_id ||
    // These are less likely but I just want to be sure
    args.group_id ||
    args.group?.group_id ||
    args.message?.group_id ||
    parent?.groupId ||
    parent?.group?.groupId;
  parent?.message?.groupId;

  // maybe only messageId is provided
  if (!groupId && args?.messageId) {
    // get groupId from database
    const message = (
      await connection.query(`SELECT * FROM messages WHERE message_id = ?`, [
        args.messageId,
      ])
    )[0][0];

    return message.group_id;
  }

  return groupId;
};

const findUserId = async (
  args: {
    user_id?: number;
    userId?: number;
    user?: {
      user_id?: number;
      userId?: number;
    };
  },
  parent: {
    user_id?: number;
    userId?: number;
    user?: {
      user_id?: number;
      userId?: number;
    };
  },
  connection: any
) => {
  const userId =
    args?.userId ||
    args?.user?.userId ||
    parent?.user_id ||
    parent?.user?.user_id ||
    args.user_id ||
    args.user?.user_id ||
    parent?.userId ||
    parent?.user?.userId;
  return userId;
};

const findMessageId = async (
  args: {
    message_id?: number;
    messageId?: number;
    message?: {
      message_id?: number;
      messageId?: number;
    };
  },
  parent: {
    message_id?: number;
    messageId?: number;
    message?: {
      message_id?: number;
      messageId?: number;
    };
  },
  connection: any
) => {
  const messageId =
    args?.messageId ||
    args?.message?.messageId ||
    parent?.message_id ||
    parent?.message?.message_id ||
    args.message_id ||
    args.message?.message_id ||
    parent?.messageId ||
    parent?.message?.messageId;
  return messageId;
};

const findNotificationId = async (
  args: {
    notification_id?: number;
    notificationId?: number;
    notification?: {
      notification_id?: number;
      notificationId?: number;
    };
  },
  parent: {
    notification_id?: number;
    notificationId?: number;
    notification?: {
      notification_id?: number;
      notificationId?: number;
    };
  },
  connection: any
) => {
  const notificationId =
    args?.notificationId ||
    args?.notification?.notificationId ||
    parent?.notification_id ||
    parent?.notification?.notification_id ||
    args.notification_id ||
    args.notification?.notification_id ||
    parent?.notificationId ||
    parent?.notification?.notificationId;
  return notificationId;
};

export const isGroupCreator = rule()(async (parent, args, ctx, info) => {
  // If rule applied on Group type, groupId is in args.groupId
  // If rule applied on Message type, groupId is in args.group.groupId
  // TODO: Find a better way to do this
  // TODO: If there is no better way, add more supported types
  // Done in the same way in isGroupAdmin, isGroupMember
  const groupId = await findGroupId(args, parent, ctx.connection);
  const {
    user: { userId },
    connection,
  } = ctx;

  const group = (
    await connection.query(
      `SELECT * FROM \`groups\`
      WHERE group_id = ?`,
      [groupId]
    )
  )[0][0];

  if (group?.created_by_user_id === userId) {
    return true;
  }
  // console.log('isGroupCreator', false);
  return false;
});

export const isGroupAdmin = rule()(async (parent, args, ctx, info) => {
  const groupId = await findGroupId(args, parent, ctx.connection);
  const {
    user: { userId },
    connection,
  } = ctx;

  const relationship = (
    await connection.query(
      `SELECT * FROM group_user_relationships
      WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    )
  )[0][0];

  if (relationship?.type === 'admin') {
    return true;
  }
  // console.log('isGroupAdmin', false);
  return false;
});

export const isGroupMember = rule()(async (parent, args, ctx, info) => {
  const groupId = await findGroupId(args, parent, ctx.connection);
  const {
    user: { userId },
    connection,
  } = ctx;

  const relationship = (
    await connection.query(
      `SELECT * FROM group_user_relationships
      WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    )
  )[0][0];

  if (relationship?.type === 'member') {
    return true;
  }
  // console.log(userId, groupId, relationship, args, parent);
  // console.log('isGroupMember', false);
  return false;
});

export const isInvitedToGroup = rule()(async (parent, args, ctx, info) => {
  const groupId = await findGroupId(args, parent, ctx.connection);
  const {
    user: { userId },
    connection,
  } = ctx;

  const relationship = (
    await connection.query(
      `SELECT * FROM group_user_relationships
      WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    )
  )[0][0];

  if (relationship?.type === 'invited') {
    return true;
  }
  // console.log('isInvitedToGroup', false);
  return false;
});

export const isBannedFromGroup = rule()(async (parent, args, ctx, info) => {
  const groupId = await findGroupId(args, parent, ctx.connection);
  const {
    user: { userId },
    connection,
  } = ctx;

  const relationship = (
    await connection.query(
      `SELECT * FROM group_user_relationships
      WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    )
  )[0][0];

  if (relationship?.type === 'banned') {
    return true;
  }
  // console.log('isBannedFromGroup', false);
  return false;
});

export const isMessageCreator = rule()(async (parent, args, ctx, info) => {
  const messageId = await findMessageId(args, parent, ctx.connection);
  const {
    user: { userId },
    connection,
  } = ctx;
  const message = (
    await connection.query(
      `SELECT * FROM messages
        WHERE message_id = ?`,
      [messageId]
    )
  )[0][0];

  if (message?.user_id === userId) {
    return true;
  }
  // console.log('isMessageCreator', false);
  return false;
});

export const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  return ctx.user.isAuthenticated;
});

export const isUserViewingOwnThing = rule()(async (parent, args, ctx, info) => {
  const viewedUserId = await findUserId(args, parent, ctx.connection);
  const { userId } = ctx.user;

  // if (userId !== viewedUserId) {
  //   console.log(parent, args);
  //   console.log('isUserViewingOwnThing', false);
  // }
  return userId === viewedUserId;
});

export const didUserSentMemberRequest = rule()(
  async (parent, args, ctx, info) => {
    const { connection } = ctx;
    const { userId } = ctx.user;
    const groupId = await findGroupId(args, parent, connection);

    const relationship = (
      await connection.query(
        `SELECT * FROM group_user_relationships
      WHERE user_id = ? AND group_id = ?`,
        [userId, groupId]
      )
    )[0][0];

    if (relationship.type === 'member_request') {
      return true;
    }

    return false;
  }
);

export const isGroupVisibleToUser = rule()(async (parent, args, ctx, info) => {
  const { connection } = ctx;
  const { userId } = ctx.user;
  const groupId = await findGroupId(args, parent, connection);

  const group = (
    await connection.query(
      `SELECT visibility, created_by_user_id FROM \`groups\`
      WHERE group_id = ?`,
      [groupId]
    )
  )[0][0];

  if (group.visibility === 'hidden') {
    const relationshipType = (
      await connection.query(
        `SELECT type FROM group_user_relationships
        WHERE group_id = ? AND user_id = ?`,
        [groupId, userId]
      )
    )[0][0]['type'];

    if (
      ['invited', 'member', 'admin'].includes(relationshipType) ||
      group.created_by_user_id === userId
    ) {
      return true;
    }
    return false;
  }

  return true;
});

export const isUserCheckingOwnNotification = rule()(
  async (parent, args, ctx, info) => {
    const { connection } = ctx;
    const { userId } = ctx.user;

    const notificationId = await findNotificationId(args, parent, connection);

    const notification = (
      await connection.query(
        `SELECT * FROM notifications as n
        JOIN notification_user_connections as nuc
        ON n.notification_id = nuc.notification_id
        WHERE n.notification_id = ?
        `,
        [notificationId]
      )
    )[0][0];

    if (notification.user_id === userId) {
      return true;
    }

    return false;
  }
);

export const isMediaOwner = rule()(async (parent, args, ctx, info) => {
  const { mediaId } = args;
  const {
    user: { userId: userId1 },
    connection,
  } = ctx;

  // TODO: finish this

  //if (userId1 === userId2) {
  return true;
  //}
  return false;
});
