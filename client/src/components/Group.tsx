import React, { useEffect } from 'react';
import './Group.scss';
import { useQuery, gql } from '@apollo/client';
import { Message } from './Message';

const GROUP_QUERY = gql`
  query GetGroup($groupId: ID!) {
    group(groupId: $groupId) {
      messages {
        ...Message
      }

      groupId
      name
    }
  }

  ${Message.fragments.message}
`;

export const Group = ({ groupId }: { groupId: string }) => {
  const { data, loading, error, subscribeToMore } = useQuery(GROUP_QUERY, {
    variables: {
      groupId,
    },
  });

  useEffect(() => {
    subscribeToMore({
      document: gql`
        subscription OnMessageAdded($groupId: ID!) {
          messageAdded(groupId: $groupId) {
            ...Message
          }
        }

        ${Message.fragments.message}
      `,
      variables: {
        groupId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const newMessage = subscriptionData.data.messageAdded;

        return {
          ...prev,
          group: {
            ...prev.group,
            messages: [...prev.group.messages, newMessage],
          },
        };
      },
    });
  }, [subscribeToMore, groupId]);

  if (loading) return <div>Loading...</div>;
  if (error) {
    console.log(error);
    return <div>Error!</div>;
  }

  return (
    <>
      <h1>
        Group: {data.group.name} #{data.group.groupId}
      </h1>
      {data.group.messages.map(
        (message: any) =>
          message.responseTo === null && (
            <Message
              messageData={message}
              responseTree={data.group.messages}
              subscribeToMore={subscribeToMore}
              className='root-message'
              key={message.messageId}
            />
          )
      )}
    </>
  );
};
