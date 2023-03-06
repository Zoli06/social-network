import { gql } from '@apollo/client';
import React from 'react';

export const UserDisplayedName = ({
  user: { firstName, middleName, lastName },
}: UserDisplayedNameProps) => {
  return (
    <h1 className='text-xl md:text-2xl text-center'>
      {firstName} {middleName} {lastName}
    </h1>
  );
};

UserDisplayedName.fragments = {
  user: gql`
    fragment UserDisplayedName on User {
      userId
      firstName
      lastName
      middleName
    }
  `,
};

export type UserDisplayedNameGQLData = {
  userId: string;
  firstName: string;
  lastName: string;
  middleName: string;
};

type UserDisplayedNameProps = {
  user: UserDisplayedNameGQLData;
};
