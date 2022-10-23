import React from 'react';
import './Message.scss';
import { gql } from '@apollo/client';
import { MessageAuthor } from './MessageAuthor';
import { MessageModify } from './MessageModify';
import { MessageText } from './MessageText';
import { MessageActions } from './MessageActions';
import { Editor } from './Editor';
import { UserContext } from '../App';
import { GroupQueryResultContext } from './Group';

import { IMessageAuthorGQLData } from './MessageAuthor';
import { IMessageTextGQLData } from './MessageText';
import { IMessageModifyMessageGQLData } from './MessageModify';
import { IMessageActionsGQLData } from './MessageActions';
import { IEditorGQLData } from './Editor';

export function Message({
  messageId,
  subscribeToMore,
  className = '',
}: IMessageProps) {
  const { group: { messages } } = React.useContext(GroupQueryResultContext)!;

  return (
    <>
      <div className={`message-container ${className}`}>
        <div className='message-content'>
          <div className='message-header'>
            <MessageAuthor messageId={messageId} />
            <MessageModify messageId={messageId} />
          </div>
          <MessageText messageId={messageId} />
          <MessageActions
            messageId={messageId}
            subscribeToMore={subscribeToMore}
          />
        </div>
        <div className='response-tree'>
          {messages.map(
            (message: IMessageGQLData) =>
              message.responseTo?.messageId === messageId && (
                <Message
                  messageId={message.messageId}
                  key={message.messageId}
                  subscribeToMore={subscribeToMore}
                />
              )
          )}
        </div>
      </div>
    </>
  );
}

Message.fragments = {
  message: gql`
    fragment Message on Message {
      messageId
      user {
        ...MessageAuthor
      }
      ...AddResponse
      ...MessageActions
      ...MessageText
      ...MessageModifyOnMessage

      responseTo {
        messageId
      }
    }

    ${MessageActions.fragments.message}
    ${MessageAuthor.fragments.user}
    ${MessageText.fragments.message}
    ${Editor.fragments.message}
    ${MessageModify.fragments.message}
  `,
};

export interface IMessageGQLData
  extends IMessageAuthorGQLData,
  IMessageTextGQLData,
  IMessageModifyMessageGQLData,
  IMessageActionsGQLData,
  IEditorGQLData {
  responseTo?: { messageId: string };
}

export interface IMessageProps {
  messageId: string;
  subscribeToMore: Function;
  className?: string;
}
