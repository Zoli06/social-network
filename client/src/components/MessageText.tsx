import React from 'react'
import './MessageText.scss'

export const MessageText = ({ text }: { text: string }) => {
  return (
    <div className='message-text-container'><p className='message-text'>{text}</p></div>
  )
}