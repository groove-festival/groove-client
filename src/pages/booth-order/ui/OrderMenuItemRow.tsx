import { type BoothMenuItem, formatMenuOptionPriceDelta } from "@/entities/booth";

import { formatWon } from "../lib/formatWon";

interface OrderMenuItemRowProps {
  className?: string;

  insetClassName?: string;
  isOptionSelected?: (optionId: number) => boolean;
  item: BoothMenuItem;
  onChangeQuantity: (item: BoothMenuItem, delta: number) => void;
  onToggleOption?: (item: BoothMenuItem, optionId: number) => void;
  quantity: number;
  showDescription?: boolean;
}

const formatItemPrice = (item: BoothMenuItem) => {
  if (item.isSoldOut) {
    return "품절";
  }

  return item.price === null ? "가격" : formatWon(item.price);
};

export const OrderMenuItemRow = ({
  className = "",
  insetClassName = "px-3",
  isOptionSelected = () => false,
  item,
  onChangeQuantity,
  onToggleOption,
  quantity,
  showDescription = false,
}: OrderMenuItemRowProps) => {
  const isOrderable = !item.isSoldOut && item.price !== null;
  const showsOptions = item.options.length > 0 && quantity > 0 && onToggleOption;

  return (
    <li
      className={`flex flex-col gap-3 py-4 text-[#fcfcfc] ${insetClassName} ${className}`}
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-2 font-semibold">
          <p className="text-xl leading-6">{item.name}</p>
          {showDescription && item.description && (
            <p className="text-sm leading-[17px] font-medium text-[#cfcfcf]">
              {item.description}
            </p>
          )}
          <p className="text-base leading-[19px]">{formatItemPrice(item)}</p>
        </div>
        <div className="flex w-[63px] shrink-0 items-center justify-between">
          <button
            aria-label={`${item.name} 수량 줄이기`}
            className="text-2xl leading-[29px]"
            disabled={!isOrderable || quantity <= 0}
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
      </div>

      {showsOptions && (
        <fieldset className="flex flex-col gap-2 rounded-2xl bg-[#2a2a2a] px-4 py-3">
          <legend className="sr-only">{item.name} 옵션</legend>
          <p aria-hidden="true" className="text-xs leading-[14px] text-[#a2a2a2]">
            해당되면 체크해 주세요
          </p>
          {item.options.map((option) => (
            <label
              className="flex items-center gap-2 text-sm leading-[17px] font-medium"
              key={option.id}
            >
              <input
                checked={isOptionSelected(option.id)}
                className="size-4 shrink-0 accent-[#cfff04]"
                onChange={() => onToggleOption(item, option.id)}
                type="checkbox"
              />
              <span className="min-w-0 flex-1">{option.label}</span>{" "}
              <span className="shrink-0 text-[#cfcfcf] tabular-nums">
                {formatMenuOptionPriceDelta(option.priceDelta)}
              </span>
            </label>
          ))}
        </fieldset>
      )}
    </li>
  );
};
