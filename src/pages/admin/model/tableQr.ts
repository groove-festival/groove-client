import { appConfig } from "@/shared/config";

export interface TableOrderUrlArgs {
  basePath?: string;
  boothCode: string;
  origin: string;
  tableCode: string;
}

export const buildTableOrderUrl = ({
  basePath = appConfig.basePath,
  boothCode,
  origin,
  tableCode,
}: TableOrderUrlArgs): string => {
  const prefix = basePath === "/" ? "" : basePath;

  return `${origin}${prefix}/pub/${encodeURIComponent(boothCode)}/${encodeURIComponent(tableCode)}`;
};
