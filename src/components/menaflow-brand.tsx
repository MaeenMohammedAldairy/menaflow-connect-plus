export function MenaFlowMark() {
  return (
    <svg viewBox="0 0 76 44" fill="none" aria-hidden="true">
      <defs>
        <linearGradient
          id="brand-gradient"
          x1="5"
          y1="35"
          x2="68"
          y2="7"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--brand-light)" />
          <stop offset="1" stopColor="var(--primary)" />
        </linearGradient>
      </defs>
      <path
        d="M2 40 22 10c4-6 10-7 15-1l10 13L61 3H51V0h23v22h-4V11L49 39c-4 5-10 5-14-1L24 23 13 40H2Z"
        fill="url(#brand-gradient)"
      />
      <path d="m55 40 10-15 10 15H55Z" fill="var(--primary)" />
    </svg>
  );
}
