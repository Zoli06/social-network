import { gql } from "@apollo/client";
import "./ProfileImage.scss";

// This component renders a profile image. If no url is provided, a default image is shown.
export const ProfileImage = ({ user }: ProfileImageProps) => {
  const { url } = user.profileImage || {};

  return (
    <div className="profile-image-container">
    <img
      src={!!url ? url : "/assets/images/blank-profile-image.webp"}
      className="profile-image"
      alt="profile"
      />
      </div>
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
};
