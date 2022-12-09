import React from "react";
import "./MessageAuthor.scss";
import { gql } from "@apollo/client";
import { ProfileImage } from "./ProfileImage";
import { MessagesContext } from "./MessagesWrapper";

export const MessageAuthor = ({ messageId }: MessageAuthorProps) => {
  const messages = React.useContext(MessagesContext)!;

  const {
    author: { firstName, lastName, middleName, userName, intro, profileImage },
  } = messages.find((message) => message.messageId === messageId)!;

  return (
    <div className="message-author-container">
      <div className="image-container">
        <ProfileImage url={profileImage?.url} />
      </div>
      <div className="text-container">
        <p className="name">
          <span className="first-name">{firstName} </span>
          <span className="middle-name">{middleName} </span>
          <span className="last-name">{lastName}</span>
        </p>
        <p className="user-name">@{userName}</p>
        <p className="intro">{intro}</p>
      </div>
    </div>
  );
};

MessageAuthor.fragments = {
  user: gql`
    fragment MessageAuthor on User {
      userId
      firstName
      lastName
      middleName
      userName
      intro
      profileImage {
        mediaId
        url
      }
    }
  `,
};

export type MessageAuthorGQLData = {
  author: {
    userId: string;
    firstName: string;
    lastName: string;
    middleName: string;
    userName: string;
    intro: string;
    profileImage: {
      mediaId: string;
      url: string;
    };
  };
};

export type MessageAuthorProps = {
  messageId: string;
};
