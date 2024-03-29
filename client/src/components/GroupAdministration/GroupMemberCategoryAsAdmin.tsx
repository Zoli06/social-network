import { UserListElement, UserListElementGQLData } from '../User/UserListElement';
import {
  GroupMemberModify,
  GroupMemberModifyGQLData,
} from './GroupMemberModify';
import { gql } from '@apollo/client';

export const GroupMemberCategoryAsAdmin = ({
  users,
  title,
  noUserDescription,
  group,
}: GroupMemberCategoryAsAdminProps) => {
  return (
    <div>
      <h1 className='text-lg font-semibold'>{title}</h1>
      {users.length > 0 ? (
        users.map((user) => (
          <div key={user.userId} className='flex flex-row justify-between'>
            <UserListElement user={user} />
            <GroupMemberModify group={group} userId={user.userId} />
          </div>
        ))
      ) : (
        <div>
          <i>{noUserDescription}</i>
        </div>
      )}
    </div>
  );
};

GroupMemberCategoryAsAdmin.fragments = {
  group: gql`
    fragment GroupMemberCategoryAsAdminOnGroup on Group {
      groupId
      ...GroupMemberModify
    }

    ${GroupMemberModify.fragments.group}
  `,
  user: gql`
    fragment GroupMemberCategoryAsAdminOnUser on User {
      userId
      ...UserListElement
    }

    ${UserListElement.fragments.user}
  `,
};

export type GroupMemberCategoryAsAdminOnGroupGQLData = {
  groupId: number;
} & GroupMemberModifyGQLData;

export type GroupMemberCategoryAsAdminOnUserGQLData = {
  userId: number;
} & UserListElementGQLData;

type GroupMemberCategoryAsAdminProps = {
  users: GroupMemberCategoryAsAdminOnUserGQLData[];
  group: GroupMemberModifyGQLData;
  title: string;
  noUserDescription: string;
};
