import { gql, useMutation } from '@apollo/client';
import React from 'react';
import './UserActions.scss';

const CREATE_USER_USER_RELATIONSHIP_MUTATION = gql`
  mutation CreateUserUserRelationshipMutation(
    $userId: ID!
    $type: UserUserRelationshipInputType!
  ) {
    createUserUserRelationship(userId: $userId, type: $type) {
      type
    }
  }
`;

export const UserActions = ({ isMe, user }: UserActionsProps) => {
  const { myRelationshipWithUser: { type: relationshipType } } = user;
  const [createUserUserRelationship] = useMutation(
    CREATE_USER_USER_RELATIONSHIP_MUTATION,
    // update cache with new relationship
    {
      update(cache, { data: { createUserUserRelationship } }) {
        cache.modify({
          id: cache.identify(user),
          fields: {
            myRelationshipWithUser() {
              return {
                type: createUserUserRelationship.type,
              };
            },
          },
        });
      },
    }
  );

  const handleAddFriend = () => {
    createUserUserRelationship({
      variables: {
        userId: user.userId,
        type: 'friend',
      },
    });
  };

  const handleCancelFriendRequest = () => {
    createUserUserRelationship({
      variables: {
        userId: user.userId,
        type: 'none',
      },
    });
  };

  const handleAcceptFriendRequest = () => {
    createUserUserRelationship({
      variables: {
        userId: user.userId,
        type: 'friend',
      },
    });
  };

  const handleRemoveFriend = () => {
    createUserUserRelationship({
      variables: {
        userId: user.userId,
        type: 'none',
      },
    });
  };

  const handleBlock = () => {
    createUserUserRelationship({
      variables: {
        userId: user.userId,
        type: 'blocked',
      },
    });
  };

  const handleCancelBlocking = () => {
    createUserUserRelationship({
      variables: {
        userId: user.userId,
        type: 'none',
      },
    });
  };

  return (
    <div className='user-actions'>
      {isMe && (
        <div className='edit-profile'>
          <a href='/edit-profile'>Edit Profile</a>
        </div>
      )}
      {!isMe && (
        <div className='friend-actions'>
          <>
            {relationshipType === 'none' && (
              <>
                <button onClick={handleAddFriend}>Add Friend</button>
                <button onClick={handleBlock}>Block</button>
              </>
            )}
            {relationshipType === 'outgoing_friend_request' && (
              <button onClick={handleCancelFriendRequest}>Cancel Friend Request</button>
            )}
            {relationshipType === 'incoming_friend_request' && (
              <button onClick={handleAcceptFriendRequest}>Accept Friend Request</button>
            )}
            {relationshipType === 'friend' && (
              <button onClick={handleRemoveFriend}>Remove Friend</button>
            )}
            {relationshipType === 'outgoing_blocking' && (
              <button onClick={handleCancelBlocking}>Cancel Blocking</button>
            )}
            {relationshipType === 'incoming_blocking' &&
              {
                /* Logged in user is blocked by the user */
              }}
          </>
        </div>
      )}
    </div>
  );
};

UserActions.fragments = {
  user: gql`
    fragment UserActions on User {
      userId
      myRelationshipWithUser {
        type
      }
    }
  `,
};

export type UserActionsGQLData = {
  userId: string;
  myRelationshipWithUser: {
    type:
      | 'friend'
      | 'incoming_friend_request'
      | 'outgoing_friend_request'
      | 'incoming_blocking'
      | 'outgoing_blocking'
      | 'none';
  };
};

type UserActionsProps = {
  isMe: boolean;
  user: UserActionsGQLData;
};
