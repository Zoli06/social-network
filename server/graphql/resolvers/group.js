const {
  Query: { user: getUser },
} = require("./user.js");
const { Message: { responseTree: getMessageResponseTree }, Query: { message: getMessage } } = require("./message.js");
const { isGroupMember, isGroupAdmin, isGroupCreator } = require("../helpers/group.js");

module.exports = {
  Group: {
    async messages({ group_id }, { onlyInterestedInMessageId }, { user, connection }) {
      user.authenticate();
      if (onlyInterestedInMessageId) {
        const responseTree = await getMessageResponseTree({ message_id: onlyInterestedInMessageId }, {}, { user, connection });
        const message = await getMessage({}, { messageId: onlyInterestedInMessageId }, { user, connection });
        return [...responseTree, message];
      } else {
        return (
          await connection.query(
            `SELECT * FROM messages
            WHERE group_id = ?`,
            [group_id]
          )
        )[0];
      }
    },
    async createdByUser({ created_by_user_id }, _, { user, connection }) {
      user.authenticate();
      return await getUser(
        {},
        { userId: created_by_user_id },
        { user, connection }
      );
    },
    async members({ group_id }, _, { user, connection }) {
      user.authenticate();
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
    async memberRequests({ group_id }, _, { user, connection }) {
      user.authenticate();
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
    async bannedUsers({ group_id }, _, { user, connection }) {
      user.authenticate();
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
    async invitedUsers({ group_id }, _, { user, connection }) {
      user.authenticate();
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
    async admins({ group_id }, _, { user, connection }) {
      user.authenticate();
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
    async rejectedUsers({ group_id }, _, { user, connection }) {
      user.authenticate();
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
    async notificationFrequency({ group_id }, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT notification_frequency FROM group_user_relationships
          WHERE group_id = ? AND user_id = ?`,
          [group_id, user.id]
        )
      )[0][0];
    },
    async userRelationShipWithGroup({ group_id }, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT * FROM group_user_relationships
          WHERE group_id = ? AND user_id = ?`,
          [group_id, user.id]
        )
      )[0][0];
    }
  },
  GroupUserRelationship: {
    async user({ user_id }, _, { user, connection }) {
      user.authenticate();
      return await getUser(
        {},
        { userId: user_id },
        { user, connection }
      );
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
    }
  },
  Query: {
    async group(_, { groupId }, { user, connection }) {
      user.authenticate();

      const group = (
        await connection.query(`SELECT * FROM groups WHERE group_id = ?`, [
          groupId,
        ])
      )[0][0];

      await isGroupMember(user.id, group.group_id, connection, true);

      return group;
    },
  },
  Mutation: {
    async createGroup(
      _,
      { group: { name, visibility, description } },
      { user, connection }
    ) {
      user.authenticate();
      const groupId = (
        await connection.query(
          `INSERT INTO groups (created_by_user_id, name, visibility, description) VALUES (?, ?, ?, ?)`,
          [user.id, name, visibility, description]
        )
      )[0].insertId;
      return await module.exports.Query.group(
        {},
        { groupId },
        { user, connection }
      );
    },
    async updateGroup(
      _,
      { group: { name, visibility, description }, groupId },
      { user, connection }
    ) {
      user.authenticate();
      await connection.query(
        `UPDATE groups
          SET name = ?, visibility = ?, description = ?, updated_at = DEFAULT
          WHERE group_id = ?`,
        [name, visibility, description, groupId]
      );
      return await module.exports.Query.group(
        {},
        { groupId },
        { user, connection }
      );
    },
    async deleteGroup(_, { groupId }, { user, connection }) {
      user.authenticate();
      await isGroupCreator(user.id, groupId, connection, true);
      await connection.query(`DELETE FROM groups WHERE group_id = ?`, [
        groupId,
      ]);
      return groupId;
    },

    async sendGroupInvitation(_, { groupId, userId }, { user, connection }) {
      user.authenticate();
      await isGroupAdmin(user.id, groupId, connection, true);
      await connection.query(
        `INSERT INTO group_user_relationships (group_id, user_id, type) VALUES (?, ?, 'invited')
        ON DUPLICATE KEY UPDATE type = IF(type = null, 'invited', type)`,
        [groupId, userId]
      );
      return true;
    },
    async acceptGroupInvitation(_, { groupId }, { user, connection }) {
      user.authenticate();
      await connection.query(
        `UPDATE group_user_relationships SET type = 'member' WHERE user_id = ? AND group_id = ? AND type = 'invited'`,
        [user.id, groupId]
      );
      return true;
    },
    async rejectGroupInvitation(_, { groupId }, { user, connection }) {
      user.authenticate();
      await connection.query(
        `UPDATE group_user_relationships SET type = null WHERE user_id = ? AND group_id = ? AND type = 'invited'`,
        [user.id, groupId]
      );
      return true;
    },
    async banUser(_, { groupId, userId }, { user, connection }) {
      user.authenticate();
      await isGroupAdmin(user.id, groupId, connection, true);
      await connection.query(
        `INSERT INTO group_user_relationships (group_id, user_id, type) VALUES (?, ?, 'banned')
        ON DUPLICATE KEY UPDATE type = 'banned'`,
        [groupId, userId]
      );
      return true;
    },
    async unbanUser(_, { groupId, userId }, { user, connection }) {
      user.authenticate();
      await isGroupAdmin(user.id, groupId, connection, true);
      await connection.query(
        `UPDATE group_user_relationships SET type = null WHERE user_id = ? AND group_id = ? AND type = 'banned'`,
        [userId, groupId]
      );
      return true;
    },
    async addAdmin(_, { groupId, userId }, { user, connection }) {
      user.authenticate();
      await isGroupCreator(user.id, groupId, connection, true);
      await connection.query(
        `UPDATE group_user_relationships SET type = 'admin' WHERE user_id = ? AND group_id = ? AND type = 'member'`,
        [userId, groupId]
      );
      return true;
    },
    async removeAdmin(_, { groupId, userId }, { user, connection }) {
      user.authenticate();
      await isGroupCreator(user.id, groupId, connection, true);
      await connection.query(
        `UPDATE group_user_relationships SET type = 'member' WHERE user_id = ? AND group_id = ? AND type = 'admin'`,
        [userId, groupId]
      );
      return true;
    },
    async sendMemberRequest(_, { groupId }, { user, connection }) {
      user.authenticate();
      await connection.query(
        `INSERT INTO group_user_relationships (group_id, user_id, type) VALUES (?, ?, 'member_request', ?)
        ON DUPLICATE KEY UPDATE type = IF(type = null, 'member_request', type)`,
        [groupId, user.id]
      );
      return true;
    },
    async acceptMemberRequest(_, { groupId, userId }, { user, connection }) {
      user.authenticate();
      await isGroupAdmin(user.id, groupId, connection, true);
      await connection.query(
        `UPDATE group_user_relationships SET type = 'member' WHERE user_id = ? AND group_id = ? AND type = 'member_request'`,
        [userId, groupId]
      );
      return true;
    },
    async rejectMemberRequest(_, { groupId, userId }, { user, connection }) {
      user.authenticate();
      await isGroupAdmin(user.id, groupId, connection, true);
      await connection.query(
        `UPDATE group_user_relationships SET type = 'member_request_rejected' WHERE user_id = ? AND group_id = ? AND type = 'member_request'`,
        [userId, groupId]
      );
      return true;
    },
    async leaveGroup(_, { groupId }, { user, connection }) {
      user.authenticate();
      await connection.query(
        `UPDATE group_user_relationships SET type = null WHERE user_id = ? AND group_id = ? AND (type = 'admin' OR type = 'member')`,
        [user.id, groupId]
      );
      return true;
    },
    async kickUser(_, { groupId, userId }, { user, connection }) {
      user.authenticate();
      await isGroupAdmin(user.id, groupId, connection, true);
      await connection.query(
        `UPDATE group_user_relationships SET type = null WHERE user_id = ? AND group_id = ? AND (type = 'member' OR type = 'admin')`,
        [userId, groupId]
      );
      return true;
    },

    async setNotificationFrequency(
      _,
      { groupId, frequency },
      { user, connection }
    ) {
      user.authenticate();
      await connection.query(
        `UPDATE group_user_relationships SET notification_frequency = ? WHERE user_id = ? AND group_id = ?`,
        [frequency, user.id, groupId]
      );
      return true;
    },
  },
};
