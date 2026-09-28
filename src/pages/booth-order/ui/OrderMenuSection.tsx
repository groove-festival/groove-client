import { type BoothMenuItem, type BoothMenuSection } from "@/entities/booth";

import {
  getQuantity,
  isOptionSelected,
  type OrderCart,
  type OrderOptionSelection,
} from "../model/orderCart";
import { OrderMenuItemRow } from "./OrderMenuItemRow";

interface OrderMenuSectionProps {
  cart: OrderCart;
  onChangeQuantity: (item: BoothMenuItem, delta: number) => void;
  onToggleOption: (item: BoothMenuItem, optionId: number) => void;
  section: BoothMenuSection;
  selectedOptions: OrderOptionSelection;
}

export const OrderMenuSection = ({
  cart,
  onChangeQuantity,
  onToggleOption,
  section,
  selectedOptions,
}: OrderMenuSectionProps) => {
  return (
    <section aria-labelledby={`order-menu-section-${section.id}`}>
      <h2
        className="text-xl leading-6 font-bold text-[#fcfcfc]"
        id={`order-menu-section-${section.id}`}
      >
        {section.title}
      </h2>
      <ul className="mt-6">
        {section.items.map((item) => (
          <OrderMenuItemRow
            className="border-b border-[#767676] last:border-b-0"
            isOptionSelected={(optionId) =>
              isOptionSelected(selectedOptions, item, optionId)
            }
            item={item}
            key={item.id}
            onChangeQuantity={onChangeQuantity}
            onToggleOption={onToggleOption}
            quantity={getQuantity(cart, item)}
          />
        ))}
      </ul>
    </section>
  );
};
