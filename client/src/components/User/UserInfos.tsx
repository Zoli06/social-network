import { gql } from '@apollo/client';
import { UserFriends, UserFriendsGQLData } from './UserFriends';
import { UserGroups, UserGroupsGQLData } from './UserGroups';

const UserInfo = ({ title, content }: { title: string; content?: string }) => {
  return (
    <div>
      <h1 className='text-xl font-bold'>{title}</h1>
      <p className='text-lg'>{content || <i>Not provided</i>}</p>
    </div>
  );
};

export const UserInfos = ({
  user,
  user: { email, mobileNumber, intro },
}: UserInfosProps) => {
  return (
    <div className='flex flex-col gap-2 w-full'>
      <UserInfo title='Email' content={email} />
      <UserInfo title='Mobile number' content={mobileNumber} />
      <UserInfo title='Intro' content={intro} />
      <UserFriends user={user} />
      <UserGroups user={user} />
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
} & UserFriendsGQLData &
  UserGroupsGQLData;

type UserInfosProps = {
  user: UserInfosGQLData;
};
