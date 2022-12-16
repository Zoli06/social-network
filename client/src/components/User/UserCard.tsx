import './UserCard.scss';
import { ProfileImage } from './ProfileImage';
import { gql } from '@apollo/client';
import { Link } from 'react-router-dom';

export const UserCard = ({ user }: UserCardProps) => {
  return (
    <Link to={`/user/${user.userId}`} key={user.userId} className='user-card' style={{textDecoration: 'none'}}>
      <div className='profile-image-wrapper'>
        <ProfileImage user={user} />
      </div>
      <p className='name'>
        {user.firstName} {user.middleName} {user.lastName}
      </p>
    </Link>
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
