import React from 'react';
import './MessageModify.scss';
import { gql, useMutation } from '@apollo/client';
import { EditorActions, openEditor } from './Editor';

import { GroupQueryResultContext } from './Group';
import { UserContext } from '../App';

const DELETE_MESSAGE_MUTATION = gql`
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId)
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

  const { userId } = React.useContext(UserContext)!;

  const [deleteMessage] = useMutation(DELETE_MESSAGE_MUTATION, {
    variables: { messageId },
  });

  const isAdmin = userRelationShipWithGroupType === 'admin';
  const isOwner = messageOwnerUserId === userId;

  return (
    <div className='message-modify'>
      {isOwner && (
        <svg
          className='message-edit icon'
          onClick={() =>
            openEditor(messageId, groupId, EditorActions.EDIT, text)
          }
        >
          <use href='./assets/images/svg-bundle.svg#edit' />
        </svg>
      )}
      {(isAdmin || isOwner) && (
        <svg
          className='message-delete icon'
          {...((isAdmin && !isOwner) && { style: { fill: 'red' } })}
          onClick={() => deleteMessage({ variables: { messageId } })}
        >
          <use href='./assets/images/svg-bundle.svg#delete' />
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
}

export type MessageModifyGroupGQLData = {
  groupId: string;
  userRelationShipWithGroup: {
    type: string;
  };
}

export type MessageModifyProps = {
  messageId: string;
}
