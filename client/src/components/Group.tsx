import React, { useEffect, useState } from 'react';
import './Group.scss';
import { useQuery, useLazyQuery, gql } from '@apollo/client';
import { Message } from './Message';
import { MessageModify } from './MessageModify';
import { cache } from '../index';

import { MessageGQLData } from './Message';
import { MessageModifyGroupGQLData } from './MessageModify';

export const GroupQueryResultContext = React.createContext<GroupQueryGQLData | undefined>(undefined);

const GROUP_QUERY = gql`
  query GetGroup($groupId: ID!, $onlyInterestedInMessageId: ID, $maxDepth: Int) {
    group(groupId: $groupId) {
      messages(onlyInterestedInMessageId: $onlyInterestedInMessageId, maxDepth: $maxDepth) {
        ...Message
      }

      ...MessageModifyOnGroup

      groupId
      name
    }
  }

  ${Message.fragments.message}
  ${MessageModify.fragments.group}
`;

const MESSAGE_QUERY = gql`
  query GetMessage($messageId: ID!) {
    message(messageId: $messageId) {
      ...Message
    }
  }

  ${Message.fragments.message}
`;

const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription MessageAdded($groupId: ID!) {
    messageAdded(groupId: $groupId) {
      ...Message
    }
  }
`;

const MESSAGES_DELETED_SUBSCRIPTION = gql`
  subscription MessagesDeleted($groupId: ID!) {
    messagesDeleted(groupId: $groupId)
  }
`;

//create your forceUpdate hook
function useForceUpdate(){
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update state to force render
  // An function that increment 👆🏻 the previous state like here 
  // is better than directly setting `value + 1`
}

export const Group = ({ groupId, onlyInterestedInMessageId, maxDepth }: GroupProps) => {
  const { data, loading, error, subscribeToMore } = useQuery<GroupQueryGQLData>(GROUP_QUERY, {
    variables: {
      groupId,
      onlyInterestedInMessageId,
      maxDepth,
    },
  });

  const forceUpdate = useForceUpdate();

  const [getMessage] = useLazyQuery(MESSAGE_QUERY);

  useEffect(() => {
    subscribeToMore({
      document: MESSAGE_ADDED_SUBSCRIPTION,
      variables: {
        groupId,
      },
      updateQuery: (prev, { subscriptionData }: { subscriptionData: { data: { messageAdded: MessageGQLData } } }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        getMessage({
          variables: {
            messageId: subscriptionData.data.messageAdded,
          },
          onCompleted: (data) => {
            // push message to apollo cache in group messages

            const { message } = data;

            cache.writeQuery({
              query: GROUP_QUERY,
              variables: {
                groupId,
                onlyInterestedInMessageId,
                maxDepth,
              },
              data: {
                group: {
                  ...prev.group,
                  messages: [...prev.group.messages, message],
                },
              },
            });
          },
        });

        return prev;
      },
    });

    subscribeToMore({
      document: MESSAGES_DELETED_SUBSCRIPTION,
      variables: {
        groupId,
      },
      updateQuery: (prev, { subscriptionData }: { subscriptionData: { data: { messagesDeleted: string[] } } }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        // remove messages from apollo cache in group messages
        return {
          group: {
            ...prev.group,
            messages: prev.group.messages.filter((message) => !subscriptionData.data.messagesDeleted.includes(message.messageId)),
          },
        };
      }
    });
  }, [groupId, subscribeToMore, getMessage, onlyInterestedInMessageId, maxDepth]);

  if (loading) return <div>Loading...</div>;
  if (error) {
    console.log(error);
    return <div>Error!</div>;
  }

  return (
    <>
      <h1>
        Group: {data?.group.name} #{groupId}
      </h1>
      <GroupQueryResultContext.Provider value={data}>
      {data?.group.messages.map(
        (message) =>
          ((!onlyInterestedInMessageId && (message.responseTo === null)) || (onlyInterestedInMessageId && (onlyInterestedInMessageId === message.messageId))) && (
            <Message
              messageId={message.messageId}
              subscribeToMore={subscribeToMore}
              className='root-message'
              key={message.messageId}
            />
          )
        )}
      </GroupQueryResultContext.Provider>
    </>
  );
};

export type GroupQueryGQLData = {
  group: {
    messages: MessageGQLData[];
    groupId: string;
    name: string;
  } & MessageModifyGroupGQLData;
}

export type GroupProps = {
  groupId: string;
  onlyInterestedInMessageId?: string | null;
  maxDepth?: number;
}
