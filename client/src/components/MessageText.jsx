import React from 'react'
import './MessageText.css'

export const MessageText = ({ text }) => {
  return (
    <div className='message-text-container'><p className='message-text'>{text}</p></div>
  )
}