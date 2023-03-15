import { gql } from '@apollo/client';
import React from 'react';

export const UserDisplayedName = ({
  user: { firstName, middleName, lastName, points },
}: UserDisplayedNameProps) => {
  const pointColor =
    points > 0
      ? 'text-green-500'
      : points < 0
      ? 'text-red-500'
      : 'text-gray-500';

  return (
    <h1 className='text-xl md:text-2xl text-center'>
      {firstName} {middleName} {lastName}
      <span className={`${pointColor} ml-2`}>
        {(() => {
          if (points > 0) return `+${points}`;
          if (points < 0) return `-${points}`;
          return `0`;
        })()}
      </span>
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
      points
    }
  `,
};

export type UserDisplayedNameGQLData = {
  userId: string;
  firstName: string;
  lastName: string;
  middleName: string;
  points: number;
};

type UserDisplayedNameProps = {
  user: UserDisplayedNameGQLData;
};
