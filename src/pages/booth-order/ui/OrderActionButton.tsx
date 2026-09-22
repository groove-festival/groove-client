interface OrderActionButtonProps {
  label: string;
  onClick: () => void;
}

// 주문 흐름의 라임색 주요 버튼(주문하기·입금자명 수정하기·추가 주문하기).
export const OrderActionButton = ({ label, onClick }: OrderActionButtonProps) => {
  return (
    <button
      className="flex h-16 w-full items-center justify-center rounded-2xl bg-[#cfff04] p-2.5 text-xl leading-6 font-semibold text-[#1c1c1c]"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
};
