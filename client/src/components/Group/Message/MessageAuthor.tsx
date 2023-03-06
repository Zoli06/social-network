import { gql } from '@apollo/client';
import { ProfileImage } from '../../User/ProfileImage';

export const MessageAuthor = ({
  user,
  user: { firstName, middleName, lastName, userName, intro },
}: MessageAuthorProps) => {
  return (
    <a className='flex gap-4' href={`/user/${user.userId}`}>
      <div>
        <ProfileImage user={user} size='sm' />
      </div>
      <div className='flex flex-col gap-1 justify-center'>
        <p className='text-lg font-semibold leading-5'>
          <span>{firstName} </span>
          <span>{middleName} </span>
          <span>{lastName}</span>
        </p>
        <p>@{userName}</p>
      </div>
    </a>
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
