import { deleteUserGroups, deleteUserRelationshipsWithGroups } from './group';
import { hardDeleteUserPrivateMessages } from './privateMessage';
import { deleteUserMedias } from './media';

export const deleteUserNotifications = async (userId: number, connection: any) => {
  await connection.query(`DELETE FROM user_notifications WHERE user_id = ?`, [
    userId,
  ]);
}

export const deleteUserReactions = async (userId: number, connection: any) => {
  await connection.query(`DELETE FROM reactions WHERE user_id = ?`, [userId]);
};

export const deleteUserRelationshipsWithUsers = async(
  userId: number,
  connection: any
) => {
  await connection.query(
    `DELETE FROM user_user_relationships WHERE initiating_user_id = :userId OR target_user_id = :userId`,
    {
      userId,
    }
  );
};

export const deleteUserVotes = async (userId: number, connection: any) => {
  await connection.query(`DELETE FROM votes WHERE user_id = ?`, [userId]);
};

// TODO: this fails for the first try, but works on the second try
// I think something is wrong with the recursion in the deleteAllMessagesFromGroup function
export const deleteUser = async (userId: number, connection: any) => {
  await connection.query(`DELETE FROM user_notifications WHERE user_id = ?`, [
    userId,
  ]);

  await deleteUserRelationshipsWithUsers(userId, connection);
  await hardDeleteUserPrivateMessages(userId, connection);
  await deleteUserMedias(userId, connection);
  await deleteUserNotifications(userId, connection);
  await deleteUserReactions(userId, connection);
  await deleteUserVotes(userId, connection);
  await deleteUserRelationshipsWithGroups(userId, connection);
  await deleteUserGroups(userId, connection);

  await connection.query(`DELETE FROM users WHERE user_id = ?`, [userId]);
};
