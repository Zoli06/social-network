import { PubSub } from 'graphql-subscriptions';
import connection from '../db/sqlConnect';
import * as jwt from 'jsonwebtoken';

const pubsub = new PubSub();

const getUser = (token: string) => {
  const isNumeric = (str: any) => {
    if (typeof str != 'string') return false; // we only process strings!
    return (
      !isNaN(str as unknown as number) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str))
    ); // ...and ensure strings of whitespace fail
  };

  try {
    if (token) {
      try {
        return jwt.verify(token, process.env.JWT_SECRET!) as object;
      } catch (err) {
        if (process.env.NODE_ENV === 'development' && isNumeric(token))
          return { userId: parseInt(token) };
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

type Notification = {
  userIds: number[];
  title: string;
  description?: string;
  urlPath: string;
};

const sendNotifications = async (
  { userIds, title, description, urlPath }: Notification
) => {
  // convert connection to any to avoid type errors
  const _connection = connection as any;

  const result = (
    await _connection.query(
      `
      INSERT INTO notifications (title, description, url_path)
      VALUES (?, ?, ?)
    `,
      [title, description, urlPath]
    )
  )[0];

  const notificationId = result.insertId;

  await _connection.query(
    `
      INSERT INTO user_notifications (notification_id, user_id)
      VALUES ?
    `,
    [userIds.map((userId) => [notificationId, userId])]
  );

  return true;
};

const context = ({
  req,
  connectionParams,
}: {
  req: { get: (arg0: string) => string };
  connectionParams: { Authorization: string };
}): {
  user: { isAuthenticated: boolean; authenticate: () => void; userId: number };
  connection: any;
  pubsub: PubSub;
  sendNotifications: (notification: Notification) => Promise<boolean>;
} => {
  const token = (
    req?.get('Authorization') ||
    connectionParams?.Authorization ||
    ''
  )
    .replace('Bearer', '')
    .trim();

  const user = getUser(token) as { userId: number } | null;
  const isAuthenticated = !!user;
  return {
    user: {
      ...(user ? user : { userId: -1 }),
      isAuthenticated,
      // TODO: remove this
      authenticate: () => {
        if (!isAuthenticated) throw new Error('You are not authenticated!');
      },
    },
    connection,
    pubsub,
    sendNotifications,
  };
};

export default context;
export type Context = ReturnType<typeof context>;
