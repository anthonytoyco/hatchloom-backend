import { useConnecthubContext } from "../context/ConnecthubContext";
import { useState, useEffect } from "react";
import apiClient from "../api/client";

function StatusBar() {
  const [peopleApplied, setPeopleApplied] = useState<number>(0);
  const [applicationUpdates, setApplicationUpdates] = useState<number>(0);
  const { messageUnreadCount, totalUnreadCount } = useConnecthubContext();

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const response = await apiClient.get(
          "/api/classified/applications/me",
          {
            withCredentials: true,
          },
        );
        console.log("Application data response:", response.data);
        const applications = response.data;

        setPeopleApplied(applications.classifiedPosts.length);
        setApplicationUpdates(applications.totalApplications);
      } catch (error) {
        console.error("Error fetching application data:", error);
      }
    };

    fetchApplicationData();
  }, []);
  return (
    <section className="border-border bg-card mx-8 mb-7 grid grid-cols-[1fr_1px_1fr_1px_1fr] items-center rounded-2xl border-[1.5px] px-5 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="px-0 pr-5">
        <div className="font-display mb-2 flex items-center gap-1.5 text-[0.62rem] font-extrabold tracking-[0.08em] text-[#c4c8d4] uppercase">
          💬 Messages
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="text-text hover:text-teal flex cursor-pointer items-center gap-2 text-[0.78rem] font-semibold">
            <span className="bg-teal size-1.5 rounded-full" />
            <span>Unread in Feed & Channels</span>
            <span className="font-display text-pink ml-auto rounded-[99px] bg-[#fff0f5] px-2 py-[0.08rem] text-[0.65rem] font-extrabold">
              {totalUnreadCount > 0 ? totalUnreadCount : 0}
            </span>
          </div>
          <div className="text-text hover:text-teal flex cursor-pointer items-center gap-2 text-[0.78rem] font-semibold">
            <span className="bg-teal size-1.5 rounded-full" />
            <span>Unread in Mailbox</span>
            <span className="bg-teal-light font-display text-teal ml-auto rounded-[99px] px-2 py-[0.08rem] text-[0.65rem] font-extrabold">
              {messageUnreadCount > 0 ? messageUnreadCount : 0}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-border h-10 w-px" />
      <div className="px-5">
        <div className="font-display mb-2 flex items-center gap-1.5 text-[0.62rem] font-extrabold tracking-[0.08em] text-[#c4c8d4] uppercase">
          📅 Next Event
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="text-text hover:text-teal flex cursor-pointer items-center gap-2 text-[0.78rem] font-semibold">
            <span className="bg-orange size-1.5 rounded-full" />
            <span>Market Square Pop Up - Kensington</span>
            <span className="font-display text-pink ml-auto rounded-[99px] bg-[#fff0f5] px-2 py-[0.08rem] text-[0.65rem] font-extrabold">
              Sat
            </span>
          </div>
          <div className="text-text hover:text-teal flex cursor-pointer items-center gap-2 text-[0.78rem] font-semibold">
            <span className="bg-orange size-1.5 rounded-full" />
            <span>Design Thinking 101 - Pitch Day</span>
            <span className="font-display text-text-soft ml-auto rounded-[99px] bg-[#f3f4f6] px-2 py-[0.08rem] text-[0.65rem] font-extrabold">
              Mar 4
            </span>
          </div>
        </div>
      </div>

      <div className="bg-border h-10 w-px" />

      <div className="px-5 pr-0 pl-5">
        <div className="font-display mb-2 flex items-center gap-1.5 text-[0.62rem] font-extrabold tracking-[0.08em] text-[#c4c8d4] uppercase">
          📋 Classifieds
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="text-text hover:text-teal flex cursor-pointer items-center gap-2 text-[0.78rem] font-semibold">
            <span className="bg-pink size-1.5 rounded-full" />
            <span>Applied to your roles</span>
            <span className="font-display text-pink ml-auto rounded-[99px] bg-[#fff0f5] px-2 py-[0.08rem] text-[0.65rem] font-extrabold">
              {peopleApplied > 0 ? peopleApplied : 0}
            </span>
          </div>
          <div className="text-text hover:text-teal flex cursor-pointer items-center gap-2 text-[0.78rem] font-semibold">
            <span className="bg-pink size-1.5 rounded-full" />
            <span>Your applications updates</span>
            <span className="bg-teal-light font-display text-teal ml-auto rounded-[99px] px-2 py-[0.08rem] text-[0.65rem] font-extrabold">
              {applicationUpdates > 0 ? applicationUpdates : 0}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StatusBar;
