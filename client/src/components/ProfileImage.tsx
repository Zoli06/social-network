import "./ProfileImage.scss";

// This component renders a profile image. If no url is provided, a default image is shown.
export const ProfileImage = ({ url }: ProfileImageProps) => {
  return (
    <img
      src={!!url ? url : "./assets/images/blank-profile-image.webp"}
      className="profile-image"
      alt="profile"
    />
  );
};

export type ProfileImageProps = {
  url: string;
};
