import { gql } from '@apollo/client';
import { Avatar } from 'react-daisyui';

export const GroupListElement = ({
  group: { groupId, name, indexImage },
}: GroupListElementProps) => {
  return (
    <a className='flex gap-4' href={`/group/${groupId}`}>
      <Avatar
        src={indexImage?.url || '/images/default-group-index-image.png'}
        shape='circle'
        size='sm'
      />
      <div className='flex flex-col justify-center'>
        <p className='text-lg font-semibold leading-5 overflow-ellipsis'>
          {name}
        </p>
      </div>
    </a>
  );
};

GroupListElement.fragments = {
  group: gql`
    fragment GroupListElement on Group {
      groupId
      name
      indexImage {
        mediaId
        url
      }
    }
  `,
};

export type GroupListElementGQLData = {
  groupId: string;
  name: string;
  indexImage?: {
    mediaId: string;
    url: string;
  };
};

type GroupListElementProps = {
  group: GroupListElementGQLData;
};
