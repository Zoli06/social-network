const { Query: { user: getUser } } = require('./user.js');

const isGroupCreator = async (userId, groupId) => {
  const group = await connection.query(
    `SELECT * FROM groups
    WHERE group_id = ?`,
    [groupId]
  )[0][0];

  return group.created_by_user_id === userId;
}

const isGroupAdmin = async (userId, groupId) => {
  const relationship = await connection.query(
    `SELECT * FROM group_user_relationships
    WHERE group_id = ? AND user_id = ?`,
    [groupId, userId]
  )[0][0];

  if (relationship) {
    return relationship.permission === 'admin';
  }
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
      await connection.query(
        `DELETE FROM groups WHERE group_id = ?`,
        [groupId]
      );
      return groupId;
    }
  }
}