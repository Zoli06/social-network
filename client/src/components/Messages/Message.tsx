import { gql } from '@apollo/client';
import { Editor, EditorGQLData } from '../Editor/Editor';
import { MessageAuthor, MessageAuthorGQLData } from './MessageAuthor';
import { MessageModify, MessageModifyGQLData } from './MessageModify';
import { MessageText, MessageTextGQLData } from './MessageText';
import { MessageActions, MessageActionsGQLData } from './MessageActions';
import { useState } from 'react';

// If messages is provided, message responses will be rendered
export const Message = ({
  messages,
  messageId,
  subscribeToMore,
  currentDepth,
  maxDepth,
  queriedDepth,
  maxDisplayedResponses,
  renderAsLink,
}: MessageProps) => {
  const [currentMaxDepth, setCurrentMaxDepth] = useState(maxDepth);
  const [currentMaxDisplayedResponses, setCurrentMaxDisplayedResponses] =
    useState(maxDisplayedResponses);

  const message = messages.find((message) => message.messageId === messageId);

  if (!message) {
    console.error(`Message with id ${messageId} not queried`);
    return null;
  }

  const isBanned = message.group.myRelationshipWithGroup.type === 'banned';  

  return (
    <div
      className={`flex flex-col gap-4 w-full ${
        currentDepth === 0 ? `rounded-lg ${renderAsLink ? '' : 'mb-4'}` : ''
      }`}
    >
      <div>
        <div className='flex gap-4 items-center justify-between'>
          <MessageAuthor user={message.author} />
          <MessageModify message={message} />
        </div>
        <MessageText message={message} />
        {!isBanned && (
          <MessageActions message={message} subscribeToMore={subscribeToMore} />
        )}
      </div>
      {messages &&
        !renderAsLink &&
        (() => {
          if (currentDepth < currentMaxDepth) {
            let displayedResponses = [];
            let willRenderMoreButton = false;
            for (let _message of messages) {
              if (_message.responseTo?.messageId === message.messageId) {
                if (displayedResponses.length >= currentMaxDisplayedResponses) {
                  willRenderMoreButton = true;
                  break;
                }
                displayedResponses.push(
                  <Message
                    messages={messages}
                    messageId={_message.messageId}
                    key={_message.messageId}
                    subscribeToMore={subscribeToMore}
                    currentDepth={currentDepth + 1}
                    maxDepth={currentMaxDepth}
                    queriedDepth={queriedDepth}
                    maxDisplayedResponses={maxDisplayedResponses}
                    renderAsLink={renderAsLink}
                  />
                );
              }
            }

            return (
              <div className='flex flex-col gap-4 border-l dark:border-white/20 border-black/20 pl-4'>
                {displayedResponses}
                {willRenderMoreButton && (
                  <div
                    className='text-blue-500 cursor-pointer'
                    onClick={() =>
                      setCurrentMaxDisplayedResponses(
                        currentMaxDisplayedResponses + 2
                      )
                    }
                  >
                    Show more
                  </div>
                )}
              </div>
            );
          } else if (
            currentDepth >= currentMaxDepth &&
            currentDepth < queriedDepth &&
            message.responsesCount > 0
          ) {
            return (
              <div className='flex flex-col gap-4 border-l dark:border-white/20 border-black/20 pl-4'>
                <div
                  className='text-blue-500 cursor-pointer'
                  onClick={() => setCurrentMaxDepth(currentMaxDepth + 1)}
                >
                  Show more
                </div>
              </div>
            );
          } else if (message.responsesCount > 0) {
            return (
              <a
                className='text-blue-500 cursor-pointer border-l dark:border-white/20 border-black/20 pl-4'
                href={`/group/${message.group.groupId}/message/${message.messageId}`}
              >
                Continue this thread
              </a>
            );
          }
        })()}
    </div>
  );
};

Message.fragments = {
  message: gql`
    fragment Message on Message {
      messageId
      author {
        ...MessageAuthor
      }

      ...AddResponse
      ...MessageActions
      ...MessageText
      ...MessageModify

      responseTo {
        messageId
      }
      responsesCount
      createdAt

      group {
        groupId
        myRelationshipWithGroup {
          type
        }
      }
    }

    ${MessageActions.fragments.message}
    ${MessageAuthor.fragments.user}
    ${MessageText.fragments.message}
    ${Editor.fragments.message}
    ${MessageModify.fragments.message}
  `,
};

export type MessageGQLData = {
  messageId: string;
  responseTo?: { messageId: string };
  responsesCount: number;
  author: MessageAuthorGQLData;
  createdAt: number;
  group: {
    groupId: string;
    myRelationshipWithGroup: {
      type:
        | 'member'
        | 'banned'
        | 'admin'
        | 'member_request'
        | 'member_request_rejected'
        | 'invited'
        | null;
    };
  };
} & MessageTextGQLData &
  MessageModifyGQLData &
  MessageActionsGQLData &
  EditorGQLData;

export type MessageProps = {
  messages: MessageGQLData[];
  messageId: string;
  subscribeToMore: Function;
  currentDepth: number;
  maxDepth: number;
  queriedDepth: number;
  maxDisplayedResponses: number;
  renderAsLink: boolean;
};
