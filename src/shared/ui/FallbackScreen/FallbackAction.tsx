import { Link } from "react-router";

import type { FallbackScreenAction } from "./types";

interface FallbackActionProps {
  action: FallbackScreenAction;
}

const actionClassName =
  "font-pretendard inline-flex items-center justify-center rounded-full bg-[#5d00ff] px-6 py-3 text-base leading-[19px] font-medium text-[#fcfcfc]";

export const FallbackAction = ({ action }: FallbackActionProps) => {
  if (action.kind === "link") {
    return (
      <Link className={actionClassName} to={action.to} viewTransition>
        {action.label}
      </Link>
    );
  }

  return (
    <button className={actionClassName} onClick={action.onClick} type="button">
      {action.label}
    </button>
  );
};
