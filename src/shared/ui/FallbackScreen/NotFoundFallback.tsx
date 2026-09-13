import { FallbackScreen } from "./FallbackScreen";

export const NotFoundFallback = () => {
  return (
    <FallbackScreen
      action={{ kind: "link", label: "홈으로 가기", to: "/" }}
      variant="not-found"
    />
  );
};
