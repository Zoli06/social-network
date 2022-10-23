import React, { useEffect } from 'react';
import './Group.scss';
import { useQuery, useLazyQuery, gql } from '@apollo/client';
import { Message } from './Message';
import { MessageModify } from './MessageModify';
import { cache } from '../index';

import { IMessageGQLData } from './Message';
import { IMessageModifyGroupGQLData } from './MessageModify';

export const GroupQueryResultContext = React.createContext<IGroupQueryGQLData | undefined>(undefined);

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

export const Group = ({ groupId, onlyInterestedInMessageId, maxDepth }: IGroupProps) => {
  const { data, loading, error, subscribeToMore } = useQuery<IGroupQueryGQLData>(GROUP_QUERY, {
    variables: {
      groupId,
      onlyInterestedInMessageId,
      maxDepth,
    },
  });

  const [getMessage] = useLazyQuery(MESSAGE_QUERY);

  useEffect(() => {
    subscribeToMore({
      document: gql`
        subscription OnMessageAdded($groupId: ID!) {
          messageAdded(groupId: $groupId)
        }
      `,
      variables: {
        groupId,
      },
      updateQuery: (prev, { subscriptionData }: { subscriptionData: { data: { messageAdded: IMessageGQLData } } }) => {
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

export interface IGroupQueryGQLData {
  group: {
    messages: IMessageGQLData[];
    groupId: string;
    name: string;
  } & IMessageModifyGroupGQLData;
}

export interface IGroupProps {
  groupId: string;
  onlyInterestedInMessageId?: string | null;
  maxDepth?: number;
}
