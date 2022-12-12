import { gql, useQuery } from '@apollo/client'
import React from 'react'
import { ProfileImage } from './ProfileImage'

export const User = ({ userId }: UserProps) => {
  const { data, loading, error } = useQuery<UserQueryGQLData>(USER_QUERY, {
    variables: { userId },
  })

  if (loading) return <div>Loading...</div>
  if (error) {
    console.error(error)
    return <div>Error</div>
  }

  const {
    firstName,
    lastName,
    middleName,
    email,
    profileImage: { url },
  } = data!.user

  return (
    <>
      <ProfileImage url={url} />
      <div>
        <p>
          <span>{firstName} </span>
          <span>{middleName} </span>
          <span>{lastName}</span>
        </p>
        <p>{email}</p>
      </div>
    </>
  )
}

const USER_QUERY = gql`
  query User($userId: ID!) {
    user(userId: $userId) {
      userId
      firstName
      lastName
      middleName
      email
      profileImage {
        mediaId
        url
      }
    }
  }
`

type UserProps = {
  userId: string
}

type UserQueryGQLData = {
  user: {
    userId: string
    firstName: string
    lastName: string
    middleName: string
    email: string
    profileImage: {
      mediaId: string
      url: string
    }
  }
}
