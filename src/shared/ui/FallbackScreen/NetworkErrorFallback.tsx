import { FallbackScreen } from "./FallbackScreen";
import { reloadPage } from "./reloadPage";

interface NetworkErrorFallbackProps {
  onReload?: () => void;
}

export const NetworkErrorFallback = ({
  onReload = reloadPage,
}: NetworkErrorFallbackProps) => {
  return (
    <FallbackScreen
      action={{ kind: "button", label: "페이지 새로고침", onClick: onReload }}
      variant="network-error"
    />
  );
};
