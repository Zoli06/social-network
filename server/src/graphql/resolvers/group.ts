import User from './user';
import Message from './message';
import { Context } from '../context';
import { sendNotifications } from '../helpers/notifications';
const { user: getUser } = User.Query;
const { message: getMessage } = Message.Query;
const { responseTree: getMessageResponseTree } = Message.Message;

const resolvers = {
  Group: {
    async messages(
      { group_id }: { group_id: number },
      {
        onlyInterestedInMessageId,
        maxDepth,
      }: { onlyInterestedInMessageId: number; maxDepth: number },
      context: Context
    ) {
      const { connection } = context;
      if (!onlyInterestedInMessageId && !maxDepth) {
        return (
          await connection.query(
            `SELECT * FROM messages
            WHERE group_id = ?`,
            [group_id]
          )
        )[0];
      }

      // TODO: Do something with this spaghetti code

      // convert undefined to null
      const _onlyInterestedInMessageId = onlyInterestedInMessageId || null;
      // if we interested in all messages, there is no root message
      const _maxDepth =
        _onlyInterestedInMessageId === null ? maxDepth + 1 : maxDepth;

      const responseTree = await getMessageResponseTree(
        { message_id: _onlyInterestedInMessageId },
        { maxDepth: _maxDepth },
        context
      );
      if (_onlyInterestedInMessageId !== null) {
        const message = await getMessage(
          {},
          { messageId: _onlyInterestedInMessageId },
          context
        );
        return [...responseTree, message];
      }
      return responseTree;
    },
    async creatorUser(
      { created_by_user_id }: { created_by_user_id: number },
      _: any,
      context: Context
    ) {
      return await getUser({}, { userId: created_by_user_id }, context);
    },
    async members(
      { group_id }: { group_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM group_user_relationships
          JOIN users
          USING (user_id)
          WHERE group_id = ? AND type = 'member'`,
          [group_id]
        )
      )[0];
    },
    async memberRequests(
      { group_id }: { group_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM group_user_relationships
          JOIN users
          USING (user_id)
          WHERE group_id = ? AND type = 'member_request'`,
          [group_id]
        )
      )[0];
    },
    async bannedUsers(
      { group_id }: { group_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM group_user_relationships
          JOIN users
          USING (user_id)
          WHERE group_id = ? AND type = 'banned'`,
          [group_id]
        )
      )[0];
    },
    async invitedUsers(
      { group_id }: { group_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM group_user_relationships
          JOIN users
          USING (user_id)
          WHERE group_id = ? AND type = 'invited'`,
          [group_id]
        )
      )[0];
    },
    async admins(
      { group_id }: { group_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM group_user_relationships
          JOIN users
          USING (user_id)
          WHERE group_id = ? AND type = 'admin'`,
          [group_id]
        )
      )[0];
    },
    async rejectedUsers(
      { group_id }: { group_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM group_user_relationships
          JOIN users
          USING (user_id)
          WHERE group_id = ? AND type = 'member_request_rejected'`,
          [group_id]
        )
      )[0];
    },
    async notificationFrequency(
      { group_id }: { group_id: number },
      _: any,
      { user, connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT notification_frequency FROM group_user_relationships
          WHERE group_id = ? AND user_id = ?`,
          [group_id, user.userId]
        )
      )[0][0];
    },
    async userRelationshipWithGroup(
      { group_id }: { group_id: number },
      { userId }: { userId: number },
      { user, connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM group_user_relationships
          WHERE group_id = ? AND user_id = ?`,
          [group_id, userId || user.userId]
        )
      )[0][0];
    },
    async myRelationshipWithGroup(
      { group_id }: { group_id: number },
      _: any,
      { user, connection }: Context
    ) {
      const relationship = (
        await connection.query(
          `SELECT * FROM group_user_relationships
          WHERE group_id = ? AND user_id = ?`,
          [group_id, user.userId]
        )
      )[0][0];

      if (relationship) {
        return relationship;
      } else {
        return {
          type: 'none',
          notification_frequency: 'none',
          group: {},
          user: {},
        };
      }
    },
  },
  GroupUserRelationship: {
    async user({ user_id }: { user_id: number }, _: any, context: Context) {
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
  },
  Query: {
    async group(
      _: any,
      { groupId }: { groupId: number },
      { connection }: Context
    ) {
      const group = (
        await connection.query(`SELECT * FROM \`groups\` WHERE group_id = ?`, [
          groupId,
        ])
      )[0][0];

      return group;
    },
  },
  Mutation: {
    async createGroup(
      _: any,
      {
        group: { name, visibility, description },
      }: { group: { name: string; visibility: string; description: string } },
      context: Context
    ) {
      const { connection, user } = context;
      const groupId = (
        await connection.query(
          `INSERT INTO \`groups\` (created_by_user_id, name, visibility, description) VALUES (?, ?, ?, ?)`,
          [user.userId, name, visibility, description]
        )
      )[0].insertId;
      return await resolvers.Query.group({}, { groupId }, context);
    },
    async updateGroup(
      _: any,
      {
        group: { name, visibility, description },
        groupId,
      }: {
        group: { name: string; visibility: string; description: string };
        groupId: number;
      },
      context: Context
    ) {
      const { connection } = context;
      await connection.query(
        `UPDATE \`groups\`
          SET name = ?, visibility = ?, description = ?, updated_at = DEFAULT
          WHERE group_id = ?`,
        [name, visibility, description, groupId]
      );
      return await resolvers.Query.group({}, { groupId }, context);
    },
    async deleteGroup(
      _: any,
      { groupId }: { groupId: number },
      context: Context
    ) {
      const { connection } = context;

      const groupName = connection.query(
        `SELECT name FROM groups
          WHERE group_id = ?`
      )[0][0].name;

      const userIds = (
        await connection.query(
          `SELECT user_id FROM group_user_relationships
          WHERE (type = 'member' OR type = 'admin') AND group_id = ?`,
          [groupId]
        )
      )[0].map((relationship: any) => relationship.user_id);

      // BUG: this won't work because of foreign key constraints
      // TODO: introduce a soft delete
      await connection.query(`DELETE FROM \`groups\` WHERE group_id = ?`, [
        groupId,
      ]);

      await sendNotifications(
        {
          userIds,
          title: `${groupName} has been deleted`,
          urlPath: `/`,
        },
        context
      );

      return groupId;
    },

    async sendGroupInvitation(
      _: any,
      { groupId, userId }: { groupId: number; userId: number },
      context: Context
    ) {
      const { connection, user } = context;

      await connection.query(
        `INSERT INTO group_user_relationships (group_id, user_id, type) VALUES (?, ?, 'invited')
        ON DUPLICATE KEY UPDATE type = IF(type IS null, 'invited', type)`,
        [groupId, userId]
      );

      const userName = connection.query(
        `SELECT user_name FROM users
          WHERE user_id = ?`,
        [user.userId]
      )[0][0].user_name;

      const groupName = connection.query(
        `SELECT name FROM groups
          WHERE group_id = ?`
      )[0][0].name;

      await sendNotifications(
        {
          userIds: [userId],
          title: `${userName} sent you an invitation to ${groupName}`,
          urlPath: `/group-info/${groupId}`,
        },
        context
      );

      return true;
    },
    async acceptGroupInvitation(
      _: any,
      { groupId }: { groupId: number },
      { user, connection }: Context
    ) {
      await connection.query(
        `UPDATE group_user_relationships SET type = 'member' WHERE user_id = ? AND group_id = ? AND type = 'invited'`,
        [user.userId, groupId]
      );

      return true;
    },
    async rejectGroupInvitation(
      _: any,
      { groupId }: { groupId: number },
      { user, connection }: Context
    ) {
      await connection.query(
        `UPDATE group_user_relationships SET type = null WHERE user_id = ? AND group_id = ? AND type = 'invited'`,
        [user.userId, groupId]
      );
      return true;
    },
    async banUser(
      _: any,
      { groupId, userId }: { groupId: number; userId: number },
      context: Context
    ) {
      const { connection } = context;

      await connection.query(
        `INSERT INTO group_user_relationships (group_id, user_id, type) VALUES (?, ?, 'banned')
        ON DUPLICATE KEY UPDATE type = 'banned'`,
        [groupId, userId]
      );

      const groupName = (
        await connection.query(
          `SELECT name FROM groups
          WHERE group_id = ?`
        )
      )[0][0].name;

      await sendNotifications(
        {
          userIds: [userId],
          title: `You has been banned from ${groupName}`,
          urlPath: `/group-info/${groupId}`,
        },
        context
      );

      return true;
    },
    async unbanUser(
      _: any,
      { groupId, userId }: { groupId: number; userId: number },
      context: Context
    ) {
      const { connection } = context;

      await connection.query(
        `UPDATE group_user_relationships SET type = null WHERE user_id = ? AND group_id = ? AND type = 'banned'`,
        [userId, groupId]
      );

      const groupName = (
        await connection.query(
          `SELECT name FROM groups
          WHERE group_id = ?`
        )
      )[0][0].name;

      await sendNotifications(
        {
          userIds: [userId],
          title: `You has been unbanned from ${groupName}`,
          description:
            'You can now send a member request and see if the admins let you go back',
          urlPath: `/group-info/${groupId}`,
        },
        context
      );

      return true;
    },
    async addAdmin(
      _: any,
      { groupId, userId }: { groupId: number; userId: number },
      context: Context
    ) {
      const { connection } = context;

      await connection.query(
        `UPDATE group_user_relationships SET type = 'admin' WHERE user_id = ? AND group_id = ? AND type = 'member'`,
        [userId, groupId]
      );

      const groupName = (
        await connection.query(
          `SELECT name FROM groups
          WHERE group_id = ?`
        )
      )[0][0].name;

      await sendNotifications(
        {
          userIds: [userId],
          title: `You are now an admin in ${groupName}`,
          urlPath: `/group-info/${groupId}`,
        },
        context
      );

      return true;
    },
    async removeAdmin(
      _: any,
      { groupId, userId }: { groupId: number; userId: number },
      context: Context
    ) {
      const { connection } = context;

      await connection.query(
        `UPDATE group_user_relationships SET type = 'member' WHERE user_id = ? AND group_id = ? AND type = 'admin'`,
        [userId, groupId]
      );

      const groupName = (
        await connection.query(
          `SELECT name FROM groups
          WHERE group_id = ?`
        )
      )[0][0].name;

      await sendNotifications(
        {
          userIds: [userId],
          title: `You are no longer an admin in ${groupName}`,
          urlPath: `/group-info/${groupId}`,
        },
        context
      );

      return true;
    },
    async sendMemberRequest(
      _: any,
      { groupId }: { groupId: number },
      context: Context
    ) {
      const { user, connection } = context;

      await connection.query(
        `INSERT INTO group_user_relationships (group_id, user_id, type) VALUES (?, ?, 'member_request')
        ON DUPLICATE KEY UPDATE type = IF(type IS null, 'member_request', type)`,
        [groupId, user.userId]
      );

      const userIds = [
        ...(
          await connection.query(
            `
            SELECT user_id FROM group_user_relationships
            WHERE type = 'admin' AND group_id = ?
          `,
            [groupId]
          )
        )[0].map(({ creator_user_id }: { creator_user_id: number }) => {
          return creator_user_id;
        }),
        ...(
          await connection.query(
            `
            SELECT creator_user_id FROM groups
            group_id = ?
          `,
            [groupId]
          )
        )[0][0]['creator_user_id'],
      ];

      const userName = (
        await connection.query(
          `
            SELECT user_name FROM users
            WHERE user_id = ?
          `,
          [user.userId]
        )
      );

      const groupName = (
        await connection.query(
          `SELECT name FROM groups
          WHERE group_id = ?`
        )
      )[0][0].name;

      await sendNotifications(
        {
          userIds,
          title: `${userName} sent a member request to ${groupName}`,
          urlPath: `/group-members/${groupId}`,
        },
        context
      );

      return true;
    },
    async acceptMemberRequest(
      _: any,
      { groupId, userId }: { groupId: number; userId: number },
      context: Context,
    ) {
      const { connection } = context;

      await connection.query(
        `UPDATE group_user_relationships SET type = 'member' WHERE user_id = ? AND group_id = ? AND type = 'member_request'`,
        [userId, groupId]
      );

      const groupName = (
        await connection.query(
          `SELECT name FROM groups
          WHERE group_id = ?`
        )
      )[0][0].name;

      await sendNotifications(
        {
          userIds: [userId],
          title: `Your member request has been accepted in ${groupName}`,
          urlPath: `/group/${groupId}`,
        },
        context
      );

      return true;
    },
    async rejectMemberRequest(
      _: any,
      { groupId, userId }: { groupId: number; userId: number },
      context: Context
    ) {
      const { connection } = context;

      await connection.query(
        `UPDATE group_user_relationships SET type = 'member_request_rejected' WHERE user_id = ? AND group_id = ? AND type = 'member_request'`,
        [userId, groupId]
      );

      const groupName = (
        await connection.query(
          `SELECT name FROM groups
          WHERE group_id = ?`
        )
      )[0][0].name;

      await sendNotifications(
        {
          userIds: [userId],
          title: `Your member request has been rejected in ${groupName}`,
          urlPath: `/group-info/${groupId}`,
        },
        context
      );

      return true;
    },
    async leaveGroup(
      _: any,
      { groupId }: { groupId: number },
      { user, connection }: Context
    ) {
      await connection.query(
        `UPDATE group_user_relationships SET type = null WHERE user_id = ? AND group_id = ? AND (type = 'admin' OR type = 'member')`,
        [user.userId, groupId]
      );
      return true;
    },
    async cancelMemberRequest(
      _: any,
      { groupId }: { groupId: number },
      { user, connection }: Context
    ) {
      await connection.query(
        `UPDATE group_user_relationships SET type = null WHERE user_id = ? AND group_id = ? AND (type = 'member_request')`,
        [user.userId, groupId]
      );
      return true;
    },
    async kickUser(
      _: any,
      { groupId, userId }: { groupId: number; userId: number },
      context: Context
    ) {
      const { connection } = context;

      await connection.query(
        `UPDATE group_user_relationships SET type = null WHERE user_id = ? AND group_id = ? AND (type = 'member' OR type = 'admin')`,
        [userId, groupId]
      );

      const groupName = (
        await connection.query(
          `SELECT name FROM groups
          WHERE group_id = ?`
        )
      )[0][0].name;

      await sendNotifications(
        {
          userIds: [userId],
          title: `You has been kicked from ${groupName}`,
          description: `Kick doesn't mean ban: try to send a member request`,
          urlPath: `/group-info/${groupId}`,
        },
        context
      );

      return true;
    },

    async setNotificationFrequency(
      _: any,
      { groupId, frequency }: { groupId: number; frequency: string },
      { user, connection }: Context
    ) {
      await connection.query(
        `UPDATE group_user_relationships SET notification_frequency = ? WHERE user_id = ? AND group_id = ?`,
        [frequency, user.userId, groupId]
      );
      return true;
    },
  },
};

export default resolvers;
