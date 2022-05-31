import React from 'react'
import './MessageAuthor.css'

export const MessageAuthor = ({ user }) => {
  return (
    <div className='message-author-container'>
        <img src = {user.profileImage.url} className='profile-image' />
        <p className='name'>
            <span className='first-name'>{user.firstName} </span>
            <span className='middle-name'>{user.middleName} </span>
            <span className='last-name'>{user.lastName}</span>
        </p>
        <p className='user-name'>{user.userName}</p>
        <p className='intro'>{user.intro}</p>
    </div>
  )
}