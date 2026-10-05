import { type Booth, getBoothDepartmentParts } from "../model/booths";

export const BoothDepartments = ({
  booth,
  className = "",
}: {
  booth: Pick<Booth, "departments" | "spotDepartments">;
  className?: string;
}) => {
  const parts = getBoothDepartmentParts(booth);
  const isShared = parts.some(({ isOwn }) => isOwn);

  return (
    <p className={className}>
      {parts.map(({ department, isOwn }, index) => (
        <span key={department}>
          {index > 0 && " • "}
          {isOwn ? (
            <strong
              className="font-bold underline decoration-[#cfff04] decoration-2 underline-offset-4"
              data-testid="booth-own-department"
            >
              {department}
            </strong>
          ) : (
            <span className={isShared ? "opacity-60" : ""}>{department}</span>
          )}
        </span>
      ))}
    </p>
  );
};
