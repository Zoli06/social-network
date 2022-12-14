import { gql } from '@apollo/client';
import React, { useContext } from 'react';
import './UserInfos.scss';
import { UserQueryResultContext } from './User';
import { ProfileImage } from './ProfileImage';

export const UserInfos = () => {
  const {
    user: {
      firstName,
      lastName,
      middleName,
      email,
      mobileNumber,
      intro,
      friends,
    },
  } = useContext(UserQueryResultContext!)!;

  return (
    <div className='user-infos'>
      <h1 className='name'>
        {firstName} {middleName} {lastName}
      </h1>
      <h2 className='email'>{email}</h2>
      <h2 className='mobile-number'>{mobileNumber}</h2>
      <p className='intro'>{intro}</p>
      <div className='friends'>
        {!friends || friends?.length === 0 ? (
          <h3>No friends</h3>
        ) : (
          <>
            <h3>Friends</h3>
            <div className='friends-list'>
              {friends?.map(({ user }) => (
                <div className='friend'>
                  <ProfileImage url={user.profileImage?.url} />
                  <div className='friend-name'>
                    {user.firstName} {user.middleName} {user.lastName}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

UserInfos.fragments = {
  user: gql`
    fragment UserInfos on User {
      userId
      firstName
      lastName
      middleName
      intro
      mobileNumber
      email
      registeredAt
      lastLoginAt
      friends {
        user {
          userId
          firstName
          lastName
          middleName
          profileImage {
            mediaId
            url
          }
        }
      }
    }
  `,
};

export type UserInfosGQLData = {
  userId: string;
  firstName: string;
  lastName: string;
  middleName: string;
  intro: string;
  mobileNumber: string;
  email: string;
  registeredAt: string;
  lastLoginAt: string;
  friends: {
    user: {
      userId: string;

      firstName: string;
      lastName: string;
      middleName: string;
      profileImage: {
        mediaId: string;
        url: string;
      };
    };
  }[];
};
