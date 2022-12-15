import './MessageAuthor.scss';
import { gql } from '@apollo/client';
import { ProfileImage } from '../User/ProfileImage';

export const MessageAuthor = ({
  user,
  user: { firstName, middleName, lastName, userName, intro },
}: MessageAuthorProps) => {
  return (
    <div className='message-author-container'>
      <div className='profile-image-wrapper'>
        <ProfileImage user={user} />
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
  userId: string;
  firstName: string;
  lastName: string;
  middleName: string;
  userName: string;
  intro: string;
  profileImage: {
    mediaId: string;
    url: string;
  };
};

type MessageAuthorProps = {
  user: MessageAuthorGQLData;
};
