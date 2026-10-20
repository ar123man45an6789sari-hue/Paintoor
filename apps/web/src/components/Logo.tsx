
import Image from "next/image";

export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <Image
      src="/paintoor-mark.png"
      alt=""
      aria-hidden="true"
      width={64}
      height={64}
      className={className}
    />
  );
}