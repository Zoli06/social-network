import { GroupMemberCategory, GroupMemberCategoryGQLData } from './GroupMemberCategory';
import { gql } from '@apollo/client';

export const GroupMembers = ({
  group: {
    creatorUser,
    admins: adminsWithCreator,
    members,
  },
}: GroupMembersProps) => {
  const adminsWithoutCreator = adminsWithCreator.filter(
    (admin) => admin.userId !== creatorUser.userId
  );

  return (
    <div className='flex flex-row gap-4'>
      <div className='w-full'>
        <GroupMemberCategory users={[creatorUser]} title='Creator' noUserDescription='No creator' /* no way */ />
        <GroupMemberCategory users={adminsWithoutCreator} title='Admins' noUserDescription='No admins' />
        <GroupMemberCategory users={members} title='Members' noUserDescription='No members' />
      </div>
    </div>
  );
};

GroupMembers.fragments = {
  group: gql`
    fragment GroupMembers on Group {
      groupId
      creatorUser {
        userId
        ...GroupMemberCategory
      }

      admins {
        userId
        ...GroupMemberCategory
      }

      members {
        userId
        ...GroupMemberCategory
      }
    }

    ${GroupMemberCategory.fragments.user}
  `,
};

type User = {
  userId: string;
} & GroupMemberCategoryGQLData;

export type GroupMembersGQLData = {
  groupId: number;
  creatorUser: User;
  admins: User[];
  members: User[];
};

type GroupMembersProps = {
  group: GroupMembersGQLData;
};
