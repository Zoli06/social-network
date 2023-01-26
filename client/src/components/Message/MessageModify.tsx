import "./MessageModify.scss";
import { gql, useMutation } from "@apollo/client";
import { openEditor } from "../Editor/Editor";

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

enum PermissionToMessageEnum {
  AUTHOR = "AUTHOR",
  ADMIN = "ADMIN",
  NONE = "NONE",
}

export const MessageModify = ({ message: { messageId, text, myPermissionToMessage } }: MessageModifyProps) => {
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

  const myPermissionToMessageAsEnum =
    myPermissionToMessage.toUpperCase() as PermissionToMessageEnum;
  
  return (
    <div className="message-modify">
      {myPermissionToMessageAsEnum === PermissionToMessageEnum.AUTHOR && (
        <svg
          className="message-edit icon"
          onClick={() => openEditor(handleEditMessage, text)}
        >
          <use href="/assets/images/svg-bundle.svg#edit" />
        </svg>
      )}
      {(myPermissionToMessageAsEnum === PermissionToMessageEnum.AUTHOR ||
        myPermissionToMessageAsEnum === PermissionToMessageEnum.ADMIN) && (
        <svg
          className={`message-delete icon ${
            myPermissionToMessageAsEnum === PermissionToMessageEnum.ADMIN &&
            "danger"
          }`}
          onClick={() => deleteMessage({ variables: { messageId } })}
        >
          <use href="/assets/images/svg-bundle.svg#delete" />
        </svg>
      )}
    </div>
  );
};

MessageModify.fragments = {
  message: gql`
    fragment MessageModify on Message {
      messageId
      myPermissionToMessage
      text
      author {
        userId
      }
    }
  `,
};

export type MessageModifyGQLData = {
  messageId: string;
  myPermissionToMessage: PermissionToMessageEnum;
  text: string;
  author: {
    userId: string;
  };
};

type MessageModifyProps = {
  message: MessageModifyGQLData;
};
