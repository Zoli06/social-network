import React from 'react';
import './MessageAuthor.scss';
import { gql } from '@apollo/client';
import { GroupQueryResultContext } from './Group';
import { ProfileImage } from './ProfileImage';

export const MessageAuthor = ({ messageId }: MessageAuthorProps) => {
  const { group: { messages } } = React.useContext(GroupQueryResultContext)!;

  const { user: {
    firstName,
    lastName,
    middleName,
    userName,
    intro,
    profileImage } } = messages.find((message) => message.messageId === messageId)!;

  return (
    <div className='message-author-container'>
      <div className='image-container'>
        <ProfileImage url={profileImage?.url} />
      </div>
      <div className='text-container'>
        <p className='name'>
          <span className='first-name'>{firstName} </span>
          <span className='middle-name'>{middleName} </span>
          <span className='last-name'>{lastName}</span>
        </p>
        <p className='user-name'>@{userName}</p>
        <p className='intro'>{intro}</p>
      </div>
    </div>
  );
};

MessageAuthor.fragments = {
  user: gql`
    fragment MessageAuthor on User {
      userId
      firstName
      lastName
      middleName
      userName
      intro
      profileImage {
        mediaId
        url
      }
    }
  `,
};

export type MessageAuthorGQLData = {
  user: {
    userId: string;
    firstName: string;
    lastName: string;
    middleName: string;
    userName: string;
    intro: string;
    profileImage: {
      mediaId: string;
      url: string;
    }
  };
}

export type MessageAuthorProps = {
  messageId: string;
}
