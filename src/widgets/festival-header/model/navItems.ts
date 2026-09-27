export interface NavItem {
  label: string;
  to: string;
}

export const navItems: NavItem[] = [
  { label: "HOME", to: "/" },
  { label: "BOOTH", to: "/pub" },
  { label: "STORY", to: "/story" },
  { label: "SONG CONTEST", to: "/contest" },
  { label: "EVENT", to: "/event" },
  { label: "GROOVE PLAYLIST", to: "/playlist" },
  { label: "CREDITS", to: "/credits" },
];
