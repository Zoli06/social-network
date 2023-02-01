import React from 'react'
import { gql, useQuery } from '@apollo/client';
import { GroupMembers, GroupMembersGQLData } from '../Group/GroupMembers';

export const GroupMembersAdministration = ({
  groupId,
}: GroupMembersAdministrationProps) => {
  const { data, loading, error } = useQuery<GroupMembersAdministrationQueryGQLData>(
    GROUP_MEMBERS_ADMINISTRATION_QUERY,
    {
      variables: {
        groupId,
      },
    }
  );

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error(error);
    return <div>{error.message}</div>;
  }

  return (
    <div>
      <GroupMembers group={data!.group} />
    </div>
  );
}

const GROUP_MEMBERS_ADMINISTRATION_QUERY = gql`
  query GetGroupAdministration($groupId: ID!) {
    group(groupId: $groupId) {
      groupId
      name
      myRelationshipWithGroup {
        type
      }

      ...GroupMembersAsAdmin
    }
  }

  ${GroupMembers.fragments.groupAsAdmin}
`;

type GroupMembersAdministrationQueryGQLData = {
  group: {
    groupId: string;
    name: string;
    myRelationshipWithGroup: {
      type: string;
    }
  } & GroupMembersGQLData
};

type GroupMembersAdministrationProps = {
  groupId: string;
};
