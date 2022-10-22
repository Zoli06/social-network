import React, { useEffect } from 'react';
import './Group.scss';
import { useQuery, useLazyQuery, gql } from '@apollo/client';
import { Message } from './Message';
import { MessageModify } from './MessageModify';
import { cache } from '../index';

import { IMessageGQLData } from './Message';
import { IMessageModifyGroupGQLData } from './MessageModify';
import { IMessageReactedSubscriptionData, IMessageVotedSubscriptionData } from './MessageActions';

const GROUP_QUERY = gql`
  query GetGroup($groupId: ID!, $onlyInterestedInMessageId: ID) {
    group(groupId: $groupId) {
      messages(onlyInterestedInMessageId: $onlyInterestedInMessageId) {
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

export const Group = ({ groupId, onlyInterestedInMessageId }: IGroupProps) => {
  const { data, loading, error, subscribeToMore } = useQuery<IGroupQueryGQLData>(GROUP_QUERY, {
    variables: {
      groupId,
      onlyInterestedInMessageId,
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
  }, [groupId, subscribeToMore, getMessage, onlyInterestedInMessageId]);

  if (loading) return <div>Loading...</div>;
  if (error) {
    console.log(error);
    return <div>Error!</div>;
  }

  const messageVotedUpdateFunc = (
    prev: IGroupQueryGQLData,
    { subscriptionData }: IMessageVotedSubscriptionData,
    messageId: string
  ) => {
    if (!subscriptionData.data) return prev;
    const { messageVoted } = subscriptionData.data;
    return {
      ...prev,
      group: {
        ...prev.group,
        messages: prev.group.messages.map((message: IMessageGQLData) => {
          if (message.messageId === messageId) {
            return {
              ...message,
              upVotes: messageVoted.upVotes,
              downVotes: messageVoted.downVotes,
            };
          } else {
            return message;
          }
        }),
      },
    };
  };

  const messageReactedUpdateFunc = (
    prev: IGroupQueryGQLData,
    { subscriptionData }: IMessageReactedSubscriptionData,
    messageId: string
  ) => {
    if (!subscriptionData.data) return prev;
    const { messageReacted } = subscriptionData.data;
    return {
      ...prev,
      group: {
        ...prev.group,
        messages: prev.group.messages.map((message: IMessageGQLData) => {
          if (message.messageId === messageId) {
            return {
              ...message,
              reactions: messageReacted,
            };
          } else {
            return message;
          }
        }),
      },
    };
  };

  return (
    <>
      <h1>
        Group: {data?.group.name} #{groupId}
      </h1>
      {data?.group.messages.map(
        (message) =>
          ((!onlyInterestedInMessageId && (message.responseTo === null)) || (onlyInterestedInMessageId && (onlyInterestedInMessageId === message.messageId))) && (
            <Message
              messageData={message}
              responseTree={data.group.messages}
              userRelationShipWithGroup={data.group.userRelationShipWithGroup}
              subscribeToMore={subscribeToMore}
              className='root-message'
              key={message.messageId}
              messageVotedUpdateFunc={messageVotedUpdateFunc}
              messageReactedUpdateFunc={messageReactedUpdateFunc}
              groupId={groupId}
            />
          )
      )}
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
  onlyInterestedInMessageId?: string;
}
