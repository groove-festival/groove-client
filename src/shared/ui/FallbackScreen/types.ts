export type FallbackVariant = "maintenance" | "network-error" | "not-found";

export interface FallbackActionLink {
  kind: "link";
  label: string;
  to: string;
}

export interface FallbackActionButton {
  kind: "button";
  label: string;
  onClick: () => void;
}

export type FallbackScreenAction = FallbackActionButton | FallbackActionLink;

export interface FallbackScreenProps {
  action: FallbackScreenAction;
  className?: string;
  variant: FallbackVariant;
}
