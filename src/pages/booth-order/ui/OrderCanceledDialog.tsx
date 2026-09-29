import { warningIcon } from "@/shared/ui";

import { OrderDialogFrame } from "./OrderDialogFrame";

// 디자인에서 줄을 직접 나눈 문구는 같은 위치에서 줄바꿈한다.
const canceledNotices = [
  "품절 등의 이유로 주문이 취소되었어요.",
  "자세한 사항은 직원에게 문의해 주세요.",
];

// 관리자가 주문을 취소하면 PUB-5가 CANCELED를 내려준다. 닫기는 저장된 주문
// 토큰까지 버리고 메뉴 화면으로 돌아간다 (남겨두면 재진입할 때마다 다시 뜬다).
export const OrderCanceledDialog = ({ onClose }: { onClose: () => void }) => {
  return (
    <OrderDialogFrame
      className="flex w-80 flex-col items-center gap-8 rounded-[36px] px-6 py-8"
      labelledBy="order-canceled-dialog-title"
      onClose={onClose}
    >
      <div className="flex w-full flex-col items-center gap-3 text-[#fcfcfc]">
        <div className="flex w-[213px] flex-col items-center gap-3">
          <img alt="" className="size-20" src={warningIcon} />
          <h1
            className="w-full text-center text-2xl leading-[29px] font-semibold"
            id="order-canceled-dialog-title"
          >
            주문 취소 안내
          </h1>
        </div>

        <p className="w-full text-center text-base leading-6 font-normal">
          {canceledNotices.map((line) => (
            <span className="block" key={line}>
              {line}
            </span>
          ))}
        </p>
      </div>

      <button
        className="h-14 w-full rounded-[12px] bg-[#cfff04] text-center text-base font-semibold text-[#1c1c1c] transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none"
        onClick={onClose}
        type="button"
      >
        확인했습니다
      </button>
    </OrderDialogFrame>
  );
};
