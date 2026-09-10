export interface NavItem {
  label: string;
  to: string;
}

export const navItems: NavItem[] = [
  { label: "HOME", to: "/" },
  { label: "BOOTH", to: "/coming-soon" },
  { label: "SONG CONTEST", to: "/coming-soon" },
  { label: "PROGRAM", to: "/coming-soon" },
  { label: "GROOVE PLAYLIST", to: "/playlist" },
  { label: "CREDITS", to: "/credits" },
];
