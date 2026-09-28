import { ChefHat, type LucideIcon, ReceiptText, Settings, Wallet } from "lucide-react";

// 주막 관리자 화면 목록. 주소의 ?view= 값이자 하단 탭의 순서다.
export type PubAdminView = "payment" | "kitchen" | "history" | "settings";

export const pubAdminViews: { icon: LucideIcon; id: PubAdminView; label: string }[] = [
  { id: "payment", label: "입금 확인", icon: Wallet },
  { id: "kitchen", label: "주방", icon: ChefHat },
  { id: "history", label: "주문 내역", icon: ReceiptText },
  { id: "settings", label: "주막 설정", icon: Settings },
];
