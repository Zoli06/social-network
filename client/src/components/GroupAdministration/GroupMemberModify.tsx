import { gql, useMutation } from '@apollo/client';
import { UserContext } from '../../App';
import { useContext } from 'react';
import { SvgButton } from '../../utilities/SvgButton';
import { Dropdown } from 'react-daisyui';

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

export const GroupMemberModify = ({
  group,
  userId,
}: GroupMemberModifyProps) => {
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
    groupId,
    members,
    bannedUsers,
    admins,
    memberRequests,
    creatorUser: { userId: creatorUserId },
  } = group;

  const { userId: loggedInUserId } = useContext(UserContext)!;

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
      // admins can ban everyone except other admins and the group creator. admins can be banned by the group creator
      condition: (isLoggedInUserGroupCreator || !isEditedUserAdmin)  && !isEditedUserBanned && !isEditedUserGroupCreator,
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
    <Dropdown {...(displayedButtons.length === 0 && { className: 'hidden' })}>
      <Dropdown.Toggle color='ghost'>
        <SvgButton icon='options' />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {displayedButtons.map((button) => (
          <Dropdown.Item onClick={button.onClick} key={button.key}>
            <p>{button.text}</p>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
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

type GroupMemberModifyProps = {
  userId: string;
  group: GroupMemberModifyGQLData;
};
