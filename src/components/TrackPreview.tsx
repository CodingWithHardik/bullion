export function TrackPreview() {
  return (
    <div
      className="flex mb-6 min-h-52 flex-col gap-2.5 rounded-2xl border border-white/80 bg-[#0a0b0c] p-4 font-mono"
      aria-hidden="true"
    >
      <div className="flex items-end justify-between">
        <div>
          <div className="mb-1 text-[11px] uppercase tracking-[0.08em] text-gray-400">
            Portfolio Value
          </div>
          <div className="text-[28px] font-bold leading-none">$10,482</div>
        </div>
        <div className="text-right">
          <div className="mb-1 text-[11px] uppercase tracking-[0.08em] text-gray-400">
            Today
          </div>
          <div className="text-lg font-bold text-green-500">+4.8%</div>
        </div>
      </div>
      <svg
        viewBox="0 0 200 60"
        preserveAspectRatio="none"
        className="mt-auto h-21 w-full"
      >
        <defs>
          <linearGradient id="portfolio-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3ddc97" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3ddc97" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,48 L25,42 L50,46 L75,32 L100,36 L125,22 L150,26 L175,12 L200,8 L200,60 L0,60 Z"
          fill="url(#portfolio-fill)"
        />
        <path
          d="M0,48 L25,42 L50,46 L75,32 L100,36 L125,22 L150,26 L175,12 L200,8"
          fill="none"
          stroke="#3ddc97"
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
