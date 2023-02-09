import { deleteGroup } from './group';

export const deleteUser = async (userId: number, connection: any) => {
  await connection.query(`DELETE FROM user_notifications WHERE user_id = ?`, [
    userId,
  ]);

  await connection.query(
    `DELETE FROM user_user_relationships WHERE initiating_user_id = :userId OR target_user_id = :userId`,
    {
      userId,
    }
  );

  const groups = (
    await connection.query(
      `SELECT * FROM \`groups\` WHERE creator_user_id = ?`,
      [userId]
    )
  )[0];

  for (const group of groups) {
    await deleteGroup(group.group_id, connection);
  }

  await connection.query(`DELETE FROM users WHERE user_id = ?`, [userId]);
};
