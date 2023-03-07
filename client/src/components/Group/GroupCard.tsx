import { ProfileImage, ProfileImageGQLData } from '../User/ProfileImage';
import { gql } from '@apollo/client';
import { Artboard, Avatar } from 'react-daisyui';

export const GroupCard = ({
  group: {
    groupId,
    name,
    creatorUser,
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

    ${ProfileImage.fragments.user}
  `,
};

export type GroupCardGQLData = {
  groupId: number;
  name: string;
  creatorUser: {
    userId: number;
    userName: string;
  } & ProfileImageGQLData;
  indexImage: {
    mediaId: number;
    url: string;
  };
};

type GroupCardProps = {
  group: GroupCardGQLData;
};
