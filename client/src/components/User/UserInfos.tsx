import { gql } from '@apollo/client'
import React from 'react'

export const UserInfos = () => {
  return (
    <div>UserInfos</div>
  )
}

UserInfos.fragments = {
  user: gql`
    fragment UserInfos on User {
      userId
      intro
      mobileNumber
      email
      registeredAt
      lastLoginAt
    }
  `
}

export type UserInfosGQLData = {
  userId: string
  intro: string
  mobileNumber: string
  email: string
  registeredAt: string
  lastLoginAt: string
}
