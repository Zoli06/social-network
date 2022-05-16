const { Query: { user: getUser } } = require('./user.js');

const isGroupCreator = async (userId, groupId, _break) => {
  const group = await connection.query(
    `SELECT * FROM groups
    WHERE group_id = ?`,
    [groupId]
  )[0][0];

  if (group.created_by_user_id === userId) {
    return true;
  }
  if (_break) throw new Error('You are not the creator of this group!');
  return false;
}

const isGroupAdmin = async (userId, groupId, _break) => {
  const relationship = await connection.query(
    `SELECT * FROM group_user_relationships
    WHERE group_id = ? AND user_id = ?`,
    [groupId, userId]
  )[0][0];

  // Bug here: group creator is also an admin and member
  if (relationship?.type === 'admin' || relationship?.type === 'member' || isGroupCreator(userId, groupId, false)) {
    return true;
  }
  if (_break) throw new Error('You are not an admin of this group!');
  return false;
}

const isGroupMember = async (userId, groupId, _break) => {
  const relationship = await connection.query(
    `SELECT * FROM group_user_relationships
    WHERE group_id = ? AND user_id = ?`,
    [groupId, userId]
  )[0][0];

  if (relationship?.type === 'member' || relationship?.type === 'admin' || isGroupCreator(userId, groupId, false)) {
    return true;
  }
  if (_break) throw new Error('You are not a member of this group!');
  return false;
}

module.exports = {
  Group: {
    async messages(parent, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT * FROM messages
          WHERE group_id = ?`,
          [parent.group_id]
        )
      )[0];
    },
    async createdByUser(parent, _, { user, connection }) {
      user.authenticate();
      return await getUser(
        {},
        { userId: parent.created_by_user_id },
        { user, connection }
      );
    },
    async members(parent, _, { user, connection }) {
      user.authenticate();
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
    async memberRequests(parent, _, { user, connection }) {
      user.authenticate();
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
    async bannedUsers(parent, _, { user, connection }) {
      user.authenticate();
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
    async invitedUsers(parent, _, { user, connection }) {
      user.authenticate();
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
    async admins(parent, _, { user, connection }) {
      user.authenticate();
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
    async rejectedUsers(parent, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT * FROM group_user_relationships
          JOIN users
          USING (user_id)
          WHERE group_id = ? AND type = 'member_request_rejected'`,
          [parent.group_id]
        )
      )[0];
    },
    async notificationFrequency(parent, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT notification_frequency FROM group_user_relationships
          WHERE group_id = ? AND user_id = ?`,
          [parent.group_id, user.id]
        )
      )[0][0];
    }
  },
  Query: {
    async group(_, { groupId }, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(`SELECT * FROM groups WHERE group_id = ?`, [
          groupId,
        ])
      )[0][0];
    }
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
      return await module.exports.Query.group({}, { groupId }, { user, connection });
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
      return await module.exports.Query.group({}, { groupId }, { user, connection });
    },
    async deleteGroup(_, { groupId }, { user, connection }) {
      user.authenticate();
      await isGroupCreator(user.id, groupId, true);
      await connection.query(
        `DELETE FROM groups WHERE group_id = ?`,
        [groupId]
      );
      return groupId;
    },

    // Lot's of bugs here for example if user accept a invitation that doesn't exist he will be added to the group
    async sendGroupInvitation(_, { groupId, userId }, { user, connection }) {
      user.authenticate();
      await isGroupAdmin(user.id, groupId, true);
      await connection.query(
        `INSERT INTO group_user_relationships (group_id, user_id, type) VALUES (?, ?, 'invited')
        ON DUPLICATE KEY UPDATE type = 'invited'`,
        [groupId, userId]
      );
      return true;
    },
    async acceptGroupInvitation(_, { groupId }, { user, connection }) {
      user.authenticate();
      await connection.query(
        `INSERT INTO group_user_relationships (group_id, user_id, type) VALUES (?, ?, 'member')
        ON DUPLICATE KEY UPDATE type = 'member'`,
        [groupId, user.id]
      );
      return true;
    },
    async rejectGroupInvitation(_, { groupId }, { user, connection }) {
      user.authenticate();
      await connection.query(
        `INSERT INTO group_user_relationships (group_id, user_id, type) VALUES (?, ?, null)
        ON DUPLICATE KEY UPDATE type = null`,
        [groupId, user.id]
      );
      return true;
    },
    async banUser(_, { groupId, userId }, { user, connection }) {
      user.authenticate();
      await isGroupAdmin(user.id, groupId, true);
      await connection.query(
        `INSERT INTO group_user_relationships (group_id, user_id, type) VALUES (?, ?, 'banned')
        ON DUPLICATE KEY UPDATE type = 'banned'`,
        [groupId, userId]
      );
      return true;
    },
    async unbanUser(_, { groupId, userId }, { user, connection }) {
      user.authenticate();
      await isGroupAdmin(user.id, groupId, true);
      await connection.query(
        `INSERT INTO group_user_relationships (group_id, user_id, type) VALUES (?, ?, null)
        ON DUPLICATE KEY UPDATE type = null`,
        [groupId, userId]
      );
      return true;
    },
    async addAdmin(_, { groupId, userId }, { user, connection }) {
      user.authenticate();
      await isGroupCreator(user.id, groupId, true);
      await connection.query(
        `INSERT INTO group_user_relationships (group_id, user_id, type) VALUES (?, ?, 'admin')
        ON DUPLICATE KEY UPDATE type = 'admin'`,
        [groupId, userId]
      );
      return true;
    },
    async removeAdmin(_, { groupId, userId }, { user, connection }) {
      user.authenticate();
      await isGroupCreator(user.id, groupId, true);
      await connection.query(
        `INSERT INTO group_user_relationships (group_id, user_id, type) VALUES (?, ?, 'member')
        ON DUPLICATE KEY UPDATE type = 'member'`,
        [groupId, userId]
      );
      return true;
    },
    async sendMemberRequest(_, { groupId }, { user, connection }) {
      user.authenticate();
      await connection.query(
        `INSERT INTO group_user_relationships (group_id, user_id, type) VALUES (?, ?, 'member_request')
        ON DUPLICATE KEY UPDATE type = 'member_request'`,
        [groupId, user.id]
      );
      return true;
    },
    async acceptMemberRequest(_, { groupId, userId }, { user, connection }) {
      user.authenticate();
      await isGroupAdmin(user.id, groupId, true);
      await connection.query(
        `INSERT INTO group_user_relationships (group_id, user_id, type) VALUES (?, ?, 'member')
        ON DUPLICATE KEY UPDATE type = 'member'`,
        [groupId, userId]
      );
      return true;
    },
    async rejectMemberRequest(_, { groupId, userId }, { user, connection }) {
      user.authenticate();
      await isGroupAdmin(user.id, groupId, true);
      await connection.query(
        `INSERT INTO group_user_relationships (group_id, user_id, type) VALUES (?, ?, 'member_request_rejected')
        ON DUPLICATE KEY UPDATE type = 'member_request_rejected'`,
        [groupId, userId]
      );
      return true;
    },
    async leaveGroup(_, { groupId }, { user, connection }) {
      user.authenticate();
      await connection.query(
        `INSERT INTO group_user_relationships (group_id, user_id, type) VALUES (?, ?, null)
        ON DUPLICATE KEY UPDATE type = null`,
        [groupId, userId]
      );
      return true;
    }
  }
}