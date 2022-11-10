import React from "react";
import "./MessageModify.scss";
import { gql, useMutation } from "@apollo/client";
import { openEditor } from "./Editor";

import { GroupQueryResultContext } from "./Group";
import { UserContext } from "../App";

const DELETE_MESSAGE_MUTATION = gql`
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId)
  }
`;

const EDIT_MESSAGE_MUTATION = gql`
  mutation EditMessageMutation($message: MessageEditInput!) {
    editMessage(message: $message) {
      messageId
    }
  }
`;

export const MessageModify = ({ messageId }: MessageModifyProps) => {
  const {
    group: {
      groupId,
      userRelationShipWithGroup: { type: userRelationShipWithGroupType },
      messages,
    },
  } = React.useContext(GroupQueryResultContext)!;
  const {
    text,
    user: { userId: messageOwnerUserId },
  } = messages.find((message) => message.messageId === messageId)!;

  const {
    me: { userId },
  } = React.useContext(UserContext)!;

  const [deleteMessage] = useMutation(DELETE_MESSAGE_MUTATION);
  const [editMessage] = useMutation(EDIT_MESSAGE_MUTATION);

  const isAdmin = userRelationShipWithGroupType === "admin";
  const isOwner = messageOwnerUserId === userId;

  const handleEditMessage = (text: string) => {
    editMessage({
      variables: {
        message: {
          messageId,
          text,
        },
      },
    });
  };

  return (
    <div className="message-modify">
      {isOwner && (
        <svg
          className="message-edit icon"
          onClick={() =>
            openEditor(handleEditMessage, text)
          }
        >
          <use href="./assets/images/svg-bundle.svg#edit" />
        </svg>
      )}
      {(isAdmin || isOwner) && (
        <svg
          className={`message-delete icon ${isAdmin && !isOwner && "danger"}`}
          onClick={() => deleteMessage({ variables: { messageId } })}
        >
          <use href="./assets/images/svg-bundle.svg#delete" />
        </svg>
      )}
    </div>
  );
};

MessageModify.fragments = {
  message: gql`
    fragment MessageModifyOnMessage on Message {
      messageId
      user {
        userId
      }
    }
  `,
  group: gql`
    fragment MessageModifyOnGroup on Group {
      groupId
      userRelationShipWithGroup {
        type
      }
    }
  `,
};

export type MessageModifyMessageGQLData = {
  messageId: string;
  user: {
    userId: string;
  };
};

export type MessageModifyGroupGQLData = {
  groupId: string;
  userRelationShipWithGroup: {
    type: string;
  };
};

export type MessageModifyProps = {
  messageId: string;
};
