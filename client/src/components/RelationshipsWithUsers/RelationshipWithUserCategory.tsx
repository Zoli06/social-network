import {
  UserListElement,
  UserListElementGQLData,
} from '../User/UserListElement';
import { UserActions, UserActionsGQLData } from '../User/UserActions';
import { gql } from '@apollo/client';
import { Artboard } from 'react-daisyui';

export const RelationshipWithUserCategory = ({
  title,
  users,
  noUsersMessage,
}: RelationshipWithUserCategoryProps) => {
  return (
    <div className='flex flex-col gap-2'>
      <h1 className='text-lg font-bold'>{title}</h1>
      {users.length > 0 ? (
        <div className='flex flex-wrap gap-4'>
          {users.map((user) => (
            <Artboard className='p-4 flex gap-2 w-[15rem]' key={user.userId}>
              <UserListElement user={user} />
              <div className='flex flex-col w-full'>
                <UserActions user={user} isMe={false} />
              </div>
            </Artboard>
          ))}
        </div>
      ) : (
        <i>{noUsersMessage}</i>
      )}
    </div>
  );
};

RelationshipWithUserCategory.fragments = {
  user: gql`
    fragment RelationshipWithUserCategory on User {
      userId
      ...UserListElement
      ...UserActions
    }

    ${UserListElement.fragments.user}
    ${UserActions.fragments.user}
  `,
};

export type RelationshipWithUserCategoryGQLData = {
  userId: string;
} & UserListElementGQLData &
  UserActionsGQLData;

type RelationshipWithUserCategoryProps = {
  title: string;
  users: RelationshipWithUserCategoryGQLData[];
  noUsersMessage: string;
};
