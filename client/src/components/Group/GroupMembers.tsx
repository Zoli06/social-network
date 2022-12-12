import { gql } from "@apollo/client";
import React from "react";
import { GroupQueryResultContext } from "./Group";
import { GroupMemberElement } from "./GroupMemberElement";
import { GroupMemberModify } from "./GroupMemberModify";
import { UserContext } from "../../App";
import "./GroupMembers.scss";

import { GroupMemberElementGQLData } from "./GroupMemberElement";

export const GroupMembers = ({ className = "" }: GroupMembersProps) => {
  // _admins: with creator
  // admins: without creator
  const {
    group: {
      members,
      admins: _admins,
      memberRequests,
      rejectedUsers,
      bannedUsers,
      invitedUsers,
      userRelationShipWithGroup: { type: userRelationShipWithGroupType },
      creatorUser: { userId: creatorUserId },
    },
  } = React.useContext(GroupQueryResultContext)!;
  const userList = [
    ...members,
    ..._admins,
    ...memberRequests,
    ...rejectedUsers,
    ...bannedUsers,
    ...invitedUsers,
  ];
  const { userId: loggedInUserId } = React.useContext(UserContext)!;

  const admins = _admins.filter((admin) => admin.userId !== creatorUserId);

  const isAdmin = userRelationShipWithGroupType === "admin";
  const isGroupCreator = creatorUserId === loggedInUserId;

  return (
    <div className={`group-members ${className}`}>
      <h2>Creator</h2>
      <div className="group-member-element-container">
        <GroupMemberElement userId={creatorUserId} userList={userList} />
      </div>
      <h2>Admins</h2>
      {admins.length > 0 ? (
        admins.map((user) => (
          <div className="element" key={"GroupMemberElement" + user.userId}>
            <GroupMemberElement
              userId={user.userId}
              userList={userList}
            />
            {isGroupCreator && (
              <GroupMemberModify
                userId={user.userId}
              />
            )}
          </div>
        ))
      ) : (
        <div><p>No admins</p></div>
      )}
      <h2>Members</h2>
      {members.length > 0 ? (
        members.map((user) => (
          <div className="element" key={"GroupMemberElement" + user.userId}>
            <GroupMemberElement
              userId={user.userId}
              userList={userList}
            />
            {isAdmin && (
              <GroupMemberModify
                userId={user.userId}
              />
            )}
          </div>
        ))
      ) : (
        <div><p>No members</p></div>
      )}
      <h2>Member Requests</h2>
      {memberRequests.length > 0 ? (
        memberRequests.map((user) => (
          <div className="element" key={"GroupMemberElement" + user.userId}>
            <GroupMemberElement
              userId={user.userId}
              userList={userList}
            />
            {isAdmin && (
              <GroupMemberModify
                userId={user.userId}
              />
            )}
          </div>
        ))
      ) : (
        <div><p>No member requests</p></div>
      )}
      <h2>Rejected Users</h2>
      {rejectedUsers.length > 0 ? (
        rejectedUsers.map((user) => (
          <div className="element" key={"GroupMemberElement" + user.userId}>
            <GroupMemberElement
              userId={user.userId}
              userList={userList}
            />
          </div>
        ))
      ) : (
        <div><p>No rejected users</p></div>
      )}
      <h2>Banned Users</h2>
      {bannedUsers.length > 0 ? (
        bannedUsers.map((user) => (
          <div className="element" key={"GroupMemberElement" + user.userId}>
            <GroupMemberElement
              userId={user.userId}
              userList={userList}
            />
            {isAdmin && (
              <GroupMemberModify
                userId={user.userId}
              />
            )}
          </div>
        ))
      ) : (
        <div><p>No banned users</p></div>
      )}
      <h2>Invited Users</h2>
      {invitedUsers.length > 0 ? (
        invitedUsers.map((user) => (
          <div className="element" key={"GroupMemberElement" + user.userId}>
            <GroupMemberElement
              userId={user.userId}
              userList={userList}
            />
          </div>
        ))
      ) : (
        <div><p>No invited users</p></div>
      )}
    </div>
  );
};

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

      userRelationShipWithGroup {
        type
      }

      creatorUser {
        userId
      }
    }

    ${GroupMemberElement.fragments.user}
  `,
};

export type GroupMembersGQLData = {
  members: {
    userId: string;
  } & GroupMemberElementGQLData[];
  admins: {
    userId: string;
  } & GroupMemberElementGQLData[];
  memberRequests: {
    userId: string;
  } & GroupMemberElementGQLData[];
  rejectedUsers: {
    userId: string;
  } & GroupMemberElementGQLData[];
  bannedUsers: {
    userId: string;
  } & GroupMemberElementGQLData[];
  invitedUsers: {
    userId: string;
  } & GroupMemberElementGQLData[];
  userRelationShipWithGroup: {
    type: string;
  };
  creatorUser: {
    userId: string;
  };
};

export type GroupMembersProps = {
  className?: string;
};
