import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { GroupMemberElement, GroupMemberElementGQLData } from '../Group/GroupMemberElement';
import { GroupActions, GroupActionsGQLData } from './GroupActions';

export const GroupInfo = ({ groupId }: GroupInfoProps) => {
  const { data, loading, error, subscribeToMore } =
    useQuery<GroupInfoQueryGQLData>(GROUP_INFO_QUERY, {
      variables: {
        groupId,
      },
    });

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error(error);
  }

  const {
    name,
    description,
  } = data!.group;

  return (
    <div>
      <GroupActions group={data!.group} />
      <h1>{name}</h1>
      <h2>{description}</h2>
      <h2>Creator user</h2>
      <GroupMemberElement user={data!.group.creatorUser} />
    </div>
  );
};

const GROUP_INFO_QUERY = gql`
  query GetGroupInfo($groupId: ID!) {
    group(groupId: $groupId) {
      groupId
      name
      description
      creatorUser {
        ...GroupMemberElement
      }
      createdAt
      ...GroupActions
    }
  }

  ${GroupMemberElement.fragments.user}
  ${GroupActions.fragments.group}
`;

type GroupInfoQueryGQLData = {
  group: {
    groupId: string;
    name: string;
    description: string;
    creatorUser: GroupMemberElementGQLData;
    createdAt: string;
  } & GroupActionsGQLData;
};

type GroupInfoProps = {
  groupId: string;
};
