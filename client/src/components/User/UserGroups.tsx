import { gql } from '@apollo/client';
import { GroupCard, GroupCardGQLData } from '../Group/GroupCard';

const UserGroupCategory = ({
  title,
  groups,
  emptyGroupsMessage,
}: {
  title: string;
  groups: GroupUserRelationShip[];
  emptyGroupsMessage: string;
}) => {
  return (
    <div>
      <h1 className='text-xl font-bold'>{title}</h1>
      <div className='max-w-xl flex gap-4 overflow-x-auto'>
        {groups.length > 0 ? (
          groups.map(({ group }) => (
            <GroupCard group={group} key={group.groupId} />
          ))
        ) : (
          <i>{emptyGroupsMessage}</i>
        )}
      </div>
    </div>
  );
};

export const UserGroups = ({
  user: { createdGroups, adminOfGroups: _adminOfGroups, memberOfGroups },
}: UserGroupsProps) => {
  const adminOfGroups = _adminOfGroups.filter(
    ({ group }) =>
      !createdGroups.some(({ group: g }) => g.groupId === group.groupId)
  );
  return (
    <div className='flex gap-2 flex-col'>
      <UserGroupCategory
        title='Created groups'
        groups={createdGroups}
        emptyGroupsMessage="User didn't create any groups"
      />
      <UserGroupCategory
        title='Admin of groups'
        groups={adminOfGroups}
        emptyGroupsMessage="User isn't admin of any groups"
      />
      <UserGroupCategory
        title='Member of groups'
        groups={memberOfGroups}
        emptyGroupsMessage="User isn't member of any groups"
      />
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

type GroupUserRelationShip = {
  group: GroupCardGQLData;
};

export type UserGroupsGQLData = {
  createdGroups: GroupUserRelationShip[];
  adminOfGroups: GroupUserRelationShip[];
  memberOfGroups: GroupUserRelationShip[];
};

type UserGroupsProps = {
  user: UserGroupsGQLData;
};
