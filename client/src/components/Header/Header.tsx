import { gql } from '@apollo/client'
import React from 'react'
import { Notifications, NotificationsGQLData } from './Notifications'
import { ProfileImage, ProfileImageGQLData } from '../User/ProfileImage';

export const Header = ({ user }: HeaderProps) => {
  return (
    <>
      <Notifications user={user} />
      {/*TODO: figure out wtf is going on here*/}
      {/*XXX*/}
      <ProfileImage user={user} />
    </>
  )
}

Header.fragments = {
  user: gql`
    fragment Header on User {
      userId
      ...Notifications
      ...ProfileImage
    }

    ${Notifications.fragments.user}
    ${ProfileImage.fragments.user}
  `
}

export type HeaderGQLData = {
  userId: String;
} & NotificationsGQLData & ProfileImageGQLData;

type HeaderProps = {
  user: HeaderGQLData;
}
