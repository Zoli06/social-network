import { gql } from '@apollo/client';
import { Artboard, Avatar } from 'react-daisyui';

export const GroupCard = ({
  group: {
    groupId,
    name,
    indexImage: { url: indexImageUrl },
  },
}: GroupCardProps) => {
  return (
    <a href={`/group/${groupId}`}>
      <Artboard className='rounded-md cursor-pointer p-4 flex gap-2 w-48'>
        <Avatar src={indexImageUrl} shape='circle' />
        <h1 className='text-xl font-bold'>{name}</h1>
      </Artboard>
    </a>
  );
};

GroupCard.fragments = {
  group: gql`
    fragment GroupCard on Group {
      groupId
      name
      creatorUser {
        userId
        userName
        ...ProfileImage
      }
      indexImage {
        mediaId
        url
      }
    }
  `,
};

export type GroupCardGQLData = {
  groupId: number;
  name: string;
  indexImage: {
    mediaId: number;
    url: string;
  };
};

type GroupCardProps = {
  group: GroupCardGQLData;
};
