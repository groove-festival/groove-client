import { FallbackScreen } from "./FallbackScreen";
import { reloadPage } from "./reloadPage";

interface MaintenanceFallbackProps {
  onReload?: () => void;
}

export const MaintenanceFallback = ({
  onReload = reloadPage,
}: MaintenanceFallbackProps) => {
  return (
    <FallbackScreen
      action={{ kind: "button", label: "페이지 새로고침", onClick: onReload }}
      variant="maintenance"
    />
  );
};
