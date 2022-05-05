const connection = require('../../db/sql_connect.js');

const resolvers = {
  Group: {
    async messages(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM messages
          WHERE group_id = ?`,
          [parent.group_id]
        )
      )[0];
    },
    async createdByUser(parent, _, { user }) {
      authenticate(user);
      return await resolvers.Query.user(
        {},
        { userId: parent.created_by_user_id },
        { user }
      );
    },
    async members(parent, _, { user }) {
      authenticate(user);
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
    async memberRequests(parent, _, { user }) {
      authenticate(user);
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
    async bannedUsers(parent, _, { user }) {
      authenticate(user);
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
    async invitedUsers(parent, _, { user }) {
      authenticate(user);
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
    async admins(parent, _, { user }) {
      authenticate(user);
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
    async notificationFrequency(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT notification_frequency FROM group_user_relationships
          WHERE group_id = ? AND user_id = ?`,
          [parent.group_id, user.id]
        )
      )[0][0].notification_frequency;
    }
  },
  Query: {
    async group(_, { groupId }, { user }) {
      authenticate(user);
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
      { user }
    ) {
      authenticate(user);
      const groupId = (
        await connection.query(
          `INSERT INTO groups (created_by_user_id, name, visibility, description) VALUES (?, ?, ?, ?)`,
          [user.id, name, visibility, description]
        )
      )[0].insertId;

      return await resolvers.Query.group({}, { groupId }, { user });
    },
    async updateGroup(
      _,
      { group: { name, visibility, description }, groupId },
      { user }
    ) {
      authenticate(user);
      await connection.query(
        `UPDATE groups
          SET name = ?, visibility = ?, description = ?, updated_at = DEFAULT
          WHERE group_id = ?`,
        [name, visibility, description, groupId]
      );
      return await resolvers.Query.group({}, { groupId }, { user });
    },
    async deleteGroup(_, { groupId }, { user }) {
      authenticate(user);
      await connection.query(
        `DELETE FROM groups WHERE group_id = ?`,
        [groupId]
      );
      return groupId;
    }
  }
}

module.exports = resolvers;