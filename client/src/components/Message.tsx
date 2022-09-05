import React from 'react';
import './Message.scss';
import { gql } from '@apollo/client';
import { MessageAuthor } from './MessageAuthor';
import { MessageText } from './MessageText';
import { MessageActions } from './MessageActions';
import { AddResponse } from './AddResponse';

export function Message({
  messageData,
  responseTree,
  subscribeToMore,
  className = '',
}: {
  messageData: any;
  responseTree: any;
  subscribeToMore: any;
  className?: string;
}) {
  return (
    <>
      <div className={`message-container ${className}`}>
        <div className='message-content'>
          <MessageAuthor user={messageData.user} />
          <MessageText text={messageData.text} />
          <MessageActions {...messageData} subscribeToMore={subscribeToMore} />
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
