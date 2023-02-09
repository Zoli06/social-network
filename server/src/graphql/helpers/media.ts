export const deleteMedia = async (mediaId: number, connection: any) => {
  await connection.query(`DELETE FROM message_medias WHERE media_id = ?`, [
    mediaId,
  ]);

  await connection.query(`UPDATE users SET profile_image_media_id = NULL WHERE profile_image_media_id = ?`, [
    mediaId,
  ]);

  await connection.query(`DELETE FROM medias WHERE media_id = ?`, [
    mediaId,
  ]);
};