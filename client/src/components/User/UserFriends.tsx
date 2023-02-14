import './UserFriends.scss';
import { UserCard, UserCardGQLData } from './UserCard';
import { gql } from '@apollo/client';

export const UserFriends = ({ user: { friends } }: UserFriendsProps) => {
  return (
    <div className='friends-list-container'>
      {friends.length > 0 ? <h3>Friends</h3> : <h3>No friends</h3>}
      <div className='friends-list'>
        {friends?.map(({ targetUser }) => (
          <div className='friend' key={targetUser.userId}>
            <UserCard user={targetUser} />
            </div>
        ))}
      </div>
    </div>
  );
};

UserFriends.fragments = {
  user: gql`
    fragment UserFriends on User {
      userId
      friends {
        targetUser {
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
    targetUser: UserCardGQLData;
  }[];
};

type UserFriendsProps = {
  user: UserFriendsGQLData;
};
