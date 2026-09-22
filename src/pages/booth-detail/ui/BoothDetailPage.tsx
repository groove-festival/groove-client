import { useState } from "react";
import { Navigate, useParams } from "react-router";

import { isBoothNotFound, useBoothDetail } from "@/entities/booth";
import { LoadingFallback, NetworkErrorFallback } from "@/shared/ui";

import { BoothDetailHeader } from "./BoothDetailHeader";
import { BoothMenuSection } from "./BoothMenuSection";
import { QrOrderNoticeDialog } from "./QrOrderNoticeDialog";

const QR_NOTICE_DISMISSED_STORAGE_KEY = "groove:booth-qr-notice-dismissed";

const hasDismissedQrNotice = () => {
  try {
    return window.localStorage.getItem(QR_NOTICE_DISMISSED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

export default function BoothDetailPage() {
  const { boothId } = useParams<{ boothId: string }>();
  const boothQuery = useBoothDetail(boothId);
  const [isQrNoticeOpen, setIsQrNoticeOpen] = useState(() => !hasDismissedQrNotice());

  if (!boothId || (boothQuery.isError && isBoothNotFound(boothQuery.error))) {
    return <Navigate replace to="/pub" />;
  }

  if (boothQuery.isPending) {
    return <LoadingFallback />;
  }

  if (boothQuery.isError) {
    return <NetworkErrorFallback onReload={() => void boothQuery.refetch()} />;
  }

  const booth = boothQuery.data;

  const dismissQrNoticePermanently = () => {
    try {
      window.localStorage.setItem(QR_NOTICE_DISMISSED_STORAGE_KEY, "true");
    } catch {
      // Storage can be unavailable in private or restricted browsing contexts.
    }
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

      <div className="mt-12 flex flex-col gap-12">
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
