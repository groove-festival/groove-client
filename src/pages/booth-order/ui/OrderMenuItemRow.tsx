import { type BoothMenuItem } from "@/entities/booth";

import { formatWon } from "../lib/formatWon";
import { getMinimumQuantity } from "../model/orderCart";

interface OrderMenuItemRowProps {
  className?: string;
  item: BoothMenuItem;
  onChangeQuantity: (item: BoothMenuItem, delta: number) => void;
  quantity: number;
}

const formatItemPrice = (item: BoothMenuItem) => {
  if (item.isSoldOut) {
    return "품절";
  }

  return item.price === null ? "가격" : formatWon(item.price);
};

// 주문 화면의 메뉴 한 줄. 메뉴명·가격과 `- n +` 수량 조절로 구성한다.
export const OrderMenuItemRow = ({
  className = "",
  item,
  onChangeQuantity,
  quantity,
}: OrderMenuItemRowProps) => {
  const isOrderable = !item.isSoldOut && item.price !== null;

  return (
    <li
      className={`flex items-center justify-between px-6 py-4 text-[#fcfcfc] ${className}`}
    >
      <div className="flex min-w-0 flex-col gap-2 font-semibold">
        <p className="text-xl leading-6">{item.name}</p>
        <p className="text-base leading-[19px]">{formatItemPrice(item)}</p>
      </div>
      <div className="flex w-[63px] shrink-0 items-center justify-between">
        <button
          aria-label={`${item.name} 수량 줄이기`}
          className="text-2xl leading-[29px]"
          disabled={!isOrderable || quantity <= getMinimumQuantity(item)}
          onClick={() => onChangeQuantity(item, -1)}
          type="button"
        >
          -
        </button>
        <output aria-label={`${item.name} 수량`} className="text-xl leading-6">
          {quantity}
        </output>
        <button
          aria-label={`${item.name} 수량 늘리기`}
          className="text-2xl leading-[29px]"
          disabled={!isOrderable}
          onClick={() => onChangeQuantity(item, 1)}
          type="button"
        >
          +
        </button>
      </div>
    </li>
  );
};
