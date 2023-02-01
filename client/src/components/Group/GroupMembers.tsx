import { gql } from '@apollo/client';
import React from 'react';
import { GroupMemberElement } from './GroupMemberElement';
import {
  GroupMemberModify,
  GroupMemberModifyGQLData,
} from '../GroupMembersAdministration/GroupMemberModify';
import { UserContext } from '../../App';
import './GroupMembers.scss';

import { GroupMemberElementGQLData } from './GroupMemberElement';

export const GroupMembers = ({ className = '', group }: GroupMembersProps) => {
  // _admins: with creator
  // admins: without creator
  const {
    members,
    admins: _admins,
    memberRequests,
    rejectedUsers,
    bannedUsers,
    invitedUsers,
    myRelationshipWithGroup: { type: myRelationShipWithGroupType },
    creatorUser: { userId: creatorUserId },
  } = group;
  const userList = [
    ...members,
    ..._admins,
    ...(memberRequests || []),
    ...(rejectedUsers || []),
    ...(bannedUsers || []),
    ...(invitedUsers || []),
  ];
  const { userId: loggedInUserId } = React.useContext(UserContext)!;

  const admins = _admins.filter((admin) => admin.userId !== creatorUserId);

  const isAdmin = myRelationShipWithGroupType === 'admin';
  const isGroupCreator = creatorUserId === loggedInUserId;

  return (
    <div className={`group-members ${className}`}>
      <h2>Creator</h2>
      <div className='group-member-element-container'>
        <GroupMemberElement userId={creatorUserId} userList={userList} />
      </div>
      <h2>Admins</h2>
      {admins.length > 0 ? (
        admins.map((user) => (
          <div className='element' key={'GroupMemberElement' + user.userId}>
            <GroupMemberElement userId={user.userId} userList={userList} />
            {(isGroupCreator && memberRequests && rejectedUsers && bannedUsers && invitedUsers) && (
              <GroupMemberModify group={group as any} userId={user.userId} />
            )}
          </div>
        ))
      ) : (
        <div>
          <p>No admins</p>
        </div>
      )}
      <h2>Members</h2>
      {members.length > 0 ? (
        members.map((user) => (
          <div className='element' key={'GroupMemberElement' + user.userId}>
            <GroupMemberElement userId={user.userId} userList={userList} />
            {(isAdmin && memberRequests && rejectedUsers && bannedUsers && invitedUsers) && (
              <GroupMemberModify group={group as any} userId={user.userId} />
            )}
          </div>
        ))
      ) : (
        <div>
          <p>No members</p>
        </div>
      )}
      {(isAdmin && memberRequests && rejectedUsers && bannedUsers && invitedUsers) && (
        <>
          <h2>Member Requests</h2>
          {memberRequests.length > 0 ? (
            memberRequests.map((user) => (
              <div className='element' key={'GroupMemberElement' + user.userId}>
                <GroupMemberElement userId={user.userId} userList={userList} />
                {isAdmin && (
                  <GroupMemberModify group={group as any} userId={user.userId} />
                )}
              </div>
            ))
          ) : (
            <div>
              <p>No member requests</p>
            </div>
          )}

          <h2>Rejected Users</h2>
          {rejectedUsers.length > 0 ? (
            rejectedUsers.map((user) => (
              <div className='element' key={'GroupMemberElement' + user.userId}>
                <GroupMemberElement userId={user.userId} userList={userList} />
              </div>
            ))
          ) : (
            <div>
              <p>No rejected users</p>
            </div>
          )}
          
          <h2>Banned Users</h2>
          {bannedUsers.length > 0 ? (
            bannedUsers.map((user) => (
              <div className='element' key={'GroupMemberElement' + user.userId}>
                <GroupMemberElement userId={user.userId} userList={userList} />
                {isAdmin && (
                  <GroupMemberModify group={group as any} userId={user.userId} />
                )}
              </div>
            ))
          ) : (
            <div>
              <p>No banned users</p>
            </div>
          )}

          <h2>Invited Users</h2>
          {invitedUsers.length > 0 ? (
            invitedUsers.map((user) => (
              <div className='element' key={'GroupMemberElement' + user.userId}>
                <GroupMemberElement userId={user.userId} userList={userList} />
              </div>
            ))
          ) : (
            <div>
              <p>No invited users</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// TODO: move this back to dictionary
const groupAsMember = gql`
  fragment GroupMembers on Group {
    groupId
    members {
      userId
      ...GroupMemberElement
    }

    admins {
      userId
      ...GroupMemberElement
    }

    myRelationshipWithGroup {
      type
    }

    creatorUser {
      userId
    }
  }

  ${GroupMemberElement.fragments.user}
`;

const groupAsAdmin = gql`
  fragment GroupMembersAsAdmin on Group {
    groupId
    members {
      userId
      ...GroupMemberElement
    }

    admins {
      userId
      ...GroupMemberElement
    }

    myRelationshipWithGroup {
      type
    }

    creatorUser {
      userId
    }

    memberRequests {
      userId
      ...GroupMemberElement
    }

    rejectedUsers {
      userId
      ...GroupMemberElement
    }

    bannedUsers {
      userId
      ...GroupMemberElement
    }

    invitedUsers {
      userId
      ...GroupMemberElement
    }
  }

  ${GroupMemberElement.fragments.user}
`;

GroupMembers.fragments = {
  groupAsMember,
  groupAsAdmin,
};

type UserRelationShipWithGroup = {
  userId: string;
} & GroupMemberElementGQLData &
  GroupMemberModifyGQLData;

export type GroupMembersGQLData = {
  groupId: string;
  members: UserRelationShipWithGroup[];
  admins: UserRelationShipWithGroup[];
  memberRequests?: UserRelationShipWithGroup[];
  rejectedUsers?: UserRelationShipWithGroup[];
  bannedUsers?: UserRelationShipWithGroup[];
  invitedUsers?: UserRelationShipWithGroup[];
  myRelationshipWithGroup: {
    type:
      | 'member'
      | 'banned'
      | 'admin'
      | 'member_request'
      | 'member_request_rejected'
      | 'invited';
  };
  creatorUser: {
    userId: string;
  };
};

type GroupMembersProps = {
  group: GroupMembersGQLData;
  className?: string;
};
