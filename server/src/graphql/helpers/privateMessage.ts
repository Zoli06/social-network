export const hardDeleteUserPrivateMessages = async(
  userId: number,
  connection: any
) => {
  await connection.query(
    `DELETE FROM private_messages WHERE sender_user_id = ? OR receiver_user_id = ?`,
    [userId, userId]
  );
}