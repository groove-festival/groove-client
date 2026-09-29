import { type BoothMenuSection as BoothMenuSectionModel } from "@/entities/booth";

import { BoothMenuItemRow } from "./BoothMenuItemRow";

export const BoothMenuSection = ({ section }: { section: BoothMenuSectionModel }) => {
  return (
    <section aria-labelledby={`menu-section-${section.id}`}>
      <h2
        className="text-lg leading-[22px] font-semibold text-[#fcfcfc]"
        id={`menu-section-${section.id}`}
      >
        {section.title}
      </h2>
      <ul className="mt-3">
        {section.items.map((item) => (
          <BoothMenuItemRow item={item} key={item.id} />
        ))}
      </ul>
    </section>
  );
};
