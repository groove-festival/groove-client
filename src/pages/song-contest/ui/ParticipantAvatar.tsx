import { getTeamPhoto } from "../model/teamPhotos";

interface ParticipantAvatarProps {
  name: string;
  // 원 크기(size-*). 참가자 표시마다 크기가 다르다.
  className: string;
  // 선택·기본 상태는 밝게, 선택 안 됨·진 참가자는 흐리게.
  dimmed?: boolean;
}

// 참가팀 원형 사진. 사진이 없는 이름이면 예전처럼 빈 원을 그린다.
// 이름이 바로 옆에 적혀 있어 사진은 장식이다(alt 비움).
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
