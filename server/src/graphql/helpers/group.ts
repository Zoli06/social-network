import { deleteAllMessagesFromGroup } from "./message";

export const deleteGroup = async (groupId: number, connection: any) => {
  await deleteAllGroupUserRelationshipFromGroup(groupId, connection);
  await deleteIndexAndBannerImage(groupId, connection);
  await deleteAllMessagesFromGroup(groupId, connection);

  await connection.query(`DELETE FROM \`groups\` WHERE group_id = ?`, [groupId]);
};

export const deleteUserGroups = async (userId: number, connection: any) => {
  const groups = (
    await connection.query(`SELECT * FROM \`groups\` WHERE created_by_user_id = ?`, [
      userId,
    ])
  )[0];

  for (const group of groups) {
    await deleteGroup(group.group_id, connection);
  }
}

export const deleteUserRelationshipsWithGroups = async(
  userId: number,
  connection: any
) => {
  await connection.query(
    `DELETE FROM group_user_relationships WHERE user_id = ?`,
    [userId]
  );
}

export const deleteIndexAndBannerImage = async (groupId: number, connection: any) => {
  await connection.query(`UPDATE \`groups\` SET index_image = NULL, banner_image = NULL WHERE group_id = ?`, [
    groupId,
  ]);
}

export const deleteAllGroupUserRelationshipFromGroup = async (groupId: number, connection: any) => {
  await connection.query(`DELETE FROM group_user_relationships WHERE group_id = ?`, [
    groupId,
  ]);
}
