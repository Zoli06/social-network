import React from 'react'
import { useParams } from 'react-router-dom'
import { GroupMembersAdministration } from '../components/GroupMembersAdministration/GroupMembersAdministration'

export const GroupMembersAdministrationPage = () => {
  const { groupId } = useParams<{ groupId: string }>()

  return (
    <>
      {groupId && <GroupMembersAdministration groupId={groupId} />}
    </>
  )
}
