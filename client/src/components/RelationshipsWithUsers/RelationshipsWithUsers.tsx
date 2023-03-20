import { gql, useQuery } from '@apollo/client';
import {
  RelationshipWithUserCategory,
  RelationshipWithUserCategoryGQLData,
} from './RelationshipWithUserCategory';

export const RelationshipsWithUsers = () => {
  const { data, loading, error } = useQuery<RelationshipsWithUsersQueryGQLData>(
    RELATIONSHIPS_WITH_USERS_QUERY
  );

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    // TODO: make error display consistent
    console.error(error);
    return <p>Error</p>;
  }

  const { incomingFriendRequests, outgoingFriendRequests, blockedUsers } =
    data!.me;

  return (
    <div className='bg-black/20 rounded-md p-4 flex flex-col gap-4'>
      <h1 className='text-3xl font-bold text-center'>My relationships with users</h1>
      <RelationshipWithUserCategory
        title='Incoming friend requests'
        users={incomingFriendRequests.map(({ targetUser }) => targetUser)}
        noUsersMessage='No incoming friend requests'
      />
      <RelationshipWithUserCategory
        title='Outgoing friend requests'
        users={outgoingFriendRequests.map(({ targetUser }) => targetUser)}
        noUsersMessage='No outgoing friend requests'
      />
      <RelationshipWithUserCategory
        title='Blocked users'
        users={blockedUsers.map(({ targetUser }) => targetUser)}
        noUsersMessage='No blocked users'
      />
    </div>
  );
};

// TODO: display incoming blockings after made a field for it on backend
const RELATIONSHIPS_WITH_USERS_QUERY = gql`
  query RelationshipsWithUsers {
    me {
      userId

      incomingFriendRequests {
        targetUser {
          userId
          ...RelationshipWithUserCategory
        }
      }

      outgoingFriendRequests {
        targetUser {
          userId
          ...RelationshipWithUserCategory
        }
      }

      blockedUsers {
        targetUser {
          userId
          ...RelationshipWithUserCategory
        }
      }
    }
  }

  ${RelationshipWithUserCategory.fragments.user}
`;

type RelationshipsWithUsersQueryGQLData = {
  me: {
    incomingFriendRequests: {
      targetUser: {
        userId: string;
      } & RelationshipWithUserCategoryGQLData;
    }[];
    outgoingFriendRequests: {
      targetUser: {
        userId: string;
      } & RelationshipWithUserCategoryGQLData;
    }[];
    blockedUsers: {
      targetUser: {
        userId: string;
      } & RelationshipWithUserCategoryGQLData;
    }[];
  }
};
