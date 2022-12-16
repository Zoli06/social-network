import './UserFriends.scss';
import { UserCard, UserCardGQLData } from './UserCard';
import { gql } from '@apollo/client';
import { Link } from 'react-router-dom';

export const UserFriends = ({ user: { friends } }: UserFriendsProps) => {
  return (
    <div className='friends-list-container'>
      {friends ? <h3>Friends</h3> : <h3>No friends</h3>}
      <div className='friends-list'>
        {friends?.map(({ user }) => (
          <div className='friend' key={user.userId}>
            <UserCard user={user} />
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
