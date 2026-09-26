import { appConfig } from "@/shared/config";

export interface TableOrderUrlArgs {
  basePath?: string;
  boothCode: string;
  origin: string;
  tableCode: string;
}

// PUB-A11이 함께 주는 orderPath는 API 경로 모양(`/pubs/{boothCode}/tables/
// {tableCode}`)이라 프론트 라우트(`/pub/{boothCode}/{tableCode}`)와 다르다.
// 그대로 QR에 넣으면 열리지 않는 주소가 되므로, 라우트를 소유한 쪽에서
// boothCode·tableCode로 직접 조립한다. orderPath는 대조용으로만 쓴다.
export const buildTableOrderUrl = ({
  basePath = appConfig.basePath,
  boothCode,
  origin,
  tableCode,
}: TableOrderUrlArgs): string => {
  const prefix = basePath === "/" ? "" : basePath;

  return `${origin}${prefix}/pub/${encodeURIComponent(boothCode)}/${encodeURIComponent(tableCode)}`;
};
