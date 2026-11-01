/* The Paintoor wordmark as live text so it can scale to any size (header,
   footer heading, giant watermark). The dot over the i is always brand
   pink, at every size and in every language — the name itself never
   translates. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`whitespace-nowrap ${className}`} aria-label="Paintoor">
      <span aria-hidden="true">
        Pa
        <span className="relative inline-block leading-none">
          ı
          <span className="absolute left-1/2 top-[0.14em] h-[0.16em] w-[0.16em] -translate-x-1/2 rounded-full bg-saffron" />
        </span>
        ntoor
      </span>
    </span>
  );
}