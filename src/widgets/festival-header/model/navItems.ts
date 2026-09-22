export interface NavItem {
  label: string;
  to: string;
}

export const navItems: NavItem[] = [
  { label: "HOME", to: "/" },
  { label: "BOOTH", to: "/pub" },
  { label: "SONG CONTEST", to: "/contest" },
  { label: "PROGRAM", to: "/coming-soon" },
  { label: "GROOVE PLAYLIST", to: "/playlist" },
  { label: "CREDITS", to: "/credits" },
];
