import { gql } from '@apollo/client';
import { UserFriends, UserFriendsGQLData } from './UserFriends';
import { UserGroups, UserGroupsGQLData } from './UserGroups';

export const UserInfos = ({
  user,
  user: { email, mobileNumber, intro },
}: UserInfosProps) => {
  return (
    <div className='flex flex-col gap-2 w-full'>
      <h1 className='text-xl font-bold'>Email</h1>
      <p className='text-lg'>{email}</p>
      <h1 className='text-xl font-bold'>Mobile number</h1>
      <p className='text-lg'>{mobileNumber || <i>No mobile number provided</i>}</p>
      <h1 className='text-xl font-bold'>Intro</h1>
      <p className='text-lg'>{intro || <i>User doesn't have intro</i>}</p>
      <div>
        <UserFriends user={user} />
        <UserGroups user={user} />
      </div>
    </div>
  );
};

UserInfos.fragments = {
  user: gql`
    fragment UserInfos on User {
      userId
      intro
      mobileNumber
      email
      registratedAt

      ...UserFriends
      ...UserGroups
    }

    ${UserFriends.fragments.user}
    ${UserGroups.fragments.user}
  `,
};

export type UserInfosGQLData = {
  userId: string;
  intro?: string;
  mobileNumber?: string;
  email: string;
  registratedAt: string;
} & UserFriendsGQLData & UserGroupsGQLData;

type UserInfosProps = {
  user: UserInfosGQLData;
};
