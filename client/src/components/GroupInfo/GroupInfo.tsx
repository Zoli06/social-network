import React from 'react';
import { gql, useQuery } from '@apollo/client';

export const GroupInfo = ({ groupId }: GroupInfoQueryGQLData) => {
  const { data, loading, error, subscribeToMore } =
    useQuery<GroupInfoQueryGQLData>(GROUP_INFO_QUERY, {
      variables: {
        groupId,
      },
    });

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.log(error);
  }

  console.log(data);

  return <div>test</div>;
};

const GROUP_INFO_QUERY = gql`
  query GetGroupInfo($groupId: ID!) {
    group(groupId: $groupId) {
      groupId
      name
      description
      createdAt
    }
  }
`;

type GroupInfoQueryGQLData = {
  groupId: string;
};
