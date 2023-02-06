import './GroupInfo.scss';

import React from 'react';
import { gql, useQuery } from '@apollo/client';
import {
  GroupMemberElement,
  GroupMemberElementGQLData,
} from '../Group/GroupMemberElement';
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
    if (error.message === 'Not Authorised!') {
      console.log(error);
      return <h1>This group is hidden</h1>;
    }
    console.error(error);
  }

  const { name, description, createdAt, visibility } = data!.group;

  return (
    <div>
      <GroupActions group={data!.group} />
      <h1>{name}</h1>
      <p>{description}</p>
      <p>Creator user</p>
      <GroupMemberElement user={data!.group.creatorUser} />
      <p>
        Created at:{' '}
        {new Date(createdAt).toLocaleDateString('en-us', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </p>
      <p>{visibility === 'hidden' ? 'This group is visible to members only' : 'This group is visible to everyone'}</p>
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
      visibility
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
    visibility: 'visible' | 'hidden';
  } & GroupActionsGQLData;
};

type GroupInfoProps = {
  groupId: string;
};
