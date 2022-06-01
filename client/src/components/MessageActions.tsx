import React from 'react'
import './MessageActions.scss'

export const MessageActions = () => {
    return (
        <div className='message-actions'>
            <img
                src={`${process.env.PUBLIC_URL}/assets/images/upvote.svg`}
                alt='upvote' />
            <img
                src={`${process.env.PUBLIC_URL}/assets/images/downvote.svg`}
                alt='downvote' />
        </div>
    )
}