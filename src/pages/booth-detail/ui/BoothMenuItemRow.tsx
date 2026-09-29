import { type BoothMenuItem, formatMenuOptionPriceDelta } from "@/entities/booth";

const priceFormatter = new Intl.NumberFormat("ko-KR");

const formatPrice = (price: number) => `${priceFormatter.format(price)}원`;

export const BoothMenuItemRow = ({ item }: { item: BoothMenuItem }) => {
  return (
    <li className="flex items-start justify-between gap-4 border-b border-[#767676] px-3 py-5 text-[#fcfcfc] last:border-b-0">
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-xl leading-6 font-semibold">{item.name}</p>
        {item.description && (
          <p className="text-sm leading-[17px] font-medium text-[#cfcfcf]">
            {item.description}
          </p>
        )}
        {item.options.length > 0 && (
          <ul aria-label={`${item.name} 옵션`} className="flex flex-col gap-1">
            {item.options.map((option) => (
              <li className="text-sm leading-[17px] text-[#cfcfcf]" key={option.id}>
                <span className="tabular-nums">
                  {formatMenuOptionPriceDelta(option.priceDelta)}
                </span>{" "}
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="shrink-0 text-right text-base leading-[19px] font-semibold">
        {item.isSoldOut ? "품절" : formatPrice(item.price)}
      </p>
    </li>
  );
};
