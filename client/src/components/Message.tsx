import React from 'react';
import './Message.scss';
import { MessageAuthor } from './MessageAuthor';
import { MessageText } from './MessageText';
import { MessageActions } from './MessageActions';

export const Message = ({
  messageId,
  user,
  group,
  createdAt,
  updatedAt,
  responses,
  reactions,
  reaction,
  upVotes,
  downVotes,
  vote,
  medias,
  text,
  responsesCount,
}: {
  messageId: string;
  user: {
    firstName: string;
    lastName: string;
    middleName: string;
    userName: string;
    intro: string;
    profileImage: {
      url: string;
    };
  };
  group: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  responses: {
    messageId: string;
  }[];
  reactions: {
    type: number;
  }[];
  reaction: {
    type: number;
  };
  upVotes: number;
  downVotes: number;
  vote: {
    type: string;
  };
  medias: {
    url: string;
  }[];
  text: string;
  responsesCount: number;
  }) => {
  return (
    <>
      <div style={{ display: 'none' }}>
        {user.firstName}
        <br />
        {user.lastName}
        <br />
        {user.middleName}
        <br />
        {user.userName}
        <br />
        {user.intro}
        <br />
        {user.profileImage.url}
        <br />

        {group.name}
        <br />

        {createdAt}
        <br />

        {updatedAt}
        <br />

        {/*responses.messageId*/}
        <br />

        {/*reactions.type*/}
        <br />
        {reaction.type}
        <br />
        {/*upVotes*/}
        <br />
        {/*downVotes*/}
        <br />
        {vote.type}
        <br />

        {/*medias.mediaId*/}
        <br />

        {text}
        <br />
      </div>

      <div className='message-container'>
        <MessageAuthor user={user} />
        <MessageText text={text} />
        <MessageActions upVotes={upVotes} downVotes={downVotes} responsesCount={responsesCount} messageId={messageId} myVote={vote.type} reactions={reactions} />
      </div>
    </>
  );
};
