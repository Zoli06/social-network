import React, { useContext } from "react";
import "./MessageModify.scss";
import { gql, useMutation } from "@apollo/client";
import { openEditor } from "./Editor";
import { MessagesContext } from "./MessagesWrapper";

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

enum UserPermissionToMessage {
  AUTHOR = "AUTHOR",
  ADMIN = "ADMIN",
  NONE = "NONE",
}

export const MessageModify = ({ messageId }: MessageModifyProps) => {
  const messages = useContext(MessagesContext)!;
  const { text, userPermissionToMessage } = messages.find(
    (message) => message.messageId === messageId
  )!;

  const [deleteMessage] = useMutation(DELETE_MESSAGE_MUTATION);
  const [editMessage] = useMutation(EDIT_MESSAGE_MUTATION);

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

  const userPermissionToMessageEnum =
    userPermissionToMessage.toUpperCase() as UserPermissionToMessage;
  
  console.log(userPermissionToMessageEnum, userPermissionToMessage)

  return (
    <div className="message-modify">
      {userPermissionToMessageEnum === UserPermissionToMessage.AUTHOR && (
        <svg
          className="message-edit icon"
          onClick={() => openEditor(handleEditMessage, text)}
        >
          <use href="./assets/images/svg-bundle.svg#edit" />
        </svg>
      )}
      {(userPermissionToMessageEnum === UserPermissionToMessage.AUTHOR ||
        userPermissionToMessageEnum === UserPermissionToMessage.ADMIN) && (
        <svg
          className={`message-delete icon ${
            userPermissionToMessageEnum === UserPermissionToMessage.ADMIN &&
            "danger"
          }`}
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
    fragment MessageModify on Message {
      messageId
      userPermissionToMessage
      author {
        userId
      }
    }
  `,
};

export type MessageModifyGQLData = {
  messageId: string;
  userPermissionToMessage: UserPermissionToMessage;
  author: {
    userId: string;
  };
};

export type MessageModifyProps = {
  messageId: string;
};
