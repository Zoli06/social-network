import { GroupCard, GroupCardGQLData } from '../Group/GroupCard';
import { gql } from '@apollo/client';

export const GroupSuggestions = ({
  me: { groupSuggestions },
}: GroupSuggestionsProps) => {
  return (
    <div>
      <h1 className='text-3xl font-bold text-center mb-2'>Group suggestions</h1>
      <div className='flex flex-row gap-4 overflow-x-scroll'>
        {groupSuggestions.length > 0 ? (
          groupSuggestions.map((group) => {
            return <GroupCard group={group} key={group.groupId} />;
          })
        ) : (
          <i>No group suggestions</i>
        )}
      </div>
    </div>
  );
};

GroupSuggestions.fragments = {
  me: gql`
    fragment GroupSuggestions on User {
      userId
      groupSuggestions {
        groupId
        ...GroupCard
      }
    }

    ${GroupCard.fragments.group}
  `,
};

export type GroupSuggestionsGQLData = {
  userId: string;
  groupSuggestions: ({
    groupId: string;
  } & GroupCardGQLData)[];
};

type GroupSuggestionsProps = {
  me: GroupSuggestionsGQLData;
};
