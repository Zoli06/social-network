import { useEffect } from 'react';
import { useQuery, useLazyQuery, gql } from '@apollo/client';
import { Navigate } from 'react-router-dom';

import { Message, MessageGQLData } from './Message/Message';
import { MessagesWrapper } from './Message/MessagesWrapper';
import { AddRootMessage, AddRootMessageGQLData } from './AddRootMessage';
import { GroupMembers, GroupMembersGQLData } from './GroupMembers';
import { GroupInfos, GroupInfosGQLData } from './GroupInfos';
import { GroupHeader, GroupHeaderGQLData } from './GroupHeader';
import { cache } from '../../index';

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
    messageAdded(groupId: $groupId)
  }
`;

const MESSAGE_EDITED_SUBSCRIPTION = gql`
  subscription MessageEdited($groupId: ID!) {
    messageEdited(groupId: $groupId)
  }
`;

const MESSAGES_DELETED_SUBSCRIPTION = gql`
  subscription MessagesDeleted($groupId: ID!) {
    messagesDeleted(groupId: $groupId)
  }
`;

export const Group = ({
  groupId,
  onlyInterestedInMessageId,
  maxDepth = 2,
}: GroupProps) => {
  const queriedDepth = maxDepth + 2;

  const { data, loading, error, subscribeToMore } = useQuery<GroupQueryGQLData>(
    GROUP_QUERY,
    {
      variables: {
        groupId,
        onlyInterestedInMessageId,
        maxDepth: queriedDepth,
      },
    }
  );

  const [getMessage] = useLazyQuery(MESSAGE_QUERY, { fetchPolicy: 'no-cache' });

  useEffect(() => {
    subscribeToMore({
      document: MESSAGE_ADDED_SUBSCRIPTION,
      variables: {
        groupId,
      },
      updateQuery: (
        prev,
        {
          subscriptionData,
        }: { subscriptionData: { data: { messageAdded: MessageGQLData } } }
      ) => {
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
                maxDepth: queriedDepth,
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
      document: MESSAGE_EDITED_SUBSCRIPTION,
      variables: {
        groupId,
      },
      updateQuery: (
        prev,
        {
          subscriptionData,
        }: { subscriptionData: { data: { messageEdited: MessageGQLData } } }
      ) => {
        if (!subscriptionData.data) {
          return prev;
        }

        getMessage({
          variables: {
            messageId: subscriptionData.data.messageEdited,
          },
          onCompleted: (data) => {
            // edit message in apollo cache
            const { message } = data;

            cache.writeQuery({
              query: GROUP_QUERY,
              variables: {
                groupId,
                onlyInterestedInMessageId,
                maxDepth: queriedDepth,
              },
              data: {
                group: {
                  ...prev.group,
                  messages: prev.group.messages.map((m) => {
                    if (m.messageId === message.messageId) {
                      return message;
                    }

                    return m;
                  }),
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
      updateQuery: (
        prev,
        {
          subscriptionData,
        }: { subscriptionData: { data: { messagesDeleted: string[] } } }
      ) => {
        if (!subscriptionData.data) {
          return prev;
        }

        // remove messages from apollo cache in group messages
        return {
          ...prev,
          group: {
            ...prev.group,
            messages: prev.group.messages.filter(
              (message) =>
                !subscriptionData.data.messagesDeleted.includes(
                  message.messageId
                )
            ),
          },
        };
      },
    });
  }, [
    groupId,
    subscribeToMore,
    getMessage,
    onlyInterestedInMessageId,
    maxDepth,
    queriedDepth,
  ]);

  if (loading) return <p>Loading...</p>;
  if (error) {
    if (error.message === 'Not Authorised!') {
      console.log('Not Authorised! Redirecting to info page...');
      return <Navigate to={`/group/${groupId}/info`} />;
    }
    console.error(error);
  }

  const group = data!.group;
  const messages = group.messages;

  return (
    <div className='flex flex-col gap-6'>
      <GroupHeader group={group} redirectToInfoPage />
      <div className='flex lg:flex-row flex-col justify-between gap-4'>
        <div className='lg:max-w-lg'>
          <div className='bg-black/10 p-4 rounded-md'>
            <GroupMembers group={group} />
          </div>
        </div>
        <div className='lg:max-w-xl order-3 ég:order-2'>
          <div className='bg-black/10 p-4 rounded-md'>
            {data?.group.messages.map(
              (message) =>
                ((!onlyInterestedInMessageId && message.responseTo === null) ||
                  (onlyInterestedInMessageId &&
                    onlyInterestedInMessageId === message.messageId)) && (
                  <MessagesWrapper
                    messageId={message.messageId}
                    subscribeToMore={subscribeToMore}
                    messages={messages}
                    maxDepth={maxDepth}
                    queriedDepth={queriedDepth}
                    key={message.messageId}
                  />
                )
            )}
          </div>
        </div>
        <div className='order-2 lg:order-3 lg:max-w-lg'>
          <div className='bg-black/10 p-4 rounded-md'>
            <GroupInfos group={group} />
          </div>
        </div>
      </div>
      <div className={`${onlyInterestedInMessageId ? 'hidden' : ''}`}>
        <AddRootMessage group={group} />
      </div>
    </div>
  );
};

const GROUP_QUERY = gql`
  query GetGroup(
    $groupId: ID!
    $onlyInterestedInMessageId: ID
    $maxDepth: Int
  ) {
    group(groupId: $groupId) {
      messages(
        onlyInterestedInMessageId: $onlyInterestedInMessageId
        maxDepth: $maxDepth
      ) {
        ...Message
      }

      ...AddRootMessage
      ...GroupMembers
      ...GroupInfos
      ...GroupHeader

      groupId
      name
      myRelationshipWithGroup {
        type
      }
    }
  }

  ${Message.fragments.message}
  ${AddRootMessage.fragments.group}
  ${GroupMembers.fragments.group}
  ${GroupInfos.fragments.group}
  ${GroupHeader.fragments.group}
`;

export type GroupQueryGQLData = {
  group: {
    messages: MessageGQLData[];
    groupId: string;
    name: string;
  } & AddRootMessageGQLData &
    GroupMembersGQLData &
    GroupInfosGQLData &
    GroupHeaderGQLData;
};

type GroupProps = {
  groupId: string;
  onlyInterestedInMessageId?: string | null;
  maxDepth?: number;
};
