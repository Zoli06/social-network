import { gql } from '@apollo/client';

export const GroupListElement = ({
  group: {
    groupId,
    name,
    indexImage,
  },
}: GroupListElementProps) => {
  return (
    <a className='flex gap-4' href={`/group/${groupId}`}>
      <div>
        <img
          className='w-12 h-12 rounded-full'
          src={indexImage?.url || '/images/default-group-index-image.png'}
          alt='Group index'
        />
      </div>
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
