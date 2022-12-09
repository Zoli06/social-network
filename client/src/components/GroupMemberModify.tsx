import { gql, useMutation } from '@apollo/client';
import React, { useState } from 'react';
import { GroupQueryResultContext } from './Group';
import './GroupMemberModify.scss';
import { UserContext } from '../App';
import { client } from '../index';

const BAN_USER_MUTATION = gql`
  mutation BanUser($groupId: ID!, $userId: ID!) {
    banUser(groupId: $groupId, userId: $userId)
  }
`;

const UNBAN_USER_MUTATION = gql`
  mutation UnbanUser($groupId: ID!, $userId: ID!) {
    unbanUser(groupId: $groupId, userId: $userId)
  }
`;

const KICK_USER_MUTATION = gql`
  mutation KickUser($groupId: ID!, $userId: ID!) {
    kickUser(groupId: $groupId, userId: $userId)
  }
`;

const ADD_ADMIN_MUTATION = gql`
  mutation AddAdmin($groupId: ID!, $userId: ID!) {
    addAdmin(groupId: $groupId, userId: $userId)
  }
`;

const REMOVE_ADMIN_MUTATION = gql`
  mutation RemoveAdmin($groupId: ID!, $userId: ID!) {
    removeAdmin(groupId: $groupId, userId: $userId)
  }
`;

const ACCEPT_MEMBER_REQUEST_MUTATION = gql`
  mutation AcceptMemberRequest($groupId: ID!, $userId: ID!) {
    acceptMemberRequest(groupId: $groupId, userId: $userId)
  }
`;

const REJECT_MEMBER_REQUEST_MUTATION = gql`
  mutation RejectMemberRequest($groupId: ID!, $userId: ID!) {
    rejectMemberRequest(groupId: $groupId, userId: $userId)
  }
`;

export const GroupMemberModify = ({ userId }: GroupMemberModifyProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [banUserMutaion] = useMutation(BAN_USER_MUTATION);
  const [unbanUserMutation] = useMutation(UNBAN_USER_MUTATION);
  const [kickUserMutation] = useMutation(KICK_USER_MUTATION);
  const [addAdminMutation] = useMutation(ADD_ADMIN_MUTATION);
  const [removeAdminMutation] = useMutation(REMOVE_ADMIN_MUTATION);
  const [acceptMemberRequestMutation] = useMutation(
    ACCEPT_MEMBER_REQUEST_MUTATION
  );
  const [rejectMemberRequestMutation] = useMutation(
    REJECT_MEMBER_REQUEST_MUTATION
  );

  const {
    group: {
      groupId,
      members,
      bannedUsers,
      admins,
      memberRequests,
      creatorUser: { userId: creatorUserId },
    },
  } = React.useContext(GroupQueryResultContext)!;
  const { userId: loggedInUserId } = React.useContext(UserContext)!;

  //#region Relationship changer functions
  const banUser = async () => {
    await banUserMutaion({
      variables: {
        groupId,
        userId,
      },

      update: (cache, { data: { banUser } }) => {
        if (banUser) {
          cache.modify({
            id: cache.identify({
              __typename: 'Group',
              groupId,
            }),
            fields: {
              bannedUsers: (existingBannedUsers = []) => {
                const newBannedUsers = existingBannedUsers.filter(
                  (existingBannedUser: any) =>
                    existingBannedUser.userId !== userId
                );
                newBannedUsers.push({
                  __typename: 'User',
                  userId,
                });
                return newBannedUsers;
              },
              members: (existingMembers = []) => {
                return existingMembers.filter(
                  (existingMember: any) => existingMember.userId !== userId
                );
              },
            },
          });
        }
      },
    });
  };

  const unbanUser = async () => {
    unbanUserMutation({
      variables: {
        groupId,
        userId,
      },

      update: (cache, { data: { unbanUser } }) => {
        if (unbanUser) {
          cache.modify({
            id: cache.identify({
              __typename: 'Group',
              groupId,
            }),
            fields: {
              bannedUsers: (existingBannedUsers = []) => {
                return existingBannedUsers.filter(
                  (existingBannedUser: any) =>
                    existingBannedUser.userId !== userId
                );
              },
              members: (existingMembers = []) => {
                const newMembers = existingMembers.filter(
                  (existingMember: any) => existingMember.userId !== userId
                );
                newMembers.push({
                  __typename: 'User',
                  userId,
                });
                return newMembers;
              },
            },
          });
        }
      },
    });
  };

  const kickUser = async () => {
    kickUserMutation({
      variables: {
        groupId,
        userId,
      },

      update: (cache, { data: { kickUser } }) => {
        if (kickUser) {
          cache.modify({
            id: cache.identify({
              __typename: 'Group',
              groupId,
            }),
            // bug here: ui doesn't update
            // no idea why
            // TODO: fix this
            fields: {
              members: (existingMembers = []) => {
                return existingMembers.filter(
                  (existingMember: any) => existingMember.userId !== userId
                );
              },
            },
          });
        }
      },
    });
  };

  const addAdmin = async () => {
    addAdminMutation({
      variables: {
        groupId,
        userId,
      },

      update: (cache, { data: { addAdmin } }) => {
        if (addAdmin) {
          cache.modify({
            id: cache.identify({
              __typename: 'Group',
              groupId,
            }),
            fields: {
              admins: (existingAdmins = []) => {
                const newAdmins = existingAdmins.filter(
                  (existingAdmin: any) => existingAdmin.userId !== userId
                );
                newAdmins.push({
                  __typename: 'User',
                  userId,
                });
                return newAdmins;
              },

              members: (existingMembers = []) => {
                return existingMembers.filter(
                  (existingMember: any) => existingMember.userId !== userId
                );
              },
            },
          });
        }
      },
    });
  };

  const removeAdmin = async () => {
    removeAdminMutation({
      variables: {
        groupId,
        userId,
      },

      update: (cache, { data: { removeAdmin } }) => {
        if (removeAdmin) {
          cache.modify({
            id: cache.identify({
              __typename: 'Group',
              groupId,
            }),
            fields: {
              admins: (existingAdmins = []) => {
                return existingAdmins.filter(
                  (existingAdmin: any) => existingAdmin.userId !== userId
                );
              },

              members: (existingMembers = []) => {
                const newMembers = existingMembers.filter(
                  (existingMember: any) => existingMember.userId !== userId
                );
                newMembers.push({
                  __typename: 'User',
                  userId,
                });
                return newMembers;
              },
            },
          });
        }
      },
    });
  };

  const acceptMemberRequest = async () => {
    acceptMemberRequestMutation({
      variables: {
        groupId,
        userId,
      },

      update: (cache, { data: { acceptMemberRequest } }) => {
        if (acceptMemberRequest) {
          cache.modify({
            id: cache.identify({
              __typename: 'Group',
              groupId,
            }),
            fields: {
              memberRequests: (existingMemberRequests = []) => {
                return existingMemberRequests.filter(
                  (existingMemberRequest: any) =>
                    existingMemberRequest.userId !== userId
                );
              },

              members: (existingMembers = []) => {
                const newMembers = existingMembers.filter(
                  (existingMember: any) => existingMember.userId !== userId
                );
                newMembers.push({
                  __typename: 'User',
                  userId,
                });
                return newMembers;
              },
            },
          });
        }
      },
    });
  };

  const rejectMemberRequest = async () => {
    rejectMemberRequestMutation({
      variables: {
        groupId,
        userId,
      },

      update: (cache, { data: { rejectMemberRequest } }) => {
        if (rejectMemberRequest) {
          cache.modify({
            id: cache.identify({
              __typename: 'Group',
              groupId,
            }),
            fields: {
              memberRequests: (existingMemberRequests = []) => {
                return existingMemberRequests.filter(
                  (existingMemberRequest: any) =>
                    existingMemberRequest.userId !== userId
                );
              },
            },
          });
        }
      },
    });
  };
  //#endregion

  const isLoggedInUserGroupCreator = creatorUserId === loggedInUserId;

  const isEditedUserAdmin = admins.some((admin) => admin.userId === userId);
  const isEditedUserBanned = bannedUsers.some(
    (bannedUser) => bannedUser.userId === userId
  );
  const isEditedUserMember = members.some((member) => member.userId === userId);
  const isEditedUserGroupCreator = creatorUserId === userId;
  const isMemberRequestIncoming = memberRequests.some(
    (memberRequest) => memberRequest.userId === userId
  );

  const displayedButtons = [
    {
      text: 'Ban',
      onClick: banUser,
      key: 'ban',
      condition: isEditedUserMember,
    },
    {
      text: 'Unban',
      onClick: unbanUser,
      key: 'unban',
      condition: isEditedUserBanned,
    },
    {
      text: 'Kick',
      onClick: kickUser,
      key: 'kick',
      condition: isEditedUserMember,
    },
    {
      text: 'Add Admin',
      onClick: addAdmin,
      key: 'addAdmin',
      condition: isEditedUserMember && isLoggedInUserGroupCreator,
    },
    {
      text: 'Remove Admin',
      onClick: removeAdmin,
      key: 'removeAdmin',
      condition:
        isEditedUserAdmin &&
        isLoggedInUserGroupCreator &&
        !isEditedUserGroupCreator,
    },
    {
      text: 'Accept Request',
      onClick: acceptMemberRequest,
      key: 'acceptRequest',
      condition: isMemberRequestIncoming,
    },
    {
      text: 'Reject Request',
      onClick: rejectMemberRequest,
      key: 'rejectRequest',
      condition: isMemberRequestIncoming,
    },
  ].filter((button) => button.condition);

  return (
    <div
      className='group-member-modify'
      tabIndex={0}
      onFocus={() => setIsEditing(true)}
      onBlur={() => setIsEditing(false)}
      {...(displayedButtons.length === 0 && { style: { display: 'none' } })}
    >
      <svg className='icon' viewBox='0 0 16 16'>
        <use className='icon' href='./assets/images/svg-bundle.svg#options' />
      </svg>
      {isEditing && (
        <div className='group-member-modify-popup'>
          {/* <div className="group-member-modify-popup-item" onClick={kickUser}>
            <p>Kick</p>
          </div>
          <div className="group-member-modify-popup-item" onClick={banUser}>
            <p>Ban</p>
          </div>
          <div className="group-member-modify-popup-item" onClick={addAdmin}>
            <p>Make Admin</p>
          </div> */}
          {displayedButtons.map((button) => (
            <div
              className='group-member-modify-popup-item'
              onClick={button.onClick}
              key={button.key}
            >
              <p>{button.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

GroupMemberModify.fragments = {
  group: gql`
    fragment GroupMemberModify on Group {
      groupId
      members {
        userId
      }
      bannedUsers {
        userId
      }
      admins {
        userId
      }
      memberRequests {
        userId
      }

      creatorUser {
        userId
      }
    }
  `,
};

type GroupMemberModifyProps = {
  userId: string;
};

export type GroupMemberModifyGQLData = {
  groupId: string;
  members: {
    userId: string;
  }[];
  bannedUsers: {
    userId: string;
  }[];
  admins: {
    userId: string;
  }[];
  memberRequests: {
    userId: string;
  }[];
  creatorUser: {
    userId: string;
  };
};
