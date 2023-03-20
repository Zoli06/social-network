import { UserListElement, UserListElementGQLData } from '../User/UserListElement';
import { gql } from '@apollo/client';

export const GroupMemberCategory = ({
  users,
  title,
  noUserDescription,
}: GroupMemberCategoryProps) => {
  return (
    <div>
      <h1 className='text-xl font-semibold'>{title}</h1>
      {users.length > 0 ? (
        users.map((user) => <UserListElement user={user} key={user.userId} />)
      ) : (
        <div>
          <p>{noUserDescription}</p>
        </div>
      )}
    </div>
  );
};

GroupMemberCategory.fragments = {
  user: gql`
    fragment GroupMemberCategory on User {
      userId
      ...UserListElement
    }

    ${UserListElement.fragments.user}
  `,
};

export type GroupMemberCategoryGQLData = {
  userId: number;
} & UserListElementGQLData;

type GroupMemberCategoryProps = {
  users: GroupMemberCategoryGQLData[];
  title: string;
  noUserDescription: string;
};
