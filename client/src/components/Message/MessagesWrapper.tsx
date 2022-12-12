import React, { createContext, useContext } from 'react'
import { Message } from './Message'

import { MessageGQLData } from './Message'

export const MessagesContext = createContext<MessageGQLData[] | undefined>(undefined)

export const MessagesWrapper = ({ subscribeToMore, messageId, className, messages }: MessagesWrapperProps) => {
  return (
    <MessagesContext.Provider value={messages}>
      <Message subscribeToMore={subscribeToMore} messageId={messageId} className={className} />
    </MessagesContext.Provider>
  )
}

export type MessagesWrapperProps = {
  subscribeToMore: Function,
  messageId: string,
  className?: string,
  messages: MessageGQLData[]
}
