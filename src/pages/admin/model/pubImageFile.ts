export const allowedPubImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const MULTIPART_OVERHEAD_HEADROOM_BYTES = 8 * 1024;

export const MAX_PUB_IMAGE_BYTES = 10 * 1024 * 1024 - MULTIPART_OVERHEAD_HEADROOM_BYTES;

export const pubImageAccept = allowedPubImageMimeTypes.join(",");

const megabytes = (bytes: number) => Math.round((bytes / 1024 / 1024) * 10) / 10;

export const getPubImageFileError = (file: File): string | null => {
  if (!allowedPubImageMimeTypes.includes(file.type as never)) {
    return "JPG·PNG·WebP 이미지만 올릴 수 있어요.";
  }

  if (file.size > MAX_PUB_IMAGE_BYTES) {
    return `10MB 보다 작은 파일만 올릴 수 있어요. (선택한 파일 ${megabytes(file.size)}MB)`;
  }

  return null;
};
