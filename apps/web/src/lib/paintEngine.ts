/* Paintoor paint engine v1 — pure, framework-agnostic image maths for the
   wall-paint simulator. Everything runs on the visitor's device: photos are
   decoded, analysed and recoloured locally and never uploaded anywhere.

   Why it stays fast (no spinners, no buffering):
   - The base photo is shown by a plain <img> tag, so the picture lands on
     screen in the very first frame while pixel analysis runs afterwards.
   - The selection mask is a plain byte array, not a canvas, so brush and
     eraser strokes only touch the pixels they actually cover. There is never
     a full-image read-back while dragging.
   - Recolouring writes into one reusable ImageData buffer and only the dirty
     rectangle of the current stroke is pushed to the screen per frame.
   - Decoding and downscaling use createImageBitmap(), which browsers run off
     the main thread; a plain <img> decode is used only as a fallback. */

export type Pixel = { r: number; g: number; b: number };

export type Rect = { x: number; y: number; w: number; h: number };

/** RGBA pixel buffer backed by a plain (non-shared) ArrayBuffer, exactly what
 *  ImageData and canvas getImageData() hand us. */
export type Rgba = Uint8ClampedArray<ArrayBuffer>;

/** A frozen "save progress" layer: the selection and paint parameters exactly
 *  as they were when the visitor pressed Save. Layers are baked into the
 *  working photo, so later shade changes can never touch them. */
export type PaintLayer = {
  mask: Uint8Array;
  shade: Pixel;
  intensity: number;
  meanLum: number;
};

export type PaintJob = {
  width: number;
  height: number;
  /** The decoded photo, untouched forever. */
  original: Rgba;
  /** Working photo = original + every saved layer. Matching, recolouring and
   *  export all read this, which is why saved progress behaves like real
   *  dried paint. */
  base: Rgba;
  /** Perceptual luminance per pixel, 0..255. */
  lum: Uint8Array;
  /** Selection strength per pixel, 0..255. This is the single source of truth. */
  mask: Uint8Array;
  /** Wall colours sampled with the picker; they drive the colour match. */
  picks: Pixel[];
  /** Colour-match tolerance, 0..100. */
  tolerance: number;
  /** When true a tap only selects the connected region around the tap point. */
  connected: boolean;
  /** Paint opacity, 0..1. */
  intensity: number;
  /** Chosen paint colour. */
  shade: Pixel;
  /** Mean luminance inside the current selection, used to keep lighting. */
  meanLum: number;
  /** Frozen "save progress" layers, oldest first. */
  layers: PaintLayer[];
  /** Reusable BFS scratch buffers (connected mode only). */
  stack?: Int32Array;
  visited?: Uint8Array;
};

/* ------------------------------------------------------------------ *
 * colour helpers
 * ------------------------------------------------------------------ */

export function hexToPixel(hex: string): Pixel {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function pixelToHex(p: Pixel): string {
  const to = (v: number) => v.toString(16).padStart(2, "0");
  return `#${to(p.r)}${to(p.g)}${to(p.b)}`;
}

/** Squared chromaticity distance between a sampled pick and a pixel.
 *
 *  Plain RGB distance confuses brightness with hue: a bright blue sky looks
 *  "close" to a bright cream wall, while a shadowed corner of that same wall
 *  looks "far". Chromaticity (colour divided by its own total) removes
 *  brightness from the comparison, so one tap selects the whole wall —
 *  sunlight and shadow alike — and leaves sky, plants and wood alone.
 *
 *  The division is cross-multiplied away so the hot loop stays integer-fast:
 *  (r/s - r0/s0) <= t  <=>  (r*s0 - r0*s)^2 <= t^2 * (s*s0)^2 */
function chromaHit(
  ps: number,
  pr: number,
  pg: number,
  thr: number,
  mul: number,
  r: number,
  g: number,
  b: number,
): boolean {
  const s = r + g + b;
  if (s < 24) return false; /* near-black: chromaticity is meaningless */
  const dr = r * ps - pr * s;
  const dg = g * ps - pg * s;
  return dr * dr + dg * dg <= thr * mul * ps * ps * s * s;
}

/** Slider value 0..100 -> squared chromaticity threshold. Calibrated on real
 *  room photos: ~45 covers one wall from sunlit patch to shaded corner while
 *  rejecting sky, foliage and wood. */
export function toleranceThreshold(tolerance: number): number {
  const t = (tolerance / 100) * 0.12;
  return t * t;
}

/* ------------------------------------------------------------------ *
 * job creation
 * ------------------------------------------------------------------ */

export function createJob(original: Rgba, width: number, height: number): PaintJob {
  const lum = new Uint8Array(width * height);
  computeLumInto(original, lum);
  return {
    width,
    height,
    original,
    /* base aliases original until the first saved layer needs a writable copy. */
    base: original,
    lum,
    mask: new Uint8Array(width * height),
    picks: [],
    tolerance: 45,
    connected: false,
    intensity: 1,
    shade: hexToPixel("#e00048"),
    meanLum: 200,
    layers: [],
  };
}

export function computeLumInto(base: Rgba, lum: Uint8Array): void {
  for (let p = 0, i = 0; p < lum.length; p += 1, i += 4) {
    /* ITU-R BT.601 luma, integer form. */
    lum[p] = (base[i] * 54 + base[i + 1] * 183 + base[i + 2] * 19) >> 8;
  }
}

/** Decode a photo (File/Blob or same-origin URL) into a job at a working
 *  resolution whose longest side is at most maxDim. */
export async function loadJob(source: Blob | string, maxDim: number): Promise<PaintJob> {
  const { data, width, height } = await decode(source, maxDim);
  return createJob(data, width, height);
}

async function decode(
  source: Blob | string,
  maxDim: number,
): Promise<{ data: Rgba; width: number; height: number }> {
  const bitmap = await decodeToBitmap(source, maxDim);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("canvas unavailable");
    ctx.drawImage(bitmap, 0, 0);
    const img = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
    return { data: img.data, width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close?.();
  }
}

async function decodeToBitmap(source: Blob | string, maxDim: number): Promise<ImageBitmap> {
  if (typeof createImageBitmap === "function") {
    try {
      const blob = typeof source === "string" ? await (await fetch(source)).blob() : source;
      const probe = await createImageBitmap(blob, { imageOrientation: "from-image" });
      const scale = Math.min(1, maxDim / Math.max(probe.width, probe.height));
      probe.close();
      if (scale >= 1) return createImageBitmap(blob, { imageOrientation: "from-image" });
      return createImageBitmap(blob, {
        imageOrientation: "from-image",
        resizeWidth: Math.max(1, Math.round(probe.width * scale)),
        resizeHeight: Math.max(1, Math.round(probe.height * scale)),
        resizeQuality: "high",
      });
    } catch {
      /* fall through to the <img> path (older Safari, odd blobs) */
    }
  }
  const url = typeof source === "string" ? source : URL.createObjectURL(source);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("image decode failed"));
      el.src = url;
    });
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("canvas unavailable");
    ctx.drawImage(img, 0, 0, width, height);
    const buf = ctx.getImageData(0, 0, width, height);
    return await createImageBitmapFromBuffer(buf);
  } finally {
    if (typeof source !== "string") URL.revokeObjectURL(url);
  }
}

/** Wrap raw pixels in an ImageBitmap without touching the main-thread decoder. */
async function createImageBitmapFromBuffer(buf: ImageData): Promise<ImageBitmap> {
  const canvas = document.createElement("canvas");
  canvas.width = buf.width;
  canvas.height = buf.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.putImageData(buf, 0, 0);
  return createImageBitmap(canvas);
}

/* ------------------------------------------------------------------ *
 * selection: colour match (whole photo or connected region)
 * ------------------------------------------------------------------ */

type PickDesc = { ps: number; pr: number; pg: number; l0: number; r: number; g: number; b: number };

function preparePicks(picks: Pixel[]): PickDesc[] {
  return picks.map((p) => ({
    ps: p.r + p.g + p.b,
    pr: p.r,
    pg: p.g,
    l0: (p.r * 54 + p.g * 183 + p.b * 19) >> 8,
    r: p.r,
    g: p.g,
    b: p.b,
  }));
}

/** Rebuild the mask from the sampled picks. Returns how many pixels matched. */
export function matchColours(job: PaintJob, anchor?: { x: number; y: number }): number {
  const { width, height, base, lum, mask, picks } = job;
  const thr = toleranceThreshold(job.tolerance);
  const desc = preparePicks(picks);

  if (anchor && job.connected) {
    mask.fill(0);
    const total = width * height;
    if (!job.stack || job.stack.length < total) job.stack = new Int32Array(total);
    if (!job.visited || job.visited.length < total) job.visited = new Uint8Array(total);
    const stack = job.stack;
    const visited = job.visited;
    visited.fill(0);
    let count = 0;
    let top = 0;
    /* Mark visited at push time: every pixel then enters the stack at most
       once, so the fixed-size stack can never overflow. */
    const start = anchor.y * width + anchor.x;
    stack[top++] = start;
    visited[start] = 1;
    while (top > 0) {
      const p = stack[--top];
      const i = p * 4;
      if (!matchesAny(desc, thr, lum[p], base[i], base[i + 1], base[i + 2])) continue;
      mask[p] = 255;
      count += 1;
      const x = p % width;
      if (x > 0 && !visited[p - 1]) {
        visited[p - 1] = 1;
        stack[top++] = p - 1;
      }
      if (x < width - 1 && !visited[p + 1]) {
        visited[p + 1] = 1;
        stack[top++] = p + 1;
      }
      if (p - width >= 0 && !visited[p - width]) {
        visited[p - width] = 1;
        stack[top++] = p - width;
      }
      if (p + width < total && !visited[p + width]) {
        visited[p + width] = 1;
        stack[top++] = p + width;
      }
    }
    return count;
  }

  let count = 0;
  for (let p = 0, i = 0; p < mask.length; p += 1, i += 4) {
    const hit = matchesAny(desc, thr, lum[p], base[i], base[i + 1], base[i + 2]);
    mask[p] = hit ? 255 : 0;
    if (hit) count += 1;
  }
  return count;
}

function matchesAny(desc: PickDesc[], thr: number, L: number, r: number, g: number, b: number): boolean {
  for (let k = 0; k < desc.length; k += 1) {
    const d = desc[k];
    /* Same-colour safety net: an exact neighbourhood always matches. */
    const ar = r - d.r;
    const ag = g - d.g;
    const ab = b - d.b;
    if (ar * ar + ag * ag + ab * ab <= 576) return true;
    /* Brightness window: a wall's own shadow may be much darker than the tap
       point, but a black object sharing its tint is not the wall. */
    if (L < d.l0 * 0.22 || L > d.l0 * 1.45 + 30) continue;
    /* Shadows estimate chromaticity poorly, so the match window widens as a
       pixel gets darker than the tap point. This is what lets one tap cover
       a wall from its sunlit patch down to the corner behind a table. */
    const dark = d.l0 > L ? (d.l0 - L) / d.l0 : 0;
    const mul = (1 + 1.5 * dark) * (1 + 1.5 * dark);
    if (chromaHit(d.ps, d.pr, d.pg, thr, mul, r, g, b)) return true;
  }
  return false;
}

/* ------------------------------------------------------------------ *
 * selection: manual brush / eraser strokes
 * ------------------------------------------------------------------ */

/** Square stamp with a 2px anti-aliased rim, like a real brush/eraser tip. */
export function stampSquare(job: PaintJob, cx: number, cy: number, radius: number, add: boolean): Rect {
  const { width, height, mask } = job;
  const r = Math.max(1, Math.round(radius));
  const x0 = Math.max(0, cx - r);
  const x1 = Math.min(width - 1, cx + r);
  const y0 = Math.max(0, cy - r);
  const y1 = Math.min(height - 1, cy + r);
  for (let y = y0; y <= y1; y += 1) {
    const dy = Math.abs(y - cy);
    const row = y * width;
    for (let x = x0; x <= x1; x += 1) {
      const dx = Math.abs(x - cx);
      const d = dx > dy ? dx : dy;
      /* 2px anti-aliased rim so hand strokes do not look cut out. */
      const edge = Math.min(1, Math.max(0, (r - d) / 2 + 0.5));
      const p = row + x;
      if (add) mask[p] = Math.max(mask[p], Math.round(255 * edge));
      else mask[p] = Math.min(mask[p], Math.round(255 * (1 - edge)));
    }
  }
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/** Interpolate a stroke between two points so fast drags stay continuous. */
export function stampLine(
  job: PaintJob,
  from: { x: number; y: number },
  to: { x: number; y: number },
  radius: number,
  add: boolean,
): Rect {
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const step = Math.max(1, radius / 3);
  const steps = Math.max(1, Math.ceil(dist / step));
  let minX = Math.min(from.x, to.x) - radius;
  let minY = Math.min(from.y, to.y) - radius;
  let maxX = Math.max(from.x, to.x) + radius;
  let maxY = Math.max(from.y, to.y) + radius;
  for (let s = 1; s <= steps; s += 1) {
    const t = s / steps;
    stampSquare(job, Math.round(from.x + (to.x - from.x) * t), Math.round(from.y + (to.y - from.y) * t), radius, add);
  }
  minX = Math.max(0, Math.round(minX));
  minY = Math.max(0, Math.round(minY));
  maxX = Math.min(job.width - 1, Math.round(maxX));
  maxY = Math.min(job.height - 1, Math.round(maxY));
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

export function clearMask(job: PaintJob): void {
  job.mask.fill(0);
  job.picks = [];
  job.meanLum = 200;
}

/* ------------------------------------------------------------------ *
 * mask smoothing + lighting stats
 * ------------------------------------------------------------------ */

/** One separable 1-2-1 blur pass over a rectangle: softens selection edges so
 *  recoloured walls blend into door frames and skirting instead of ending in
 *  a hard cut line. */
export function feather(job: PaintJob, rect: Rect): void {
  const { width, height, mask } = job;
  const x0 = Math.max(0, rect.x - 1);
  const y0 = Math.max(0, rect.y - 1);
  const x1 = Math.min(width - 1, rect.x + rect.w + 1);
  const y1 = Math.min(height - 1, rect.y + rect.h + 1);
  const rw = x1 - x0 + 1;
  const rh = y1 - y0 + 1;
  const tmp = new Uint8Array(rw * rh);

  for (let y = y0; y <= y1; y += 1) {
    const row = y * width;
    const trow = (y - y0) * rw;
    for (let x = x0; x <= x1; x += 1) {
      const l = mask[row + Math.max(x0, x - 1)];
      const c = mask[row + x];
      const r = mask[row + Math.min(x1, x + 1)];
      tmp[trow + (x - x0)] = (l + 2 * c + r) >> 2;
    }
  }
  for (let y = y0; y <= y1; y += 1) {
    const row = y * width;
    for (let x = x0; x <= x1; x += 1) {
      const t = (y - y0) * rw + (x - x0);
      const up = tmp[Math.max(0, y - 1 - y0) * rw + (x - x0)];
      const dn = tmp[Math.min(rh - 1, y + 1 - y0) * rw + (x - x0)];
      mask[row + x] = (up + 2 * tmp[t] + dn) >> 2;
    }
  }
}

/** Average luminance of the selected area. Recolouring maps this mean onto
 *  the chosen shade, so the wall keeps its own light and shadow gradient. */
export function computeMeanLum(job: PaintJob): number {
  const { mask, lum } = job;
  let sum = 0;
  let n = 0;
  for (let p = 0; p < mask.length; p += 1) {
    if (mask[p] > 128) {
      sum += lum[p];
      n += 1;
    }
  }
  job.meanLum = n > 0 ? sum / n : 200;
  return n;
}

export function selectedFraction(job: PaintJob): number {
  let n = 0;
  for (let p = 0; p < job.mask.length; p += 1) if (job.mask[p] > 128) n += 1;
  return n / job.mask.length;
}

/* ------------------------------------------------------------------ *
 * saved progress layers
 * ------------------------------------------------------------------ */

/** Brightness transfer curve: one pow() per luminance level, reused by both
 *  live painting and layer baking so a saved layer looks identical forever. */
function buildCurve(mean: number): Float32Array {
  const curve = new Float32Array(256);
  const m = mean > 1 ? mean : 200;
  for (let L = 0; L < 256; L += 1) {
    let k = Math.pow(L / m, 0.9);
    if (k < 0.32) k = 0.32;
    else if (k > 1.75) k = 1.75;
    curve[L] = k;
  }
  return curve;
}

/** Blend one frozen layer opaquely into a base buffer (same maths as
 *  paintInto, so live preview and saved result can never disagree). */
function applyLayer(base: Rgba, lum: Uint8Array, layer: PaintLayer): void {
  const curve = buildCurve(layer.meanLum);
  const { r: sr, g: sg, b: sb } = layer.shade;
  const { mask, intensity } = layer;
  for (let p = 0, i = 0; p < mask.length; p += 1, i += 4) {
    const strength = mask[p] / 255;
    if (strength <= 0) continue;
    const k = curve[lum[p]];
    let a = strength * intensity;
    if (a > 1) a = 1;
    const keep = 1 - a;
    base[i] = base[i] * keep + sr * k * a;
    base[i + 1] = base[i + 1] * keep + sg * k * a;
    base[i + 2] = base[i + 2] * keep + sb * k * a;
    base[i + 3] = 255;
  }
}

/** "Save progress": freeze the current selection + shade as a layer baked into
 *  the working photo, then clear the selection for the next area. Returns
 *  false when there is nothing selected to save. */
export function bakeLayer(job: PaintJob): boolean {
  let any = false;
  for (let p = 0; p < job.mask.length; p += 1) {
    if (job.mask[p] > 0) {
      any = true;
      break;
    }
  }
  if (!any) return false;
  const layer: PaintLayer = {
    mask: job.mask.slice(),
    shade: { ...job.shade },
    intensity: job.intensity,
    meanLum: job.meanLum,
  };
  job.layers = [...job.layers, layer];
  if (job.base === job.original) job.base = job.original.slice();
  applyLayer(job.base, job.lum, layer);
  computeLumInto(job.base, job.lum);
  clearMask(job);
  return true;
}
/** Discard every saved layer: the working photo goes back to the untouched
 *  original, so the whole picture can be repainted from scratch. */
export function dropLayers(job: PaintJob): boolean {
  if (job.layers.length === 0) return false;
  job.layers = [];
  rebuildBase(job);
  return true;
}

/** Recompute the working photo from the untouched original plus every saved
 *  layer. Used when undo/redo moves across a save point. */
export function rebuildBase(job: PaintJob): void {
  job.base = job.original.slice();
  computeLumInto(job.base, job.lum);
  for (const layer of job.layers) {
    applyLayer(job.base, job.lum, layer);
    computeLumInto(job.base, job.lum);
  }
}

/* ------------------------------------------------------------------ *
 * recolour: paint that keeps the wall's real lighting
 * ------------------------------------------------------------------ */

/** Write the painted result into an overlay ImageData. Pixels outside the
 *  selection are left fully transparent so the base photo shows through. */
export function paintInto(out: ImageData, job: PaintJob, rect?: Rect): void {
  const { width, height, base, lum, mask } = job;
  const d = out.data;
  const x0 = rect ? rect.x : 0;
  const y0 = rect ? rect.y : 0;
  const x1 = rect ? Math.min(width - 1, rect.x + rect.w - 1) : width - 1;
  const y1 = rect ? Math.min(height - 1, rect.y + rect.h - 1) : height - 1;
  const { r: sr, g: sg, b: sb } = job.shade;
  const intensity = job.intensity;

  /* Brightness transfer curve as a 256-entry table: one pow() per luminance
     level instead of one per pixel keeps full repaints inside a frame. */
  const curve = buildCurve(job.meanLum);

  for (let y = y0; y <= y1; y += 1) {
    const row = y * width;
    for (let x = x0; x <= x1; x += 1) {
      const p = row + x;
      const i = p * 4;
      const strength = mask[p] / 255;
      if (strength <= 0) {
        d[i + 3] = 0;
        continue;
      }
      /* Relative brightness of this pixel against the wall's own average:
         shadows stay shadows, sunlit patches stay sunlit. */
      const k = curve[lum[p]];
      let a = strength * intensity;
      if (a > 1) a = 1;
      const keep = 1 - a;
      d[i] = base[i] * keep + sr * k * a;
      d[i + 1] = base[i + 1] * keep + sg * k * a;
      d[i + 2] = base[i + 2] * keep + sb * k * a;
      d[i + 3] = Math.round(a * 255);
    }
  }
}

/** Flatten base photo + painted overlay into a single PNG blob for saving. */
export async function exportPng(job: PaintJob, overlay: ImageData): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = job.width;
  canvas.height = job.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  const baseCanvas = document.createElement("canvas");
  baseCanvas.width = job.width;
  baseCanvas.height = job.height;
  const bctx = baseCanvas.getContext("2d");
  if (!bctx) throw new Error("canvas unavailable");
  bctx.putImageData(new ImageData(job.base, job.width, job.height), 0, 0);
  ctx.drawImage(baseCanvas, 0, 0);
  const paintCanvas = document.createElement("canvas");
  paintCanvas.width = job.width;
  paintCanvas.height = job.height;
  const pctx = paintCanvas.getContext("2d");
  if (!pctx) throw new Error("canvas unavailable");
  pctx.putImageData(overlay, 0, 0);
  ctx.drawImage(paintCanvas, 0, 0);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("export failed"))), "image/png");
  });
}