import { PubSub } from 'graphql-subscriptions';
import connection from '../db/sql_connect';
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
          // XXX: BREAKING CHANGE! id renamed to userId!
          // TODO: Find dependent functions and update them
          return { userId: parseInt(token) };
      }
    }
    return null;
  } catch (error) {
    return null;
  }
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
      ...user? user : { userId: -1 },
      isAuthenticated,
      // TODO: remove this
      authenticate: () => {
        if (!isAuthenticated) throw new Error('You are not authenticated!');
      },
    },
    connection,
    pubsub,
  };
};

export default context;
export type Context = ReturnType<typeof context>;
