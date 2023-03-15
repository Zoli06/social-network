import { gql, useMutation } from "@apollo/client";
import { SvgButton } from "../../utilities/SvgButton";
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
    <div className='flex gap-4'>
      {myPermissionToMessageAsEnum === PermissionToMessageEnum.AUTHOR && (
        // <svg
        //   onClick={() => openEditor(handleEditMessage, text)}
        // >
        //   <use href="/assets/images/svg-bundle.svg#edit" />
        // </svg>
        <SvgButton
          icon='edit'
          onClick={() => openEditor(handleEditMessage, text)}
        />
      )}
      {(myPermissionToMessageAsEnum === PermissionToMessageEnum.AUTHOR ||
        myPermissionToMessageAsEnum === PermissionToMessageEnum.ADMIN) && (
        <SvgButton
          icon='delete'
          onClick={() => deleteMessage({ variables: { messageId } })}
          customClass={`${myPermissionToMessageAsEnum === PermissionToMessageEnum.ADMIN ? '!fill-red-500' : ''}`}
        />
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
