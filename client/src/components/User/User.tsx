import { gql, useQuery } from '@apollo/client';
import './User.scss';
import { ProfileImage } from './ProfileImage';
import { UserInfos, UserInfosGQLData } from './UserInfos';
import { UserActions, UserActionsGQLData } from './UserActions';

// import { Theme, Button } from 'react-daisyui'

export const User = ({ userId, isMe = false }: UserProps) => {
  const { data, loading, error } = useQuery<UserQueryGQLData>(USER_QUERY, {
    variables: { userId },
  });

  if (loading) return <div>Loading...</div>;
  if (error) {
    console.error(error);
    return <div>Error</div>;
  }

  return (
    <div className='user'>
      <div className='user-actions-wrapper'>
        <UserActions isMe={isMe} user={data!.user} />
      </div>
      <div className='profile-image-wrapper'>
        <ProfileImage user={data!.user} />
      </div>
      <div className='user-infos-wrapper'>
        <UserInfos user={data!.user} />
      </div>
      {/* <Theme dataTheme="dark">
        <Button color="primary">Click me, dark!</Button>
      </Theme> */}
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
    }
  }

  ${UserInfos.fragments.user}
  ${UserActions.fragments.user}
`;

type UserQueryGQLData = {
  user: UserInfosGQLData & UserActionsGQLData & {
    userId: string;
    profileImage: {
      mediaId: string;
      url: string;
    };
  };
};

type UserProps = {
  userId: string;
  isMe?: boolean;
};
