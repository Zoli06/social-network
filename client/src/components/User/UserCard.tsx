import { ProfileImage, ProfileImageGQLData } from './ProfileImage';
import { gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import { Artboard } from 'react-daisyui';

export const UserCard = ({ user }: UserCardProps) => {
  return (
    <Link to={`/user/${user.userId}`}>
      <Artboard className='rounded-md cursor-pointer p-4 flex gap-2'>
        <ProfileImage user={user} />
        <h1 className='text-xl font-bold'>
          {user.firstName} {user.middleName} {user.lastName}
        </h1>
      </Artboard>
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
      ...ProfileImage
    }

    ${ProfileImage.fragments.user}
  `,
};

export type UserCardGQLData = {
  userId: string;
  firstName: string;
  lastName: string;
  middleName: string;
} & ProfileImageGQLData;

type UserCardProps = {
  user: UserCardGQLData;
};
