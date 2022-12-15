import './UserFriends.scss';
import { ProfileImage } from './ProfileImage';
import { gql } from '@apollo/client';

export const UserCard = ({ user }: UserCardProps) => {
  return (
    <div className='user-card'>
      <ProfileImage user={user} />
      <p className='name'>
        {user.firstName} {user.middleName} {user.lastName}
      </p>
    </div>
  );
};

UserCard.fragments = {
  user: gql`
    fragment UserCard on User {
      userId
      firstName
      lastName
      middleName
      profileImage {
        mediaId
        url
      }
    }
  `,
};

export type UserCardGQLData = {
  userId: string;
  firstName: string;
  lastName: string;
  middleName: string;
  profileImage: {
    mediaId: string;
    url: string;
  };
};

type UserCardProps = {
  user: UserCardGQLData;
};
