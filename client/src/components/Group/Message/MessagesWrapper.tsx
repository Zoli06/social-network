// TODO: clean this mess up. I don't think we need this file.
// XXX

import { Message } from './Message';
import { MessageGQLData } from './Message';

export const MessagesWrapper = ({
  subscribeToMore,
  messageId,
  messages,
  maxDepth = 3,
  queriedDepth,
  maxDisplayedResponses = 4
}: MessagesWrapperProps) => {
  return (
    <Message
      subscribeToMore={subscribeToMore}
      message={messages.find((message) => message.messageId === messageId)!}
      messages={messages}
      currentDepth={0}
      maxDepth={maxDepth}
      queriedDepth={queriedDepth}
      maxDisplayedResponses={maxDisplayedResponses}
    />
  );
};

export type MessagesWrapperProps = {
  subscribeToMore: Function;
  messageId: string;
  className?: string;
  messages: MessageGQLData[];
  maxDepth?: number;
  queriedDepth: number;
  maxDisplayedResponses?: number;
};
