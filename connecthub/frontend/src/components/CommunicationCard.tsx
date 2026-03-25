import { Link } from "react-router-dom";
import { type FeedItem } from "../types/cardTypes";

// Sample data from the hatchloom screen given
const feedItems: FeedItem[] = [
  {
    id: "tigerspark",
    hasUnread: true,
    avatar: "🐯",
    avatarBgClass: "bg-[#ff6b6b]",
    name: "TigerSpark",
    channel: "Design Thinking 101",
    text: "Has anyone finished the empathy map section? I'm stuck on identifying the pain points for the packaging brief.",
    time: "12m",
  },
  {
    id: "dolphindash",
    hasUnread: true,
    avatar: "🐬",
    avatarBgClass: "bg-[#4ecdc4]",
    name: "DolphinDash",
    channel: "Design Thinking 101",
    text: "Just posted my Reveal Day notes - Sarah Chen's challenge is harder than I thought! Who's teaming up?",
    time: "28m",
  },
  {
    id: "butterflybiz",
    hasUnread: false,
    avatar: "🦋",
    avatarBgClass: "bg-[#a855f7]",
    name: "ButterflyBiz",
    channel: "Open Community",
    text: "Tip: if you're doing customer interviews, record yourself practising first. I sounded so awkward on my first try 😅",
    time: "1h",
  },
  {
    id: "eagleeye",
    hasUnread: false,
    avatar: "🦅",
    avatarBgClass: "bg-[#f97316]",
    name: "EagleEye",
    channel: "Branding Basics",
    text: "Our team just finished the logo brief. Honestly way more fun than I expected. Check it out 👀",
    time: "2h",
  },
];

function CommunicationsCard() {
  return (
    <article className="border-border bg-card rounded-[18px] border-[1.5px] shadow-[0_2px_12px_rgba(0,0,0,0.05)] transition-all duration-200 hover:border-[#d1d5db] hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] md:col-span-2">
      <div className="border-border flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="bg-teal-light flex size-8 items-center justify-center rounded-[10px] text-base">
            💬
          </div>
          <h3 className="font-display text-charcoal font-extrabold">
            Communications
          </h3>
        </div>
        <Link
          to="/feed"
          type="button"
          className="font-display text-teal cursor-pointer text-xs font-bold transition-opacity hover:opacity-70"
        >
          Feed & Channels →
        </Link>
      </div>
      <div className="px-5 py-4">
        <div className="flex flex-col gap-2.5">
          {feedItems.map((item) => (
            <div
              key={item.id}
              className="bg-bg flex cursor-pointer items-start gap-2.5 rounded-[10px] px-3 py-2.5 transition-colors hover:bg-[#e8f8fb]"
            >
              <div
                className={`flex size-7.5 shrink-0 items-center justify-center rounded-full text-[0.9rem] ${item.avatarBgClass}`}
              >
                {item.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-charcoal text-[0.8rem] font-bold">
                  {item.name}
                </div>
                <p className="text-text mt-0.5 text-xs leading-normal">
                  {item.text}
                </p>
              </div>
              <span className="mt-0.5 shrink-0 text-[0.6rem] font-semibold text-[#c4c8d4]">
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default CommunicationsCard;
