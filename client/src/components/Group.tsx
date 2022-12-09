import React, { useEffect } from "react";
import "./Group.scss";
import { useQuery, useLazyQuery, gql } from "@apollo/client";
import { Message } from "./Message";
import { MessagesWrapper } from "./MessagesWrapper";
import { AddRootMessage } from "./AddRootMessage";
import { GroupMembers } from "./GroupMembers";
import { GroupInfos } from "./GroupInfos";
import { GroupMemberModify } from "./GroupMemberModify";
import { cache } from "../index";

import { MessageGQLData } from "./Message";
import { AddRootMessageGQLData } from "./AddRootMessage";
import { GroupMembersGQLData } from "./GroupMembers";
import { GroupInfosGQLData } from "./GroupInfos";
import { GroupMemberModifyGQLData } from "./GroupMemberModify";

export const GroupQueryResultContext = React.createContext<
  GroupQueryGQLData | undefined
>(undefined);

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
  maxDepth,
}: GroupProps) => {
  const { data, loading, error, subscribeToMore } = useQuery<GroupQueryGQLData>(
    GROUP_QUERY,
    {
      variables: {
        groupId,
        onlyInterestedInMessageId,
        maxDepth,
      },
    }
  );

  const [getMessage] = useLazyQuery(MESSAGE_QUERY, { fetchPolicy: "no-cache" });

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
                maxDepth,
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
  ]);

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.log(error);
    return <p>Error!</p>;
  }

  const messages = data!.group.messages;

  return (
    <GroupQueryResultContext.Provider value={data}>
      <div className="group">
        <h1>
          Group: {data?.group.name} #{groupId}
        </h1>
        <div className="group-columns">
          <div className="left-column">
            <GroupMembers className="box" />
          </div>
          <div className="center-column">
            {data?.group.messages.map(
              (message) =>
                ((!onlyInterestedInMessageId && message.responseTo === null) ||
                  (onlyInterestedInMessageId &&
                    onlyInterestedInMessageId === message.messageId)) && (
                  <MessagesWrapper
                    messageId={message.messageId}
                    subscribeToMore={subscribeToMore}
                    className="root-message box"
                    messages={messages}
                    key={message.messageId}
                  />
                )
            )}
          </div>
          <div className="right-column">
            <GroupInfos className="box" />
          </div>
        </div>
        <AddRootMessage />
      </div>
    </GroupQueryResultContext.Provider>
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
      ...GroupMemberModify

      groupId
      name
    }
  }

  ${Message.fragments.message}
  ${AddRootMessage.fragments.group}
  ${GroupMembers.fragments.group}
  ${GroupInfos.fragments.group}
  ${GroupMemberModify.fragments.group}
`;

Group.fragments = {
  group: GROUP_QUERY,
};

export type GroupQueryGQLData = {
  group: {
    messages: MessageGQLData[];
    groupId: string;
    name: string;
  } & AddRootMessageGQLData &
    GroupMembersGQLData &
  GroupInfosGQLData &
  GroupMemberModifyGQLData;
};

export type GroupProps = {
  groupId: string;
  onlyInterestedInMessageId?: string | null;
  maxDepth?: number;
};
