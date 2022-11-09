import "./ProfileImage.scss";

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
