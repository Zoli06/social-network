import React from 'react';
import './Message.scss';
import { gql } from '@apollo/client';
import { MessageAuthor } from './MessageAuthor';
import { MessageModify } from './MessageModify';
import { MessageText } from './MessageText';
import { MessageActions } from './MessageActions';
import { Editor } from './Editor';
import { UserContext } from '../App';

import { IMessageAuthorGQLData } from './MessageAuthor';
import { IMessageTextGQLData } from './MessageText';
import { IMessageModifyMessageGQLData } from './MessageModify';
import { IMessageActionsGQLData } from './MessageActions';
import { IEditorGQLData } from './Editor';

export function Message({
  messageData,
  responseTree,
  userRelationShipWithGroup,
  subscribeToMore,
  messageVotedUpdateFunc,
  messageReactedUpdateFunc,
  className = '',
  groupId,
}: IMessageProps) {
  const user = React.useContext(UserContext);

  return (
    <>
      <div className={`message-container ${className}`}>
        <div className='message-content'>
          <div className='message-header'>
            <MessageAuthor user={messageData.user} />
            {user.userId === messageData.user.userId && (
              <MessageModify messageId={messageData.messageId} groupId={groupId} userRelationShipWithGroup={userRelationShipWithGroup} messageText={messageData.text} />
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
                  userRelationShipWithGroup={userRelationShipWithGroup}
                  subscribeToMore={subscribeToMore}
                  messageReactedUpdateFunc={messageReactedUpdateFunc}
                  messageVotedUpdateFunc={messageVotedUpdateFunc}
                  groupId={groupId}
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
  messageData: IMessageGQLData;
  responseTree: IMessageGQLData[];
  userRelationShipWithGroup: { type: string };
  subscribeToMore: Function;
  messageVotedUpdateFunc: Function;
  messageReactedUpdateFunc: Function;
  className?: string;
  groupId: string;
}
