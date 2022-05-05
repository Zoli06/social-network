const connection = require('../../db/sql_connect.js');

const resolvers = {
  Media: {
    async user(parent, _, { user }) {
      authenticate(user);
      return (
        await connection.query(
          `SELECT * FROM medias
          JOIN users
          USING(user_id)
          WHERE media_id = ?`,
          [parent.media_id]
        )
      )[0][0];
    },
  },
  Query: {
    async media(_, { mediaId }, { user }) {
      authenticate(user);
      return (
        await connection.query(`SELECT * FROM medias WHERE media_id = ?`, [
          mediaId,
        ])
      )[0][0];
    }
  },
  Mutation: {
    async createMedia(_, { media: { url, caption } }, { user }) {
      authenticate(user);
      const mediaId = (
        await connection.query(
          `INSERT INTO medias (user_id, url, caption) VALUES (?, ?, ?)`,
          [user.id, url, caption]
        )
      )[0].insertId;
      return await resolvers.Query.media({}, { mediaId }, { user });
    },
    async deleteMedia(_, { mediaId }, { user }) {
      authenticate(user);
      await connection.query(`DELETE FROM medias WHERE media_id = ?`, [mediaId]);
      return mediaId;
    }
  }
}

module.exports = resolvers;