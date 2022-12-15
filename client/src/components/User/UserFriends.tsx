import './UserFriends.scss';
import { UserCard, UserCardGQLData } from './UserCard';
import { gql } from '@apollo/client';

export const UserFriends = ({ user: { friends } }: UserFriendsProps) => {
  return (
    <>
      {!friends || friends?.length === 0 ? (
        <h3>No friends</h3>
      ) : (
        <>
          <h3>Friends</h3>
          <div className='friends-list'>
            {friends?.map(({ user }) => (
              <UserCard key={user.userId} user={user} />
            ))}
          </div>
        </>
      )}
    </>
  );
};

UserFriends.fragments = {
  user: gql`
    fragment UserFriends on User {
      userId
      friends {
        user {
          ...UserCard
        }
      }
    }

    ${UserCard.fragments.user}
  `,
};

export type UserFriendsGQLData = {
  userId: string;
  friends: {
    user: UserCardGQLData;
  }[];
};

type UserFriendsProps = {
  user: UserFriendsGQLData;
};
