import { gql } from '@apollo/client';
import {
  GroupMemberCategoryAsAdmin,
  GroupMemberCategoryAsAdminOnGroupGQLData,
  GroupMemberCategoryAsAdminOnUserGQLData,
} from './GroupMemberCategoryAsAdmin';

export const GroupMembersAdministration = ({
  group: {
    creatorUser,
    admins: adminsWithCreator,
    members,
    memberRequests,
    rejectedUsers,
    bannedUsers,
    invitedUsers,
  },
  group,
}: GroupMembersAdministrationProps) => {
  const adminsWithoutCreator = adminsWithCreator.filter(
    (admin) => admin.userId !== creatorUser.userId
  );

  return (
    <div className='flex flex-row gap-4'>
      <div className='w-full'>
        <GroupMemberCategoryAsAdmin
          group={group}
          users={[creatorUser]}
          title='Creator'
          noUserDescription='No creator' /* there is always a creator */
        />
        <GroupMemberCategoryAsAdmin
          group={group}
          users={adminsWithoutCreator}
          title='Admins'
          noUserDescription='No admins'
        />
        <GroupMemberCategoryAsAdmin
          group={group}
          users={members}
          title='Members'
          noUserDescription='No members'
        />
        <GroupMemberCategoryAsAdmin
          group={group}
          users={memberRequests}
          title='Member requests'
          noUserDescription='No member requests'
        />
        <GroupMemberCategoryAsAdmin
          group={group}
          users={rejectedUsers}
          title='Rejected users'
          noUserDescription='No rejected users'
        />
        <GroupMemberCategoryAsAdmin
          group={group}
          users={bannedUsers}
          title='Banned users'
          noUserDescription='No banned users'
        />
        <GroupMemberCategoryAsAdmin
          group={group}
          users={invitedUsers}
          title='Invited users'
          noUserDescription='No invited users'
        />
      </div>
    </div>
  );
};

GroupMembersAdministration.fragments = {
  group: gql`
    fragment GroupMembersAdministration on Group {
      groupId

      creatorUser {
        userId
        ...GroupMemberCategoryAsAdminOnUser
      }

      admins {
        userId
        ...GroupMemberCategoryAsAdminOnUser
      }

      members {
        userId
        ...GroupMemberCategoryAsAdminOnUser
      }

      memberRequests {
        userId
        ...GroupMemberCategoryAsAdminOnUser
      }

      rejectedUsers {
        userId
        ...GroupMemberCategoryAsAdminOnUser
      }

      bannedUsers {
        userId
        ...GroupMemberCategoryAsAdminOnUser
      }

      invitedUsers {
        userId
        ...GroupMemberCategoryAsAdminOnUser
      }

      ...GroupMemberCategoryAsAdminOnGroup
    }

    ${GroupMemberCategoryAsAdmin.fragments.user}
    ${GroupMemberCategoryAsAdmin.fragments.group}
  `,
};

export type GroupMembersAdministrationGQLData = {
  groupId: number;
  creatorUser: GroupMemberCategoryAsAdminOnUserGQLData;
  admins: GroupMemberCategoryAsAdminOnUserGQLData[];
  members: GroupMemberCategoryAsAdminOnUserGQLData[];
  memberRequests: GroupMemberCategoryAsAdminOnUserGQLData[];
  rejectedUsers: GroupMemberCategoryAsAdminOnUserGQLData[];
  bannedUsers: GroupMemberCategoryAsAdminOnUserGQLData[];
  invitedUsers: GroupMemberCategoryAsAdminOnUserGQLData[];
} & GroupMemberCategoryAsAdminOnGroupGQLData;

type GroupMembersAdministrationProps = {
  group: GroupMembersAdministrationGQLData;
};
