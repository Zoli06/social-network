module.exports = {
  isGroupCreator: async (userId, groupId, connection, _break) => {
    const group = (
      await connection.query(
        `SELECT * FROM groups
    WHERE group_id = ?`,
        [groupId]
      )
    )[0][0];

    if (group.created_by_user_id === userId) {
      return true;
    }
    if (_break) throw new Error("You are not the creator of this group!");
    return false;
  },

  isGroupAdmin: async (userId, groupId, connection, _break) => {
    const relationship = (
      await connection.query(
        `SELECT * FROM group_user_relationships
    WHERE group_id = ? AND user_id = ?`,
        [groupId, userId]
      )
    )[0][0];

    if (
      relationship?.type === "admin" ||
      (await module.exports.isGroupCreator(userId, groupId, connection, false))
    ) {
      return true;
    }
    if (_break) throw new Error("You are not an admin of this group!");
    return false;
  },

  isGroupMember: async (userId, groupId, connection, _break) => {
    const relationship = (
      await connection.query(
        `SELECT * FROM group_user_relationships
    WHERE group_id = ? AND user_id = ?`,
        [groupId, userId]
      )
    )[0][0];

    if (
      relationship?.type === "member" ||
      relationship?.type === "admin" ||
      (await module.exports.isGroupCreator(userId, groupId, connection, false))
    ) {
      return true;
    }
    if (_break) throw new Error("You are not a member of this group!");
    return false;
  },
};
