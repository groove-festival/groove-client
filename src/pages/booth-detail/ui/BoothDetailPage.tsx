import { useState } from "react";
import { Navigate, useParams } from "react-router";

import { getBoothDetailFixture } from "../model/boothDetailFixtures";
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
  const booth = boothId ? getBoothDetailFixture(boothId) : undefined;
  const [isQrNoticeOpen, setIsQrNoticeOpen] = useState(() => !hasDismissedQrNotice());

  if (!booth) {
    return <Navigate replace to="/pub" />;
  }

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
        booth.menuImageUrl
          ? `pt-[100px] ${isQrNoticeOpen ? "pb-11" : "pb-[42px]"}`
          : "pt-24 pb-[83px]"
      }`}
    >
      <BoothDetailHeader booth={booth} />

      <div className="mt-12 flex flex-col gap-12">
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
