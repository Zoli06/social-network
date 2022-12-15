import React from 'react';
import { useParams } from 'react-router-dom';
import { Group } from '../components/Group/Group';

export const GroupPage = () => {
  const { groupId, messageId, maxDepth } = useParams < {
    groupId: string;
    messageId?: string;
    maxDepth?: string;
  }>();
  return (
    <>
      {groupId && (
        <Group
          groupId={groupId}
          onlyInterestedInMessageId={messageId}
          maxDepth={maxDepth ? parseInt(maxDepth) : undefined}
        />
      )}
    </>
  );
};
