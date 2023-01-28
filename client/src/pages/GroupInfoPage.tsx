import React from 'react';
import { useParams } from 'react-router-dom';
import { GroupInfo } from '../components/GroupInfo/GroupInfo';

export const GroupInfoPage = () => {
  const {groupId} = useParams<{groupId: string}>();

  return (
    <>
      {groupId && (
        <GroupInfo groupId={groupId} />
      )}
    </>
  )
}
