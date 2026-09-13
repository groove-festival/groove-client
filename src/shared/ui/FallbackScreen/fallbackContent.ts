import maintenanceIllustration from "../fallback-assets/maintenance.png";
import networkErrorIllustration from "../fallback-assets/network-error.png";
import pageErrorIllustration from "../fallback-assets/page-error.png";
import type { FallbackVariant } from "./types";

interface FallbackContent {
  illustration: string;
  messageLines: string[];
}

export const fallbackContent: Record<FallbackVariant, FallbackContent> = {
  maintenance: {
    illustration: maintenanceIllustration,
    messageLines: ["서비스 점검 중이에요"],
  },
  "network-error": {
    illustration: networkErrorIllustration,
    messageLines: ["네트워크 연결 상태를 확인 후", "다시 시도해 주세요"],
  },
  "not-found": {
    illustration: pageErrorIllustration,
    messageLines: ["페이지를 찾을 수 없어요"],
  },
};
