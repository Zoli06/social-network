import { useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import {
  SendPrivateMessage,
  SendPrivateMessageGQLData,
} from './SendPrivateMessage';
import { PrivateMessage, PrivateMessageGQLData } from './PrivateMessage';
import { cache } from '../../index';

const PRIVATE_MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription PrivateMessageAddedSubscription($senderUserId: ID!) {
    privateMessageAdded(senderUserId: $senderUserId)
  }
`;

const PRIVATE_MESSAGE_EDITED_SUBSCRIPTION = gql`
  subscription PrivateMessageEditedSubscription($senderUserId: ID!) {
    privateMessageEdited(senderUserId: $senderUserId)
  }
`;

const PRIVATE_MESSAGE_DELETED_SUBSCRIPTION = gql`
  subscription PrivateMessageDeletedSubscription($senderUserId: ID!) {
    privateMessageDeleted(senderUserId: $senderUserId)
  }
`;

const PRIVATE_MESSAGE_QUERY = gql`
  query PrivateMessageQuery($privateMessageId: ID!) {
    privateMessage(privateMessageId: $privateMessageId) {
      privateMessageId
      text
      createdAt
    }
  }
`;

type PrivateMessageQueryGQLData = {
  privateMessage: {
    privateMessageId: string;
    text: string;
    createdAt: string;
  };
};

export const PrivateMessages = ({
  user,
  subscribeToMore,
}: PrivateMessagesProps) => {
  const [getPrivateMessage] = useLazyQuery<PrivateMessageQueryGQLData>(
    PRIVATE_MESSAGE_QUERY,
    {
      onCompleted: (data) => {
        cache.modify({
          id: cache.identify(user),
          fields: {
            myPrivateMessagesWithUser(existingPrivateMessages = []) {
              return [...existingPrivateMessages, data.privateMessage];
            },
          },
        });
      },
    }
  );

  useEffect(() => {
    subscribeToMore({
      document: PRIVATE_MESSAGE_ADDED_SUBSCRIPTION,
      variables: { senderUserId: user.userId },
      updateQuery: (
        prev: { user: PrivateMessagesGQLData },
        {
          subscriptionData,
        }: { subscriptionData: { data: { privateMessageAdded: string } } }
      ) => {
        if (!subscriptionData.data) return prev;
        const { privateMessageAdded } = subscriptionData.data;
        getPrivateMessage({
          variables: { privateMessageId: privateMessageAdded },
        });

        return { ...prev };
      },
    });

    subscribeToMore({
      document: PRIVATE_MESSAGE_EDITED_SUBSCRIPTION,
      variables: { senderUserId: user.userId },
      updateQuery: (
        prev: { user: PrivateMessagesGQLData },
        {
          subscriptionData,
        }: { subscriptionData: { data: { privateMessageEdited: string } } }
      ) => {
        if (!subscriptionData.data) return prev;
        const { privateMessageEdited } = subscriptionData.data;
        getPrivateMessage({
          variables: { privateMessageId: privateMessageEdited },
        });

        return { ...prev };
      },
    });

    subscribeToMore({
      document: PRIVATE_MESSAGE_DELETED_SUBSCRIPTION,
      variables: { senderUserId: user.userId },
      updateQuery: (
        prev: { user: PrivateMessagesGQLData },
        {
          subscriptionData,
        }: { subscriptionData: { data: { privateMessageDeleted: string } } }
      ) => {
        if (!subscriptionData.data) return prev;
        const { privateMessageDeleted } = subscriptionData.data;

        // set isDeleted to true
        return {
          ...prev,
          user: {
            ...prev.user,
            myPrivateMessagesWithUser: prev.user.myPrivateMessagesWithUser.map(
              (privateMessage) => {
                if (privateMessage.privateMessageId === privateMessageDeleted) {
                  return {
                    ...privateMessage,
                    isDeleted: true,
                  };
                }
                return privateMessage;
              }
            ),
          },
        };
      }
    });
  });

  return (
    <div className='w-full'>
      {user.myPrivateMessagesWithUser.length > 0 && (
        <div>
          <h1 className='text-xl font-bold text-center'>Private Messages</h1>
          <div className='flex flex-col'>
            {user.myPrivateMessagesWithUser.map((privateMessage) => (
              <div key={privateMessage.privateMessageId}>
                <PrivateMessage privateMessage={privateMessage} />
              </div>
            ))}
          </div>
        </div>
      )}
      <SendPrivateMessage user={user} />
    </div>
  );
};

PrivateMessages.fragments = {
  user: gql`
    fragment PrivateMessages on User {
      userId
      myPrivateMessagesWithUser {
        privateMessageId
        isDeleted
        ...PrivateMessage
      }
      ...SendPrivateMessage
    }

    ${SendPrivateMessage.fragments.user}
    ${PrivateMessage.fragments.privateMessage}
  `,
};

export type PrivateMessagesGQLData = {
  userId: string;
  myPrivateMessagesWithUser: ({
    privateMessageId: string;
    isDeleted: boolean;
  } & PrivateMessageGQLData)[];
} & SendPrivateMessageGQLData;

type PrivateMessagesProps = {
  user: PrivateMessagesGQLData;
  subscribeToMore: Function;
};
