import { Message } from './Message';
import { MessageGQLData } from './Message';

export const MessagesWrapper = ({
  subscribeToMore,
  messageId,
  className,
  messages,
}: MessagesWrapperProps) => {
  return (
    <Message
      subscribeToMore={subscribeToMore}
      className={className}
      message={messages.find((message) => message.messageId === messageId)!}
      messages={messages}
    />
  );
};

export type MessagesWrapperProps = {
  subscribeToMore: Function;
  messageId: string;
  className?: string;
  messages: MessageGQLData[];
};
