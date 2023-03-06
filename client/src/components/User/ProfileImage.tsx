import { gql } from '@apollo/client';
import { Avatar } from 'react-daisyui';

// This component renders a profile image. If no url is provided, a default image is being shown.
export const ProfileImage = ({ user, size }: ProfileImageProps) => {
  const { url } = user.profileImage || {};

  return (
    <Avatar
      src={url || '/assets/images/blank-profile-image.webp'}
      shape='circle'
      size={size}
    />
  );
};

ProfileImage.fragments = {
  user: gql`
    fragment ProfileImage on User {
      userId
      profileImage {
        mediaId
        url
      }
    }
  `,
};

export type ProfileImageGQLData = {
  profileImage: {
    mediaId: string;
    url: string;
  };
};

type ProfileImageProps = {
  user: ProfileImageGQLData;
  size?: 'xs' | 'sm' | 'md' | 'lg';
};
