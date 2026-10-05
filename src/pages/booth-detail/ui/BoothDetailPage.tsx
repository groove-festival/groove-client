import { useState } from "react";
import { Navigate, useParams } from "react-router";

import {
  BoothDetailHeader,
  compareByOperatingDay,
  getBoothSpotCode,
  isBoothNotFound,
  useBoothDetail,
  useBooths,
} from "@/entities/booth";
import { LoadingFallback, NetworkErrorFallback } from "@/shared/ui";
import { readStorageItem, writeStorageItem } from "@/shared/lib/storage";

import { BoothMenuSection } from "./BoothMenuSection";
import { QrOrderNoticeDialog } from "./QrOrderNoticeDialog";

const QR_NOTICE_DISMISSED_STORAGE_KEY = "groove:booth-qr-notice-dismissed";

const hasDismissedQrNotice = () =>
  readStorageItem("local", QR_NOTICE_DISMISSED_STORAGE_KEY) === "true";

const SpotRedirect = ({ spotCode }: { spotCode: string }) => {
  const boothsQuery = useBooths();

  if (boothsQuery.isPending) {
    return <LoadingFallback />;
  }

  const target = (boothsQuery.data ?? [])
    .filter((booth) => getBoothSpotCode(booth) === spotCode)
    .sort(compareByOperatingDay)[0];

  return (
    <Navigate
      replace
      to={target ? `/pub/${encodeURIComponent(target.boothCode)}` : "/pub"}
    />
  );
};

export default function BoothDetailPage() {
  const { boothId } = useParams<{ boothId: string }>();
  const boothQuery = useBoothDetail(boothId);
  const [isQrNoticeOpen, setIsQrNoticeOpen] = useState(() => !hasDismissedQrNotice());

  if (!boothId) {
    return <Navigate replace to="/pub" />;
  }

  if (boothQuery.isError && isBoothNotFound(boothQuery.error)) {
    return <SpotRedirect key={boothId} spotCode={boothId} />;
  }

  if (boothQuery.isPending) {
    return <LoadingFallback />;
  }

  if (boothQuery.isError) {
    return <NetworkErrorFallback onReload={() => void boothQuery.refetch()} />;
  }

  const booth = boothQuery.data;

  const dismissQrNoticePermanently = () => {
    writeStorageItem("local", QR_NOTICE_DISMISSED_STORAGE_KEY, "true");
    setIsQrNoticeOpen(false);
  };

  return (
    <main
      className={`relative min-h-dvh bg-[#1c1c1c] px-4 text-[#fcfcfc] ${
        booth.menuBoardImageUrl
          ? `pt-[100px] ${isQrNoticeOpen ? "pb-11" : "pb-[42px]"}`
          : "pt-24 pb-[83px]"
      }`}
    >
      <BoothDetailHeader booth={booth} />

      <hr className="mt-6 border-t border-[#565656]" />

      <div className="mt-8 flex flex-col gap-8">
        {booth.menuSections.length === 0 && (
          <p className="py-10 text-center text-sm text-[#a2a2a2]">
            등록된 메뉴가 아직 없어요.
          </p>
        )}
        {booth.menuSections.map((section) => (
          <BoothMenuSection key={section.id} section={section} />
        ))}
      </div>

      {isQrNoticeOpen && (
        <QrOrderNoticeDialog
          onClose={() => setIsQrNoticeOpen(false)}
          onDismissPermanently={dismissQrNoticePermanently}
        />
      )}
    </main>
  );
}
