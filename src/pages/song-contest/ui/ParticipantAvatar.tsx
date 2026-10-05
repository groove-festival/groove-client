import { getTeamPhoto } from "../model/teamPhotos";

interface ParticipantAvatarProps {
  name: string;

  className: string;

  dimmed?: boolean;
}

export function ParticipantAvatar({
  name,
  className,
  dimmed = false,
}: ParticipantAvatarProps) {
  const photo = getTeamPhoto(name);

  if (!photo) {
    return (
      <span
        aria-hidden="true"
        className={`${className} shrink-0 rounded-full ${dimmed ? "bg-[#a2a2a2]" : "bg-[#fcfcfc]"}`}
      />
    );
  }

  return (
    <img
      alt=""
      className={`${className} shrink-0 rounded-full bg-[#fcfcfc] object-cover ${
        dimmed ? "opacity-50 grayscale" : ""
      }`}
      data-testid="participant-avatar"
      decoding="async"
      loading="lazy"
      src={photo.src}
      srcSet={photo.srcSet}
    />
  );
}
