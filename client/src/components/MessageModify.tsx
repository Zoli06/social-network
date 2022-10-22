import React from 'react';
import './MessageModify.scss';
import { gql, useMutation } from '@apollo/client';
import { EditorActions, openEditor } from './Editor';

const DELETE_MESSAGE_MUTATION = gql`
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId)
  }
`;

export const MessageModify = ({ messageId }: IMessageModifyProps) => {
  const [deleteMessage] = useMutation(DELETE_MESSAGE_MUTATION, {
    variables: { messageId },
  });

  return (
    <div className='message-modify'>
      <svg className='message-edit icon' onClick={() => openEditor(messageId, groupId, EditorActions.EDIT, messageText)}>
        <use href='./assets/images/svg-bundle.svg#edit' />
      </svg>
      <svg className='message-delete icon' onClick={() => deleteMessage({variables: {messageId}})}>
        <use href='./assets/images/svg-bundle.svg#delete' />
      </svg>
    </div>
  );
};

export interface IMessageModifyGQLData {
  messageId: string;
}

export interface IMessageModifyProps extends IMessageModifyGQLData {}
