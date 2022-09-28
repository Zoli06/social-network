import React from 'react';
import './Message.scss';
import { gql } from '@apollo/client';
import { MessageAuthor } from './MessageAuthor';
import { MessageModify } from './MessageModify';
import { MessageText } from './MessageText';
import { MessageActions } from './MessageActions';
import { AddResponse } from './AddResponse';
import { UserContext } from '../App';

import { IMessageAuthorGQLData } from './MessageAuthor';
import { IMessageTextGQLData } from './MessageText';
import { IMessageModifyGQLData } from './MessageModify';
import { IMessageActionsGQLData } from './MessageActions';
import { IAddResponseGQLData } from './AddResponse';

export function Message({
  messageData,
  responseTree,
  subscribeToMore,
  messageVotedUpdateFunc,
  messageReactedUpdateFunc,
  className = '',
}: IMessageProps) {
  const user = React.useContext(UserContext);

  return (
    <>
      <div className={`message-container ${className}`}>
        <div className='message-content'>
          <div className='message-header'>
            <MessageAuthor user={messageData.user} />
            {user.userId === messageData.user.userId && (
              <MessageModify messageId={messageData.messageId} />
            )}
          </div>
          <MessageText text={messageData.text} />
          <MessageActions
            messageData={messageData}
            subscribeToMore={subscribeToMore}
            messageReactedUpdateFunc={messageReactedUpdateFunc}
            messageVotedUpdateFunc={messageVotedUpdateFunc}
          />
        </div>
        <div className='response-tree'>
          {responseTree.map(
            (responseData: IMessageGQLData) =>
              responseData.responseTo?.messageId === messageData.messageId && (
                <Message
                  key={responseData.messageId}
                  messageData={responseData}
                  responseTree={responseTree}
                  subscribeToMore={subscribeToMore}
                  messageReactedUpdateFunc={messageReactedUpdateFunc}
                  messageVotedUpdateFunc={messageVotedUpdateFunc}
                />
              )
          )}
        </div>
        <AddResponse messageId={messageData.messageId} />
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
      ...MessageActions
      ...MessageText

      responseTo {
        messageId
      }
    }

    ${MessageActions.fragments.message}
    ${MessageAuthor.fragments.user}
    ${MessageText.fragments.message}
  `,
};

export interface IMessageGQLData
  extends IMessageAuthorGQLData,
  IMessageTextGQLData,
  IMessageModifyGQLData,
  IMessageActionsGQLData,
  IAddResponseGQLData {
  responseTo?: { messageId: string };
}

export interface IMessageProps {
  messageData: IMessageGQLData;
  responseTree: IMessageGQLData[];
  subscribeToMore: Function;
  messageVotedUpdateFunc: Function;
  messageReactedUpdateFunc: Function;
  className?: string;
}
