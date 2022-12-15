import { gql } from '@apollo/client';
import './UserInfos.scss';
import { UserFriends, UserFriendsGQLData } from './UserFriends';

export const UserInfos = ({
  user,
  user: { firstName, lastName, middleName, email, mobileNumber, intro },
}: UserInfosProps) => {
  return (
    <div className='user-infos'>
      <h1 className='name'>
        {firstName} {middleName} {lastName}
      </h1>
      <h2 className='email'>{email}</h2>
      <h2 className='mobile-number'>{mobileNumber}</h2>
      <p className='intro'>{intro}</p>
      <div className='friends'>
        <UserFriends user={user} />
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
      registratedAt
      lastLoginAt

      ...UserFriends
    }

    ${UserFriends.fragments.user}
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
  registratedAt: string;
  lastLoginAt: string;
} & UserFriendsGQLData;

type UserInfosProps = {
  user: UserInfosGQLData;
};
