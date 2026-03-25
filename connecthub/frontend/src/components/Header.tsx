import { useMemo, useState } from "react";
import {
  type NavLink,
  type NotificationItem,
  type NotificationPanelType,
} from "../types/navlinks";
import { useConnecthubContext } from "../context/ConnecthubContext";
import { Link } from "react-router-dom";
import apiClient from "../api/client";
import { getTimeLabel } from "../utils/dateUtils";

const NAV_LINKS: NavLink = [
  { name: "Explore", emoji: "🔭" },
  { name: "Connect", emoji: "🔗", link: "/" },
  { name: "Launch", emoji: "🚀" },
];

function Header() {
  const {
    classifiedNotifications,
    classifiedUnreadCount,
    messageNotifications,
    messageUnreadCount,
  } = useConnecthubContext();
  const [activePanel, setActivePanel] = useState<NotificationPanelType>(null);

  const panelTitle =
    activePanel === "messages" ? "Messages" : "Classified Notifications";

  // Try to display active notifications
  const activeNotifications = useMemo<NotificationItem[]>(() => {
    if (activePanel === "messages") {
      return (messageNotifications as NotificationItem[]) ?? [];
    }

    if (activePanel === "classified") {
      return (classifiedNotifications as NotificationItem[]) ?? [];
    }

    return [];
  }, [activePanel, messageNotifications, classifiedNotifications]);

  const togglePanel = (panel: Exclude<NotificationPanelType, null>) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  return (
    <header>
      <nav className="border-b-1.5 border-border bg-card sticky top-0 z-100 flex h-15 items-center justify-between border-solid px-7 py-0 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3">
          <div className="font-display text-pink text-[1.35rem] font-black tracking-tight">
            hatch<span className="text-charcoal">loom</span>
          </div>
          <div className="font-display bg-teal-light text-teal border-teal-border rounded-[99px] border-[1.5px] border-solid px-[0.6rem] py-1 text-[0.68rem] font-bold">
            Student
          </div>
          <div className="font-display text-text-soft text-[0.78rem] font-semibold">
            Ridgewood Academy
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              to={link.link || "#"}
              className="font-display text-text-soft hover:text-text cursor-pointer space-x-2 rounded-lg px-[0.9rem] py-[0.45rem] text-[0.875rem] font-semibold transition-all duration-200 hover:bg-[#f3f4f6]"
            >
              <span>{link.emoji}</span>
              <span>{link.name}</span>
            </Link>
          ))}
        </div>
        <div className="relative flex items-center gap-2.5">
          <div className="font-display flex items-center gap-[0.35rem] rounded-[99px] border-[1.5px] border-[#ffd98a] bg-linear-to-br from-[#fff7e6] to-[#fff0cc] px-3 py-[0.35rem] text-[0.8rem] font-extrabold text-[#b45309]">
            🔥 18-day streak
          </div>
          <div className="font-display border-teal-border from-teal-light text-teal flex items-center gap-[0.35rem] rounded-[99px] border-[1.5px] bg-linear-to-br to-[#e0f5f9] px-3 py-[0.35rem] text-[0.8rem] font-extrabold">
            ⚡ 2,450 XP
          </div>
          <button
            type="button"
            onClick={() => togglePanel("messages")}
            className="bg-bg border-border relative flex size-8.5 cursor-pointer items-center justify-center rounded-full border-[1.5px] text-[1rem]"
          >
            ✉️
            <div className="bg-pink absolute -top-0.75 -right-0.75 flex size-3.75 items-center justify-center rounded-full border-2 border-white text-[0.55rem] font-extrabold text-white">
              {messageUnreadCount}
            </div>
          </button>
          <button
            type="button"
            onClick={() => togglePanel("classified")}
            className="bg-bg border-border relative flex size-8.5 cursor-pointer items-center justify-center rounded-full border-[1.5px]"
          >
            🔔
            <div className="bg-pink absolute -top-0.75 -right-0.75 flex size-3.75 items-center justify-center rounded-full border-2 border-white text-[0.50rem] font-extrabold text-white">
              {classifiedUnreadCount}
            </div>
          </button>
          <div className="from-charcoal flex size-9 cursor-pointer items-center justify-center rounded-full border-[2.5px] border-white bg-linear-to-br to-[#3d3060] text-[1.2rem] shadow-[0_2px_8px_rgba(8,145,178,0.2)]">
            🦊
          </div>
          {activePanel && (
            <div className="bg-card border-border absolute top-12 right-12 w-85 rounded-2xl border-[1.5px] p-3 shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
              <div className="mb-2 flex items-center justify-between border-b border-[#ececf1] pb-2">
                <h3 className="font-display text-charcoal text-sm font-extrabold">
                  {panelTitle}
                </h3>
                <button
                  type="button"
                  onClick={() => setActivePanel(null)}
                  className="text-text-soft hover:text-charcoal cursor-pointer rounded-full px-2 py-0.5 font-extrabold"
                >
                  X
                </button>
              </div>
              <div className="max-h-90 overflow-y-auto pr-1">
                {activeNotifications.length === 0 ? (
                  <div>
                    <div className="text-text-soft font-display rounded-xl bg-[#f7f8fa] px-3 py-5 text-center text-[0.8rem] font-semibold">
                      No notifications yet.
                    </div>
                    {activePanel === "classified" && (
                      <div className="mt-4">
                        <SubscribeButton />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeNotifications.map((item, index) => (
                      <div
                        key={item.id ?? index}
                        className="rounded-xl border border-[#ececf1] bg-white px-3 py-2.5"
                      >
                        <p className="text-charcoal font-display text-xs leading-5 font-semibold">
                          {item.message}
                        </p>
                        <p className="text-text-soft mt-1 text-[0.65rem] font-semibold">
                          {getTimeLabel(item.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

function SubscribeButton() {
  const { isSubscribedToClassified, setIsSubscribedToClassified } =
    useConnecthubContext();
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);

  const subscribe = async () => {
    if (isSubscribedToClassified || isSubscribing) return;

    setIsSubscribing(true);

    try {
      const response = await apiClient.post("/api/classified/subscriptions");

      if (response.status === 201) {
        console.log(response.data);
        setIsSubscribedToClassified(true);
      }
    } catch (error) {
      console.error("Subscription failed:", error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const unsubscribe = async () => {
    if (!isSubscribedToClassified || isSubscribing) return;

    setIsSubscribing(true);
    try {
      const response = await apiClient.delete("/api/classified/subscriptions");

      if (response.status === 200) {
        console.log(response.data);
        setIsSubscribedToClassified(false);
      }
    } catch (error) {
      console.error("Unsubscription failed:", error);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <button>
      {isSubscribedToClassified ? (
        <span
          onClick={unsubscribe}
          className="font-display cursor-pointer rounded-lg border border-red-200 px-3 py-1 text-sm text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-800"
        >
          Unsubscribe
        </span>
      ) : (
        <span
          onClick={subscribe}
          className="font-display cursor-pointer rounded-lg border border-green-200 px-3 py-1 text-sm text-green-600 transition-all duration-200 hover:bg-green-50 hover:text-green-800"
        >
          Subscribe
        </span>
      )}
    </button>
  );
}

export default Header;
