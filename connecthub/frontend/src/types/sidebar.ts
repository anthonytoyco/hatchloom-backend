type SidebarItem = {
  name: string;
  icon: string;
  active?: boolean;
  link?: string;
};

type SidebarSection = {
  label: string;
  items: SidebarItem[];
};

export type { SidebarItem, SidebarSection };
