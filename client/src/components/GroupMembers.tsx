import { gql } from '@apollo/client'
import React from 'react'
import { GroupQueryResultContext } from './Group'
import { GroupMemberElement } from './GroupMemberElement'
import './GroupMembers.scss'

import { GroupMemberElementGQLData } from './GroupMemberElement'

export const GroupMembers = () => {
  const { group: { members, admins } } = React.useContext(GroupQueryResultContext)!

  const users = [...members, ...admins]

  return (
    <div className='group-members'>
      <h2>
        Members
      </h2>
      {users.map((user) => (
        <GroupMemberElement key={user.userId} userId={user.userId} />
      ))}
    </div>
  )
}

GroupMembers.fragments = {
  group: gql`
    fragment GroupMembers on Group {
      members {
        userId
        ...GroupMemberElement
      }

      admins {
        userId
        ...GroupMemberElement
      }
    }

    ${GroupMemberElement.fragments.user}
  `,
}

export type GroupMembersGQLData = {
  members: {
    userId: string;
  } & GroupMemberElementGQLData[];
  admins: {
    userId: string;
  } & GroupMemberElementGQLData[];
}
