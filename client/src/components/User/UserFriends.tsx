import { UserCard, UserCardGQLData } from './UserCard';
import { gql } from '@apollo/client';
import { useState } from 'react';
import { Button } from 'react-daisyui';

export const UserFriends = ({ user: { friends } }: UserFriendsProps) => {
  // TODO: don't hardcode it
  // default tailwind breakpoints
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  };

  // TODO: increase value when window is resized
  const startingMaxDisplayedFriends = (() => {
    if (window.innerWidth >= breakpoints.lg) {
      return 3;
    } else if (window.innerWidth >= breakpoints.md) {
      return 2;
    } else {
      return 1;
    }
  })();

  // TODO: add pagination
  const [maxDisplayedFriends, setMaxDisplayedFriends] = useState(startingMaxDisplayedFriends);

  return (
    <div>
      <h1 className='text-xl font-bold'>
        {friends.length > 0 ? 'Friends' : 'No friends'}
      </h1>
      <div className='max-w-xl flex gap-4 overflow-x-auto'>
        {friends?.slice(0, maxDisplayedFriends).map(({ targetUser }) => (
          <UserCard key={targetUser.userId} user={targetUser} />
        ))}
      </div>
      {friends?.length > maxDisplayedFriends && (
        <Button
          onClick={() => setMaxDisplayedFriends(maxDisplayedFriends + 5)}
          className='w-full mt-2'
        >
          Load more
        </Button>
      )}
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
