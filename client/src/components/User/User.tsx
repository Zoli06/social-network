import { gql, useQuery } from '@apollo/client';
import './User.scss';
import { ProfileImage } from './ProfileImage';
import { UserInfos, UserInfosGQLData } from './UserInfos';

export const User = ({ userId, isMe }: UserProps) => {
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
      <div className='profile-image-wrapper'>
        <ProfileImage user={data!.user} />
      </div>
      <div className='user-infos-wrapper'>
        <UserInfos user={data!.user} />
      </div>
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
    }
  }

  ${UserInfos.fragments.user}
`;

type UserQueryGQLData = {
  user: UserInfosGQLData & {
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
