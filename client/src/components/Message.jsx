import React from "react";
import "./Message.css";
import { MessageAuthor } from "./MessageAuthor";

export const Message = ({
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
}) => {
  return (
    <>
      <div style={{ display: "none" }}>
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
        {user.profileImageMediaId}
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

      <div className="message-container">
        <MessageAuthor user = {user} />
      </div>
    </>
  );
};
