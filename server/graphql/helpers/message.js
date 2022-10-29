const { isGroupAdmin } = require('./group');

module.exports = {
  isMessageCreator: async (userId, messageId, connection, isGroupAdminAcceptable, _break) => {
    const message = (await connection.query(
      `SELECT * FROM messages
      WHERE message_id = ?`,
      [messageId]
    ))[0][0];

    if (message?.user_id === userId) {
      return true;
    }

    if (isGroupAdminAcceptable && (await isGroupAdmin(userId, message?.group_id, connection, false))) {
      return true;
    }

    if (_break) throw new Error('You are not the creator of this message!');
    return false;
  }
}