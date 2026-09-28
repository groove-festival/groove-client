import { type Booth, getBoothDepartmentParts } from "../model/booths";

// 학과 조합 한 줄. 한 자리를 날짜별로 나눠 쓰는 연합주막은 두 학과를 모두 적고,
// 이 주막을 여는 학과만 굵게·밑줄로 짚는다. 다른 날 학과는 흐리게 둔다.
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
