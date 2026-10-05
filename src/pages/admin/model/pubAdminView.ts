import {
  ChefHat,
  LayoutGrid,
  type LucideIcon,
  ReceiptText,
  Settings,
  Wallet,
} from "lucide-react";

export type PubAdminView = "payment" | "kitchen" | "tables" | "history" | "settings";

export const pubAdminViews: { icon: LucideIcon; id: PubAdminView; label: string }[] = [
  { id: "payment", label: "입금 확인", icon: Wallet },
  { id: "kitchen", label: "주방", icon: ChefHat },
  { id: "tables", label: "테이블", icon: LayoutGrid },
  { id: "history", label: "주문 내역", icon: ReceiptText },
  { id: "settings", label: "주막 설정", icon: Settings },
];
