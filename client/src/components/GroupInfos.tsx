import { useContext } from 'react';
import './GroupInfos.scss';
import { GroupQueryResultContext } from './Group';
import { gql } from '@apollo/client';

export const GroupInfos = () => {
  const { group: { description, visibility, createdAt } } = useContext(GroupQueryResultContext)!;

  const renderVisibilityText = (visibility: string) => {
    switch (visibility) {
      case 'visible':
        return 'Visible to everyone';
      case 'hidden':
        return 'Only visible to invited members';
      default:
        console.error('Invalid argument');
        return 'An error occured';
    }
  }

  return <div className='group-infos'>
    <h2>Group Infos</h2>
    <div className='description'>
      <h3>Description</h3>
      <p>
        {description}
      </p>
    </div>
    <div className='visibility'>
      <h3>Visibility</h3>
      <p>
        {renderVisibilityText(visibility)}
      </p>
    </div>
    <div className='created-at'>
      <h3>Created At</h3>
      <p>
        {new Date(createdAt).toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}) }
      </p>
    </div>
  </div>;
};

GroupInfos.fragments = {
  group: gql`
    fragment GroupInfos on Group {
      groupId
      description
      visibility
      createdAt
    }
  `,
};

export type GroupInfosGQLData = {
  groupId: string;
  description: string;
  visibility: string;
  createdAt: string;
};
