import { useContext } from 'react';
import { gql, useQuery } from '@apollo/client';
import { ProfileImage } from './ProfileImage';
import { UserInfos, UserInfosGQLData } from './UserInfos';
import { UserActions, UserActionsGQLData } from './UserActions';
import { PrivateMessages, PrivateMessagesGQLData } from './PrivateMessages';
import {
  UserDisplayedName,
  UserDisplayedNameGQLData,
} from './UserDisplayedName';
import { UserContext } from '../../App';

// import { Theme, Button } from 'react-daisyui'

export const User = ({ userId }: UserProps) => {
  const { data, loading, error, subscribeToMore } = useQuery<UserQueryGQLData>(
    USER_QUERY,
    {
      variables: { userId },
    }
  );
  const { userId: loggedInUserId } = useContext(UserContext)!;

  const isMe = loggedInUserId === userId;

  if (loading) return <div>Loading...</div>;
  if (error) {
    console.error(error);
    return <div>Error</div>;
  }

  return (
    <div className='flex flex-col items-center justify-center p-4 rounded-md gap-2 min-w-0 md:min-w-[30rem] bg-black/20'>
      <div className='flex gap-2 flex-col'>
        <div className='flex justify-center flex-col items-center'>
          <ProfileImage user={data!.user} />
          <UserDisplayedName user={data!.user} />
        </div>
        <div>
          {/* TODO: move isMe to UserActions */}
          <UserActions isMe={isMe} user={data!.user} />
        </div>
      </div>
      <UserInfos user={data!.user} />
      <PrivateMessages user={data!.user} subscribeToMore={subscribeToMore} />
    </div>
  );
};

const USER_QUERY = gql`
  query User($userId: ID!) {
    user(userId: $userId) {
      userId
      profileImage {
        mediaId
        url
      }

      ...UserInfos
      ...UserActions
      ...PrivateMessages
      ...UserDisplayedName
    }
  }

  ${UserInfos.fragments.user}
  ${UserActions.fragments.user}
  ${PrivateMessages.fragments.user}
  ${UserDisplayedName.fragments.user}
`;

type UserQueryGQLData = {
  user: UserInfosGQLData &
    UserActionsGQLData &
    PrivateMessagesGQLData &
    UserDisplayedNameGQLData & {
      userId: string;
      profileImage: {
        mediaId: string;
        url: string;
      };
    };
};

type UserProps = {
  userId: string;
};
