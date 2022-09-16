import React from 'react';
import './Message.scss';
import { gql } from '@apollo/client';
import { MessageAuthor } from './MessageAuthor';
import { MessageModify } from './MessageModify';
import { MessageText } from './MessageText';
import { MessageActions } from './MessageActions';
import { AddResponse } from './AddResponse';
import { UserContext } from '../App';

export function Message({
  messageData,
  responseTree,
  subscribeToMore,
  messageVotedUpdateFunc,
  messageReactedUpdateFunc,
  className = '',
}: {
  messageData: any;
  responseTree: any;
  subscribeToMore: any;
  messageVotedUpdateFunc: Function;
  messageReactedUpdateFunc: Function;
  className?: string;
  }) {
  const user = React.useContext(UserContext);
  
  return (
    <>
      <div className={`message-container ${className}`}>
        <div className='message-content'>
          <MessageAuthor user={messageData.user} />
          {user.userId === messageData.user.userId && (
            /* TODO: Fix types */
            /* @ts-ignore */
            <MessageModify messageId={messageData.messageId} />
          )}
          <MessageText text={messageData.text} />
          <MessageActions
            {...messageData}
            subscribeToMore={subscribeToMore}
            messageReactedUpdateFunc={messageReactedUpdateFunc}
            messageVotedUpdateFunc={messageVotedUpdateFunc}
          />
        </div>
        <div className='response-tree'>
          {responseTree.map(
            (responseData: any) =>
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
