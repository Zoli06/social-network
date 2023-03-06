import { GroupMember, GroupMemberGQLData } from './GroupMember';
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
        users.map((user) => <GroupMember user={user} key={user.userId} />)
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
      ...GroupMember
    }

    ${GroupMember.fragments.user}
  `,
};

export type GroupMemberCategoryGQLData = {
  userId: number;
} & GroupMemberGQLData;

type GroupMemberCategoryProps = {
  users: GroupMemberCategoryGQLData[];
  title: string;
  noUserDescription: string;
};
