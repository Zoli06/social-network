import React, { useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import {
  SendPrivateMessage,
  SendPrivateMessageGQLData,
} from './SendPrivateMessage';
import {
  PrivateMessageActions,
  PrivateMessageActionsGQLData,
} from './PrivateMessageActions';
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
              return [...existingPrivateMessages, data!.privateMessage];
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
      updateQuery: async (
        prev: { myPrivateMessagesWithUser: any[] },
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
      updateQuery: async (
        prev: { myPrivateMessagesWithUser: any[] },
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
      updateQuery: async (
        prev: { myPrivateMessagesWithUser: any[] },
        {
          subscriptionData,
        }: { subscriptionData: { data: { privateMessageDeleted: string } } }
      ) => {
        if (!subscriptionData.data) return prev;
        const { privateMessageDeleted } = subscriptionData.data;

        return { ...prev, myPrivateMessagesWithUser: prev.myPrivateMessagesWithUser.filter((privateMessage) => privateMessage.privateMessageId !== privateMessageDeleted) };
      }
    });
  });

  return (
    <div className='private-messages-container'>
      {user.myPrivateMessagesWithUser.length > 0 && (
        <>
          <h2>Private Messages</h2>
          <ul>
            {user.myPrivateMessagesWithUser.map((privateMessage) => (
              <li key={privateMessage.privateMessageId}>
                <p>{privateMessage.text}</p>
                <p>
                  {new Date(privateMessage.createdAt).toLocaleDateString(
                    'en-us',
                    {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }
                  )}
                </p>
                <PrivateMessageActions privateMessage={privateMessage} />
              </li>
            ))}
          </ul>
        </>
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
        text
        createdAt
        ...PrivateMessageActions
      }
      ...SendPrivateMessage
    }

    ${SendPrivateMessage.fragments.user}
    ${PrivateMessageActions.fragments.privateMessage}
  `,
};

export type PrivateMessagesGQLData = {
  userId: string;
  myPrivateMessagesWithUser: ({
    privateMessageId: string;
    text: string;
    createdAt: string;
  } & PrivateMessageActionsGQLData)[];
} & SendPrivateMessageGQLData;

type PrivateMessagesProps = {
  user: PrivateMessagesGQLData;
  subscribeToMore: Function;
};
