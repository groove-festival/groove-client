import { type BoothDetail } from "@/entities/booth";

export const BoothDetailHeader = ({
  booth,
}: {
  booth: Pick<
    BoothDetail,
    "collegeAndDepartment" | "description" | "menuImageUrl" | "name"
  >;
}) => {
  return (
    <header className={`flex flex-col ${booth.menuImageUrl ? "gap-6" : ""}`}>
      {booth.menuImageUrl && (
        <img
          alt={`${booth.name} 메뉴판`}
          className="aspect-[361/512] w-full rounded-3xl object-cover"
          src={booth.menuImageUrl}
        />
      )}

      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-2xl leading-[29px] font-bold text-[#fcfcfc]">
            {booth.name}
          </h1>
          <p className="text-base leading-[19px] font-medium text-[#cfcfcf]">
            {booth.description}
          </p>
        </div>
        <p className="shrink-0 text-xl leading-6 text-[#cfcfcf]">
          {booth.collegeAndDepartment}
        </p>
      </div>
    </header>
  );
};
