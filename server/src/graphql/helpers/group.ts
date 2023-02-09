import { deleteAllMessagesFromGroup } from "./message";

export const deleteGroup = async (groupId: number, connection: any) => {
  await connection.query(`DELETE FROM group_user_relationships WHERE group_id = ?`, [
    groupId,
  ]);

  await deleteAllMessagesFromGroup(groupId, connection);

  await connection.query(`DELETE FROM \`groups\` WHERE group_id = ?`, [groupId]);
};
