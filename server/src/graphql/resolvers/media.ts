import { Context } from "../context";
import { deleteMedia } from "../helpers/media";

const resolvers = {
  Media: {
    async user(
      { media_id }: { media_id: number },
      _: any,
      { connection }: Context
    ) {
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
    async media(
      _: any,
      { mediaId }: { mediaId: number },
      { connection }: Context
    ) {
      return (
        await connection.query(`SELECT * FROM medias WHERE media_id = ?`, [
          mediaId,
        ])
      )[0][0];
    },
  },
  Mutation: {
    async createMedia(
      _: any,
      { media: { url, caption } }: { media: { url: string; caption: string } },
      context: Context
    ) {
      const { user, connection } = context;
      const mediaId = (
        await connection.query(
          `INSERT INTO medias (user_id, url, caption) VALUES (?, ?, ?)`,
          [user.userId, url, caption]
        )
      )[0].insertId;
      return await resolvers.Query.media({}, { mediaId }, context);
    },
    async deleteMedia(
      _: any,
      { mediaId }: { mediaId: number },
      { connection }: Context
    ) {
      await deleteMedia(mediaId, connection);

      return mediaId;
    },
  },
};

export default resolvers;
