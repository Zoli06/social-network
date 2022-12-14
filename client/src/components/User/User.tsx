import { gql, useQuery } from '@apollo/client';
import React, { createContext } from 'react';
import './User.scss';
import { ProfileImage } from './ProfileImage';
import { UserInfos } from './UserInfos';

import { UserInfosGQLData } from './UserInfos';

export const UserQueryResultContext = createContext<
  UserQueryGQLData | undefined
>(undefined);

export const User = ({ userId }: UserProps) => {
  const { data, loading, error } = useQuery<UserQueryGQLData>(USER_QUERY, {
    variables: { userId },
  });

  if (loading) return <div>Loading...</div>;
  if (error) {
    console.error(error);
    return <div>Error</div>;
  }

  const { profileImage } = data!.user;

  return (
    <UserQueryResultContext.Provider value={data}>
      <div className='user'>
        <div className='profile-image-wrapper'>
          <ProfileImage url={profileImage?.url} />
        </div>
        <div className='user-infos-wrapper'>
          <UserInfos />
        </div>
      </div>
    </UserQueryResultContext.Provider>
  );
};

const USER_QUERY = gql`
  query User($userId: ID!) {
    user(userId: $userId) {
      userId
      firstName
      lastName
      middleName
      email
      profileImage {
        mediaId
        url
      }
    }
  }
`;

type UserProps = {
  userId: string;
};

type UserQueryGQLData = {
  user: UserInfosGQLData & {
    profileImage: {
      mediaId: string;
      url: string;
    };
  };
};
