import React from 'react';
import './MessageModify.scss';
import { gql, useMutation } from '@apollo/client';
import { EditorActions, openEditor } from './Editor';

import { GroupQueryResultContext } from './Group';

const DELETE_MESSAGE_MUTATION = gql`
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId)
  }
`;

export const MessageModify = ({ messageId }: IMessageModifyProps) => {
  const { group: { groupId, messages } } = React.useContext(GroupQueryResultContext)!;
  const { text } = messages.find((message) => message.messageId === messageId)!;

  const [deleteMessage] = useMutation(DELETE_MESSAGE_MUTATION, {
    variables: { messageId },
  });

  return (
    <div className='message-modify'>
      <svg className='message-edit icon' onClick={() => openEditor(messageId, groupId, EditorActions.EDIT, text)}>
        <use href='./assets/images/svg-bundle.svg#edit' />
      </svg>
      <svg className='message-delete icon' onClick={() => deleteMessage({ variables: { messageId } })}>
        <use href='./assets/images/svg-bundle.svg#delete' />
      </svg>
    </div>
  );
};

MessageModify.fragments = {
  message: gql`
    fragment MessageModifyOnMessage on Message {
      messageId
    }
  `,
  group: gql`
    fragment MessageModifyOnGroup on Group {
      groupId
      userRelationShipWithGroup {
        type
      }
    }
  `
}

export interface IMessageModifyMessageGQLData {
  messageId: string;
}

export interface IMessageModifyGroupGQLData {
  groupId: string,
  userRelationShipWithGroup: {
    type: string;
  };
}

export interface IMessageModifyProps {
  messageId: string;
}
