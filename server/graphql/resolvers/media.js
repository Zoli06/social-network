const { isMediaCreator } = require('../helpers/media.js');

module.exports = {
  Media: {
    async user({ media_id }, _, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(
          `SELECT * FROM medias
          JOIN users
          USING(user_id)
          WHERE media_id = ?`,
          [media_id]
        )
      )[0][0];
    },
  },
  Query: {
    async media(_, { mediaId }, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(`SELECT * FROM medias WHERE media_id = ?`, [
          mediaId,
        ])
      )[0][0];
    }
  },
  Mutation: {
    async createMedia(_, { media: { url, caption } }, { user, connection }) {
      user.authenticate();
      const mediaId = (
        await connection.query(
          `INSERT INTO medias (user_id, url, caption) VALUES (?, ?, ?)`,
          [user.id, url, caption]
        )
      )[0].insertId;
      return await module.exports.Query.media({}, { mediaId }, { user, connection });
    },
    async deleteMedia(_, { mediaId }, { user, connection }) {
      user.authenticate();
      await isMediaCreator(user.id, mediaId, connection, true);
      await connection.query(`DELETE FROM medias WHERE media_id = ?`, [mediaId]);
      return mediaId;
    }
  }
}