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

// 주막 코드가 아니라 자리 코드로 들어온 주소(예: 사범대 학과를 날짜별로 나누기 전의
// /pub/edu-kor-home)는 그 자리에서 오늘 여는 주막으로 보낸다. 목록(PUB-1)이 이미
// 오늘 쉬는 학과를 빼 주므로 남은 것 중 먼저 여는 쪽이다. 없는 자리면 목록으로 간다.
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
