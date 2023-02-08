import { Context } from '../context';

export const sendNotifications = async (
  { userIds, title, description, urlPath }: Notification,
  { connection }: Context
) => {
  const result = (
    await connection.query(
      `
      INSERT INTO notifications (title, description, url_path)
      VALUES (?, ?, ?)
    `,
      [title, description, urlPath]
    )
  )[0];

  const notificationId = result.insertId;

  await connection.query(
    `
      INSERT INTO notification_user_connections (notification_id, user_id)
      VALUES ?
    `,
    [userIds.map((userId) => [notificationId, userId])]
  );

  return true;
};

type Notification = {
  userIds: number[];
  title: string;
  description?: string;
  urlPath: string;
};
