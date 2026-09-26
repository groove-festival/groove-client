// 메뉴판 사진(PUB-A4)과 메뉴별 사진(PUB-A12)이 공유하는 제한. 올리기 전에 걸러
// 큰 파일을 보냈다가 413으로 돌아오는 왕복을 막는다.
export const allowedPubImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

// 앞단 nginx 의 client_max_body_size 가 10MB 이고 **요청 본문 전체**에 걸린다.
// multipart 경계·헤더가 수백 바이트 더 붙으므로 정확히 10MB 인 파일은 언제나
// 413 이다 (실서버 확인, 2026-09-25: 10MB-512B 는 통과, 10MB 는 차단).
// 명세상 한도는 10MB 지만 실제로 보낼 수 있는 파일은 그보다 조금 작다.
const MULTIPART_OVERHEAD_HEADROOM_BYTES = 8 * 1024;

export const MAX_PUB_IMAGE_BYTES = 10 * 1024 * 1024 - MULTIPART_OVERHEAD_HEADROOM_BYTES;

// <input type="file"> 의 accept 속성 값.
export const pubImageAccept = allowedPubImageMimeTypes.join(",");

const megabytes = (bytes: number) => Math.round((bytes / 1024 / 1024) * 10) / 10;

// 업로드할 수 없는 파일이면 사용자에게 보여줄 문구를, 괜찮으면 null을 준다.
export const getPubImageFileError = (file: File): string | null => {
  if (!allowedPubImageMimeTypes.includes(file.type as never)) {
    return "JPG·PNG·WebP 이미지만 올릴 수 있어요.";
  }

  if (file.size > MAX_PUB_IMAGE_BYTES) {
    return `10MB 보다 작은 파일만 올릴 수 있어요. (선택한 파일 ${megabytes(file.size)}MB)`;
  }

  return null;
};
