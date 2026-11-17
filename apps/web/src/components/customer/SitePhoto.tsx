/* SitePhoto - a photo that survives a missing asset.

   The demo seeds point at /jobs and /crew paths whose real photography lands
   with the pilot, so a load can fail. Instead of the browser's broken-image
   icon (which also collapses the box and shifts the layout), a failed load
   falls back to the same footprint as a camera tile. Sizes always come from
   the caller's className, so a strip, a thumbnail and a chat bubble each keep
   their own shape. */
"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icons";

export function SitePhoto({
  src,
  alt,
  className,
  tileClassName,
}: {
  src?: string;
  alt: string;
  className: string;
  tileClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  /* The same instance is reused across list items, so a new source gets a
     fresh chance to load instead of inheriting the previous failure. */
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className={`flex items-center justify-center bg-chuna ${tileClassName ?? ""} ${className}`}
      >
        <Icon name="camera" className="h-4 w-4 text-muted" />
      </span>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element -- demo site photos, no optimisation pass yet */
    <img src={src} alt={alt} onError={() => setFailed(true)} className={className} />
  );
}