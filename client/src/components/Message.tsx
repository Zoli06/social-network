import React, { createContext } from 'react';
import './Message.scss';
import { MessageAuthor } from './MessageAuthor';
import { MessageText } from './MessageText';
import { MessageActions } from './MessageActions';

export function Message({ messageData, responseTree, subscribeToMore }: { messageData: any, responseTree: any, subscribeToMore: any }) {
  return (
    <>
      <div className='message-container'>
        <MessageAuthor user={messageData.user} />
        <MessageText text={messageData.text} />
        <MessageActions {...messageData} subscribeToMore={subscribeToMore} />
        <div className='response-tree'>
          {responseTree.map(
            (responseData: any) =>
              responseData.responseTo.messageId === messageData.messageId && (
                <Message
                  key={responseData.messageId}
                  messageData={responseData}
                  responseTree={responseTree}
                  subscribeToMore={subscribeToMore}
                />
              )
          )}
        </div>
      </div>
    </>
  );
}
