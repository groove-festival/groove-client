import { type BoothMenuSection as BoothMenuSectionModel } from "@/entities/booth";

import { BoothMenuItemRow } from "./BoothMenuItemRow";

export const BoothMenuSection = ({ section }: { section: BoothMenuSectionModel }) => {
  return (
    <section aria-labelledby={`menu-section-${section.id}`}>
      <h2
        className="text-xl leading-6 font-bold text-[#fcfcfc]"
        id={`menu-section-${section.id}`}
      >
        {section.title}
      </h2>
      <ul className="mt-6">
        {section.items.map((item) => (
          <BoothMenuItemRow item={item} key={item.id} />
        ))}
      </ul>
    </section>
  );
};
