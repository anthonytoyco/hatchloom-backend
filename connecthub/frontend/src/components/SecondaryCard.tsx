import type { SecondaryCardProps, itemTypes } from "../types/cardTypes";

function SecondaryCard({
  title,
  icon,
  iconBackground,
  linkText,
  items,
}: SecondaryCardProps) {
  return (
    <article className="border-border bg-card rounded-2xl border-[1.5px] shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-[#d1d5db] hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)]">
      <div className="border-border flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <div
            className={`flex size-8 items-center justify-center rounded-[10px] text-base ${iconBackground}`}
          >
            {icon}
          </div>
          <h3 className="font-display text-charcoal font-extrabold">{title}</h3>
        </div>
        <button
          type="button"
          className="font-display text-teal cursor-pointer text-xs font-bold transition-opacity hover:opacity-70"
        >
          {linkText} →
        </button>
      </div>
      <div className="px-5 py-4">
        <div className="flex flex-col gap-2">
          {items.map((item: itemTypes) => (
            <div
              key={item.id}
              className="bg-bg flex cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#e8f8fb]"
            >
              <span className="mt-px shrink-0 text-lg">{item.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="text-text text-sm leading-[1.35] font-semibold">
                  <span className="font-display text-charcoal font-extrabold">
                    {item.title}
                  </span>
                </div>
              </div>
              <span
                className={`font-display mt-0.5 shrink-0 rounded-[99px] px-1.5 py-[0.1rem] text-xs font-bold ${item.typeClass}`}
              >
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default SecondaryCard;
