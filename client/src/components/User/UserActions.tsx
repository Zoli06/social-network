import { gql, useMutation } from '@apollo/client';
import { Button } from 'react-daisyui';

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
  const {
    myRelationshipWithUser: { type: relationshipType },
  } = user;
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

  const handleDeclineFriendRequest = () => {
    createUserUserRelationship({
      variables: {
        userId: user.userId,
        type: 'none',
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
    <div>
      {isMe && (
        <a href='/me/edit'>
          <div className='flex flex-col gap-2'>
            <Button>Edit Profile</Button>
          </div>
        </a>
      )}
      {!isMe && (
        <div className='flex flex-col gap-2 items-center'>
          <>
            {relationshipType === 'none' && (
              <>
                <Button onClick={handleAddFriend}>Add Friend</Button>
                <Button onClick={handleBlock} color='secondary'>
                  Block
                </Button>
              </>
            )}
            {relationshipType === 'outgoing_friend_request' && (
              <Button onClick={handleCancelFriendRequest} color='secondary'>
                Cancel Friend Request
              </Button>
            )}
            {relationshipType === 'incoming_friend_request' && (
              <>
                <Button onClick={handleAcceptFriendRequest} color='success'>
                  Accept Friend Request
                </Button>
                <Button onClick={handleDeclineFriendRequest} color='secondary'>
                  Decline Friend Request
                </Button>
              </>
            )}
            {relationshipType === 'friend' && (
              <Button onClick={handleRemoveFriend} color='secondary'>
                Remove Friend
              </Button>
            )}
            {relationshipType === 'outgoing_blocking' && (
              <Button onClick={handleCancelBlocking}>Cancel Blocking</Button>
            )}
            {relationshipType === 'incoming_blocking' && (
              <p>You are blocked by this user</p>
            )}
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
  // TODO: derive isMe from user context
  isMe: boolean;
  user: UserActionsGQLData;
};
