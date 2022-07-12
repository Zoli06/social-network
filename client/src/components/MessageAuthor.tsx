import React from 'react';
import './MessageAuthor.scss';
import { gql } from '@apollo/client';

export const MessageAuthor = ({
  user,
}: {
  user: {
    firstName: string;
    lastName: string;
    middleName: string;
    userName: string;
    intro: string;
    profileImage: {
      url: string;
    };
  };
}) => {
  return (
    <div className='message-author-container'>
      <div className='image-container'>
        {/* eslint-disable-next-line */}
        <img
          src={user.profileImage.url}
          className='profile-image'
          alt='profile image'
        />
      </div>
      <div className='text-container'>
        <p className='name'>
          <span className='first-name'>{user.firstName} </span>
          <span className='middle-name'>{user.middleName} </span>
          <span className='last-name'>{user.lastName}</span>
        </p>
        <p className='user-name'>@{user.userName}</p>
        <p className='intro'>{user.intro}</p>
      </div>
    </div>
  );
};

MessageAuthor.fragments = {
  user: gql`
    fragment MessageAuthor on User {
      firstName
      lastName
      middleName
      userName
      intro
      profileImage {
        url
      }
    }
  `,
};
