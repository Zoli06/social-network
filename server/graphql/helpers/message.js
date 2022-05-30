module.exports = {
  isMessageCreator: async (userId, messageId, connection, _break) => {
    const message = (await connection.query(
      `SELECT * FROM messages
    WHERE id = ?`,
      [messageId]
    ))[0][0];

    if (message?.user_id === userId) {
      return true;
    }
    if (_break) throw new Error('You are not the creator of this message!');
    return false;
  }
}