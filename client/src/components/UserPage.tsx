import React from 'react'
import { useParams } from 'react-router-dom'
import { User } from './User'

export const UserPage = () => {
  const { userId } = useParams<{ userId: string }>()
  return <> {userId && <User userId={userId} />}</>
}
