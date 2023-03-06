import { gql } from '@apollo/client';
import { ProfileImage } from '../User/ProfileImage';

export const GroupMember = ({ user }: GroupMemberProps) => {
  return (
    <a className='flex gap-4' href={`/user/${user.userId}`}>
      <div>
        <ProfileImage user={user} size='xs' />
      </div>
      <div className='flex flex-col justify-center'>
        <p className='text-lg font-semibold leading-5 overflow-ellipsis'>
          <span>{user.firstName} </span>
          <span>{user.middleName} </span>
          <span>{user.lastName}</span>
        </p>
        <p>@{user.userName}</p>
      </div>
    </a>
  );
};

GroupMember.fragments = {
  user: gql`
    fragment GroupMember on User {
      userId
      firstName
      lastName
      middleName
      userName
      profileImage {
        mediaId
        url
      }
    }
  `,
};

export type GroupMemberGQLData = {
  userId: string;
  firstName: string;
  lastName: string;
  middleName: string;
  userName: string;
  profileImage: {
    mediaId: string;
    url: string;
  };
};

type GroupMemberProps = {
  user: GroupMemberGQLData;
};
