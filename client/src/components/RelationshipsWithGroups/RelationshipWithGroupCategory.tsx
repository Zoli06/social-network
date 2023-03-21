import { gql } from '@apollo/client';
import {
  GroupListElement,
  GroupListElementGQLData,
} from '../Group/GroupListElement';
import { GroupActions, GroupActionsGQLData } from '../Group/GroupActions';
import { Artboard } from 'react-daisyui';

export const RelationshipWithGroupCategory = ({
  title,
  groups,
  noGroupsMessage,
}: RelationshipWithGroupCategoryProps) => {
  return (
    <div className='flex flex-col gap-2'>
      <h1 className='text-lg font-bold'>{title}</h1>
      {groups.length > 0 ? (
        <div className='flex flex-wrap gap-4'>
          {groups.map((group) => (
            <Artboard
              className='p-4 flex flex-row w-full justify-between gap-4'
              key={group.groupId}
            >
              <GroupListElement group={group} />
              <GroupActions
                group={group}
                redirectToInfoPageWhenLeave={false}
                onlyDisplayButtons={true}
              />
            </Artboard>
          ))}
        </div>
      ) : (
        <i>{noGroupsMessage}</i>
      )}
    </div>
  );
};

RelationshipWithGroupCategory.fragments = {
  group: gql`
    fragment RelationshipWithGroupCategory on Group {
      groupId
      ...GroupListElement
      ...GroupActions
    }

    ${GroupListElement.fragments.group}
    ${GroupActions.fragments.group}
  `,
};

export type RelationshipWithGroupCategoryGQLData = {
  groupId: string;
} & GroupListElementGQLData &
  GroupActionsGQLData;

type RelationshipWithGroupCategoryProps = {
  title: string;
  groups: RelationshipWithGroupCategoryGQLData[];
  noGroupsMessage: string;
};
