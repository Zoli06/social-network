import React from 'react'
import './MessageText.scss'
import { gql } from '@apollo/client'

export const MessageText = ({ text }: { text: string }) => {
  return (
    <div className='message-text-container'><p className='message-text'>{text}</p></div>
  )
}

MessageText.fragments = {
  text: gql`
    fragment MessageText on Message {
      text
    }
  `,
}
