// Custom SAM CAMPUS SLOT mark — burgundy, peach and white.
// The monogram fuses three ideas into one glyph:
//   1) CAMPUS  — the notched roofline silhouette across the top
//   2) SLOT    — the 2x2 grid of rounded cells (classrooms / time slots)
//   3) SMART ALLOCATION — the diagonal "sweep" arm, like a clock hand / routing line,
//      connecting one cell to another to suggest a room being matched.
// It reads as an abstract "S" at a glance and holds up at favicon size.

export function LogoMark({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Sam Campus Slot"
    >
      <defs>
        <linearGradient id="scsGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B0D11" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#scsGrad)" />
      {/* campus roofline notch */}
      <path d="M9 15 L14 10 L19 15" stroke="white" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95" />
      {/* 2x2 slot grid */}
      <rect x="9" y="17" width="8" height="8" rx="2.2" fill="white" />
      <rect x="19.5" y="17" width="8" height="8" rx="2.2" fill="white" fillOpacity="0.5" />
      {/* smart allocation sweep — connects one slot to the target cell like a matched route,
          doubling as a clock hand pivoting from the grid's center */}
      <path d="M21 21 L30.5 11.5" stroke="#F4A261" strokeWidth="2.3" strokeLinecap="round" />
      <circle cx="30.5" cy="11.5" r="2.6" fill="#F4A261" />
    </svg>
  );
}

export default function Logo({ size = 'md', withText = true, compact = false, light = false, className = '' }) {
  const dims = { sm: 28, md: 36, lg: 48 }[size] || 36;
  const textSize = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl' }[size] || 'text-lg';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={dims} className="shrink-0" />
      {withText && (
        <span className={`font-display font-bold tracking-tight ${textSize} ${light ? 'text-white' : ''}`}>
          {compact ? (
            <>SCS</>
          ) : light ? (
            <>Sam Campus <span className="text-slot-300">Slot</span></>
          ) : (
            <>Sam Campus <span className="text-gradient">Slot</span></>
          )}
        </span>
      )}
    </div>
  );
}
