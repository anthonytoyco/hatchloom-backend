function TopHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 px-8 py-0">
      <div className="text-soft mb-3 flex items-center gap-2 text-xs font-semibold">
        <span className="text-pink cursor-pointer">Student Home</span>
        <span className="text-[#d1d5db]">›</span>
        <span className="text-text-soft">{title}</span>
      </div>
      <h1 className="font-display text-charcoal mb-[0.2rem] text-2xl font-black tracking-tight">
        🔗 <span className="text-teal">{title}</span>
      </h1>
      <p className="text-text-soft text-[0.875rem] font-medium">
        {description}
      </p>
    </div>
  );
}

export default TopHeader;
