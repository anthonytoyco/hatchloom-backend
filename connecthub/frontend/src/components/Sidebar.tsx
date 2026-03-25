import { type SidebarItem, type SidebarSection } from "../types/sidebar";
import { Link } from "react-router-dom";

const HUB_HOME: SidebarItem = {
  name: "Hub Home",
  icon: "🔗",
  active: true,
};

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    label: "Communications",
    items: [
      {
        name: "Feed & Channels",
        icon: "💬",
        link: "/feed",
      },
      {
        name: "Mailbox",
        icon: "📬",
      },
      {
        name: "Upcoming Events",
        icon: "📅",
      },
    ],
  },
  {
    label: "Discovery & Community",
    items: [
      {
        name: "Community Directory",
        icon: "👥",
      },
      {
        name: "Classifieds",
        icon: "📋",
      },
      {
        name: "Organisations",
        icon: "🤝",
      },
    ],
  },
  {
    label: "Go-to-Market",
    items: [
      {
        name: "Loom Market",
        icon: "🪙",
      },
      {
        name: "External Markets",
        icon: "🛍",
      },
    ],
  },
];

function SidebarRow({ item }: { item: SidebarItem }) {
  return (
    <Link
      to={item.link || "#"}
      type="button"
      className={`flex w-full cursor-pointer items-center gap-2 rounded-[9px] px-3 py-2 text-left text-[0.8rem] font-semibold transition-all duration-200 ${
        item.active
          ? "bg-teal-light text-teal"
          : "text-text-soft hover:text-text hover:bg-[#f3f4f6]"
      }`}
    >
      <span className="w-4.5 shrink-0 text-center text-[0.9rem]">
        {item.icon}
      </span>
      <span>{item.name}</span>
    </Link>
  );
}

function Sidebar() {
  return (
    <aside className="bg-card border-border sticky top-14.5 flex h-[calc(100vh-58px)] w-53.75 flex-col overflow-y-auto border-r-[1.5px] pt-5 pb-8">
      <div className="px-3.5">
        <SidebarRow item={HUB_HOME} />
      </div>
      <div className="bg-border mx-3.5 my-2.5 h-px" />
      <div className="px-3.5">
        {SIDEBAR_SECTIONS.map(
          (section: SidebarSection, sectionIndex: number) => (
            <div key={section.label}>
              <div className="font-display mt-3 mb-[0.35rem] ml-2 text-[0.6rem] font-extrabold tracking-[0.09rem] text-[#c4c8d4] uppercase">
                {section.label}
              </div>
              <div className="space-y-[0.1rem]">
                {section.items.map((item: SidebarItem) => (
                  <SidebarRow
                    key={`${section.label}-${item.name}`}
                    item={item}
                  />
                ))}
              </div>
              {sectionIndex < SIDEBAR_SECTIONS.length - 1 ? (
                <div className="bg-border my-2.5 h-px" />
              ) : null}
            </div>
          ),
        )}
      </div>
      <div className="flex-1" />
      <button
        type="button"
        className="font-display bg-pink mx-3.5 block w-[calc(100%-1.75rem)] rounded-[10px] px-4 py-[0.6rem] text-center text-[0.8rem] font-bold text-white transition-colors duration-200 hover:bg-[#e6004e]"
      >
        💬 Contact Hatchloom
      </button>
    </aside>
  );
}

export default Sidebar;
