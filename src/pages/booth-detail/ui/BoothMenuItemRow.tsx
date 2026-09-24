import { type BoothMenuItem } from "@/entities/booth";

const priceFormatter = new Intl.NumberFormat("ko-KR");

const formatPrice = (price: number) => `${priceFormatter.format(price)}원`;

export const BoothMenuItemRow = ({ item }: { item: BoothMenuItem }) => {
  return (
    <li className="flex min-h-[100px] items-start justify-between gap-4 border-b border-[#767676] px-5 py-6 text-[#fcfcfc] last:min-h-[99px] last:border-b-0">
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-xl leading-6 font-semibold">{item.name}</p>
        {item.description && (
          <p className="text-base leading-[19px]">{item.description}</p>
        )}
      </div>
      <p className="shrink-0 text-right text-base leading-[19px] font-semibold">
        {item.isSoldOut ? "품절" : formatPrice(item.price)}
      </p>
    </li>
  );
};
