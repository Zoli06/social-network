import { gql, useLazyQuery } from '@apollo/client';
import { Button, Input } from 'react-daisyui';
import {
  GroupInvitationPopupUser,
  GroupInvitationPopupUserGQLData,
} from './GroupInvitationPopupUser';
import { useEffect, useState } from 'react';
import { PopupWrapper } from '../../utilities/PopupWrapper';

const SEARCH_USERS_QUERY = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      ...GroupInvitationPopupUser
    }
  }

  ${GroupInvitationPopupUser.fragments.user}
`;

type SearchUsersQueryGQLData = {
  searchUsers: GroupInvitationPopupUserGQLData[];
};

export let openInvitationPopup = () => {};

export const GroupInvitationPopup = ({
  group,
  me,
}: GroupInvitationPopupProps) => {
  const [isOpen, setOpen] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [users, setUsers] = useState(
    me.friends.map((friend) => friend.targetUser)
  );

  const [searchUsers] = useLazyQuery<SearchUsersQueryGQLData>(
    SEARCH_USERS_QUERY,
    {
      variables: {
        query: searchString,
      },
      onCompleted: (data) => {
        if (searchString.length > 0) {
          setUsers(data.searchUsers);
        }
      },
    }
  );

  openInvitationPopup = () => setOpen(true);

  const userIdsNotToInvite = [
    ...group.admins.map((admin) => admin.userId),
    ...group.members.map((member) => member.userId),
    ...group.memberRequests.map((memberRequest) => memberRequest.userId),
    ...group.bannedUsers.map((bannedUser) => bannedUser.userId),
    ...group.invitedUsers.map((invitedUser) => invitedUser.userId),
    ...group.rejectedUsers.map((rejectedUser) => rejectedUser.userId),
    group.creatorUser.userId,
    me.userId,
  ];

  const usersToInvite = users.filter(
    (user) => !userIdsNotToInvite.includes(user.userId)
  );

  useEffect(() => {
    const resetUsers = () => {
      setUsers(me.friends.map((friend) => friend.targetUser));
    };

    if (searchString.length > 0) {
      searchUsers();
    } else {
      resetUsers();
    }
  }, [searchString, searchUsers, me.friends]);

  return (
    isOpen ? (
      <PopupWrapper>
        <div className='relative md:w-3/4 w-full max-w-lg md:min-h-[33vh] flex-grow md:flex-grow-0 bg-[#0d1117] rounded-md p-4'>
          <Button
            onClick={() => setOpen(false)}
            color='secondary'
            className='absolute top-4 right-4'
          >
            Close
          </Button>
          <div className='flex flex-col gap-4 items-center'>
            <h1 className='text-2xl mb-2 text-center'>Invite users to group</h1>
            <div>
              <Input
                placeholder='Search users'
                onChange={(e) => setSearchString(e.target.value)}
                value={searchString}
              />
            </div>
            <div className='flex justify-center flex-wrap gap-4 w-fit'>
              {usersToInvite.length > 0 ? (
                usersToInvite.map((user) => {
                  return (
                    <GroupInvitationPopupUser
                      user={user}
                      groupId={group.groupId}
                      key={user.userId}
                    />
                  );
                })
              ) : (
                <i className='text-center'>No users to invite</i>
              )}
            </div>
          </div>
        </div>
      </PopupWrapper>
    ) : null
  );
};

GroupInvitationPopup.fragments = {
  me: gql`
    fragment GroupInvitationPopupOnMe on User {
      userId
      friends {
        targetUser {
          userId
          ...GroupInvitationPopupUser
        }
      }
    }

    ${GroupInvitationPopupUser.fragments.user}
  `,

  group: gql`
    fragment GroupInvitationPopupOnGroup on Group {
      groupId
      creatorUser {
        userId
      }
      admins {
        userId
      }
      members {
        userId
      }
      memberRequests {
        userId
      }
      bannedUsers {
        userId
      }
      invitedUsers {
        userId
      }
      rejectedUsers {
        userId
      }
    }
  `,
};

export type GroupInvitationPopupOnMeGQLData = {
  userId: string;
  friends: {
    targetUser: {
      userId: string;
    } & GroupInvitationPopupUserGQLData;
  }[];
};

type GroupRelationshipUser = {
  userId: string;
};

export type GroupInvitationPopupOnGroupGQLData = {
  groupId: string;
  creatorUser: GroupRelationshipUser;
  admins: GroupRelationshipUser[];
  members: GroupRelationshipUser[];
  memberRequests: GroupRelationshipUser[];
  bannedUsers: GroupRelationshipUser[];
  invitedUsers: GroupRelationshipUser[];
  rejectedUsers: GroupRelationshipUser[];
};

type GroupInvitationPopupProps = {
  group: GroupInvitationPopupOnGroupGQLData;
  me: GroupInvitationPopupOnMeGQLData;
};
