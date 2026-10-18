type LogoProps = {
  className?: string;
};

/** Brand mark: house cradled by a hand, spark above the roof. */
export function Logo({ className = "h-8 w-8" }: LogoProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path d="M12 30 L32 14 L52 30" stroke="#F2762E" strokeWidth="5" strokeLinecap="round" />
      <path d="M18 30 V50 H46 V30" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M14 44 C22 38 30 40 34 44 C40 49 48 47 52 42" stroke="#F2762E" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="44" cy="10" r="4" fill="#FFB03A" />
    </svg>
  );
}