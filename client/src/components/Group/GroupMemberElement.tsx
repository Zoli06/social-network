import { gql } from "@apollo/client";
import React from "react";
import { GroupQueryResultContext } from "./Group";
import { ProfileImage } from "../User/ProfileImage";
import "./GroupMemberElement.scss";

export const GroupMemberElement = ({ userId, userList }: GroupMemberElementProps) => {
  const user = userList.find((user) => user.userId === userId)!;

  return (
    <div className="group-member-element">
      <div className="profile-image-wrapper">
        <ProfileImage url={user.profileImage?.url} />
      </div>
      <div className="name-container">
        <p className="name">@{user.userName}</p>
      </div>
    </div>
  );
};

GroupMemberElement.fragments = {
  user: gql`
    fragment GroupMemberElement on User {
      userId
      firstName
      lastName
      userName
      profileImage {
        mediaId
        url
      }
    }
  `
}

export type GroupMemberElementProps = {
  userId: string;
  userList: GroupMemberElementGQLData[];
};

export type GroupMemberElementGQLData = {
  userId: string;
  firstName: string;
  lastName: string;
  userName: string;
  profileImage: {
    mediaId: string;
    url: string;
  };
};
