import { gql } from '@apollo/client';
import { GroupCard, GroupCardGQLData } from '../Group/GroupCard';

export const UserGroups = ({
  user: { createdGroups, adminOfGroups: _adminOfGroups, memberOfGroups },
}: UserGroupsProps) => {
  const adminOfGroups = _adminOfGroups.filter(
    ({ group }) =>
      !createdGroups.some(({ group: g }) => g.groupId === group.groupId)
  );
  return (
    <div>
      <h1 className='text-xl font-bold'>Created groups</h1>
      <div
        className={`grid gap-2 grid-cols-1 ${
          createdGroups.length >= 2 ? 'md:grid-cols-2' : ''
        } ${createdGroups.length >= 3 ? 'lg:grid-cols-3' : ''}`}
      >
        {createdGroups.length > 0 ? (
          createdGroups.map(({ group }) => <GroupCard group={group} key={group.groupId} />)
        ) : (
          <i>User didn't create any groups</i>
        )}
      </div>
      <h1 className='text-xl font-bold'>Admin of groups</h1>
      <div
        className={`grid gap-2 grid-cols-1 ${
          adminOfGroups.length >= 2 ? 'md:grid-cols-2' : ''
        } ${adminOfGroups.length >= 3 ? 'lg:grid-cols-3' : ''}`}
      >
        {adminOfGroups.length > 0 ? (
          adminOfGroups.map(({ group }) => <GroupCard group={group} key={group.groupId} />)
        ) : (
          <i>User isn't admin of any groups</i>
        )}
      </div>
      <h1 className='text-xl font-bold'>Member of groups</h1>
      <div
        className={`grid gap-2 grid-cols-1 ${
          memberOfGroups.length >= 2 ? 'md:grid-cols-2' : ''
        } ${memberOfGroups.length >= 3 ? 'lg:grid-cols-3' : ''}`}
      >
        {memberOfGroups.length > 0 ? (
          memberOfGroups.map(({ group }) => <GroupCard group={group} key={group.groupId} />)
        ) : (
          <i>User isn't member of any groups</i>
        )}
      </div>
    </div>
  );
};

UserGroups.fragments = {
  user: gql`
    fragment UserGroups on User {
      userId
      createdGroups {
        group {
          ...GroupCard
        }
      }
      adminOfGroups {
        group {
          ...GroupCard
        }
      }
      memberOfGroups {
        group {
          ...GroupCard
        }
      }
    }

    ${GroupCard.fragments.group}
  `,
};

export type UserGroupsGQLData = {
  createdGroups: {
    group: GroupCardGQLData;
  }[];
  adminOfGroups: {
    group: GroupCardGQLData;
  }[];
  memberOfGroups: {
    group: GroupCardGQLData;
  }[];
};

type UserGroupsProps = {
  user: UserGroupsGQLData;
};
