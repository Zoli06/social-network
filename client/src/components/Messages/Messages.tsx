// god help me

import { gql } from '@apollo/client';
import { Artboard } from 'react-daisyui';
import { Message, MessageGQLData } from './Message';

export const Messages = ({
  messages,
  subscribeToMore,
  maxDepth = 2,
  onlyInterestedInMessageId: _onlyInterestedInMessageId = null,
  queriedDepth,
  maxDisplayedResponses,
  renderAsLink = false,
}: MessagesProps) => {
  const onlyInterestedInMessageId = _onlyInterestedInMessageId || null;

  const rootMessages = messages.filter((message) =>
    onlyInterestedInMessageId
      ? message.messageId === onlyInterestedInMessageId
      : !messages.some(
          ({ messageId }) => messageId === message.responseTo?.messageId
        )
  );

  return (
    <div>
      {rootMessages.length > 0 ? (
        renderAsLink ? (
          <div className='flex flex-col gap-4'>
            {rootMessages.map((message) => (
              <div key={message.messageId}>
                <p>
                  In
                  <a
                    href={`/group/${message.group.groupId}`}
                    className='ml-1 hover:underline'
                  >
                    {message.group.name}
                  </a>
                </p>
                {/* TODO: get buttons working. Don't redirect when clicking it */}
                {/* XXX */}
                <a
                  href={`/group/${message.group.groupId}/message/${message.messageId}`}
                >
                  <Artboard className='rounded-md cursor-pointer p-4'>
                    <Message
                      messages={messages}
                      messageId={message.messageId}
                      subscribeToMore={subscribeToMore}
                      currentDepth={0}
                      maxDepth={maxDepth}
                      queriedDepth={queriedDepth}
                      maxDisplayedResponses={maxDisplayedResponses}
                      renderAsLink={renderAsLink}
                    />
                  </Artboard>
                </a>
              </div>
            ))}
          </div>
        ) : (
          rootMessages.map((message) => (
            <Message
              key={message.messageId}
              messages={messages}
              messageId={message.messageId}
              subscribeToMore={subscribeToMore}
              currentDepth={0}
              maxDepth={maxDepth}
              queriedDepth={queriedDepth}
              maxDisplayedResponses={maxDisplayedResponses}
              renderAsLink={renderAsLink}
            />
          ))
        )
      ) : (
        <h1 className='text-xl font-bold text-center lg:w-96'>No messages</h1>
      )}
    </div>
  );
};

Messages.fragments = {
  message: gql`
    fragment Messages on Message {
      messageId
      group {
        groupId
        name
      }
      ...Message
    }

    ${Message.fragments.message}
  `,
};

export type MessagesGQLData = {
  messageId: string;
  group: {
    groupId: string;
    name: string;
  };
} & MessageGQLData;

export type MessagesProps = {
  messages: MessagesGQLData[];
  subscribeToMore: Function;
  onlyInterestedInMessageId?: string | null;
  queriedDepth: number;
  maxDepth: number;
  maxDisplayedResponses: number;
  renderAsLink?: boolean;
};
