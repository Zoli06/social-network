module.exports = {
  isMediaCreator: async (userId, mediaId, connection, _break) => {
    const media = (await connection.query(
      `SELECT * FROM media
    WHERE media_id = ?`,
      [mediaId]
    ))[0][0];

    if (media.created_by_user_id === userId) {
      return true;
    }
    if (_break) throw new Error('You are not the creator of this media!');
    return false;
  }
}