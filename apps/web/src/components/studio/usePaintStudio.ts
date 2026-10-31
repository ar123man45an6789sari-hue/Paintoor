/* usePaintStudio v1 — all state and pointer logic behind the wall-paint
   simulator, shared by the landing teaser and the full /studio page.

   Performance contract (this is what kills the old "photo late hai" bug):
   - The photo itself is rendered by an <img> tag from an object URL, so it is
     visible on the first frame after selection. Pixel analysis starts after.
   - Pointer-follow UI (colour chip + brush ring) is written straight to the
     DOM through refs, never through React state, so hovering costs no
     re-render at all.
   - While dragging a stroke only the stroke's dirty rectangle is recomputed
     and pushed to the canvas, once per animation frame.

   History contract:
   - Every photo keeps its own undo/redo stack of lightweight snapshots
     (mask + picks + params + a shared reference to the saved-layer list).
   - "Save progress" freezes the current paint as a layer baked into the
     working photo, so later shade changes can never repaint it — paint the
     roof, save, then repaint the wall freely.
   - Closing the tab with unsaved work triggers the browser's own confirm. */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  bakeLayer,
  clearMask,
  computeMeanLum,
  dropLayers,
  exportPng,
  feather,
  hexToPixel,
  loadJob,
  matchColours,
  paintInto,
  pixelToHex,
  rebuildBase,
  selectedFraction,
  stampDisc,
  stampLine,
} from "@/lib/paintEngine";
import type { PaintJob, PaintLayer, Pixel, Rect } from "@/lib/paintEngine";

export type StudioTool = "pick" | "brush" | "erase";

export type StudioPhoto = { id: string; name: string; url: string };

const MAX_PHOTOS = 6;
const MAX_HISTORY = 12;

type Slot = {
  job: PaintJob;
  overlay: ImageData;
  history: Snap[];
  redo: Snap[];
};

type Snap = {
  mask: Uint8Array;
  picks: Pixel[];
  tol: number;
  connected: boolean;
  layers: PaintLayer[];
  shade: string;
  intensity: number;
};

function mergeRect(a: Rect | null, b: Rect): Rect {
  if (!a) return b;
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    w: Math.max(a.x + a.w, b.x + b.w) - x,
    h: Math.max(a.y + a.h, b.y + b.h) - y,
  };
}

function clampRect(r: Rect, w: number, h: number): Rect {
  const x = Math.max(0, Math.min(w - 1, r.x));
  const y = Math.max(0, Math.min(h - 1, r.y));
  return { x, y, w: Math.max(1, Math.min(w - x, r.w)), h: Math.max(1, Math.min(h - y, r.h)) };
}

export function usePaintStudio(maxDim: number) {
  const slotsRef = useRef<Map<string, Slot>>(new Map());
  const activeIdRef = useRef<string | null>(null);
  const anchorRef = useRef<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  /** Second canvas under the paint overlay: it shows the "dried" photo
   *  (original + every saved layer) so saved paint stays visible. */
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const blobUrlsRef = useRef<string[]>([]);
  const dirtyRef = useRef(false);
    const pointerRef = useRef({
    down: false,
    last: null as { x: number; y: number } | null,
    target: null as { x: number; y: number } | null,
    /** Newest hover point; the frame callback reads this so the ring and
     *  colour chip always chase the current cursor position. */
    hover: null as { x: number; y: number } | null,
    dirty: null as Rect | null,
    frame: 0,
    hoverFrame: 0,
  });

  const chipRef = useRef<HTMLDivElement | null>(null);
  const chipSwatchRef = useRef<HTMLSpanElement | null>(null);
  const chipTextRef = useRef<HTMLSpanElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const [photos, setPhotos] = useState<StudioPhoto[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const [tool, setTool] = useState<StudioTool>("pick");
  const [brush, setBrush] = useState(40);
  const [tol, setTol] = useState(45);
  const [intensity, setIntensity] = useState(100);
  const [connected, setConnected] = useState(false);
  const [shade, setShade] = useState("#e00048");
  const [compare, setCompare] = useState(false);
  const [selected, setSelected] = useState(0);
  const [layers, setLayers] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const slot = useCallback((): Slot | null => {
    const id = activeIdRef.current;
    return id ? slotsRef.current.get(id) ?? null : null;
  }, []);
  const job = useCallback((): PaintJob | null => slot()?.job ?? null, [slot]);

  /* ------------------------------------------------ paint plumbing ------ */

  const flush = useCallback((rect?: Rect) => {
    const canvas = canvasRef.current;
    const s = slotsRef.current.get(activeIdRef.current ?? "");
    if (!canvas || !s) return;
    if (canvas.width !== s.job.width || canvas.height !== s.job.height) {
      canvas.width = s.job.width;
      canvas.height = s.job.height;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (rect) {
      const r = clampRect(rect, s.job.width, s.job.height);
      ctx.putImageData(s.overlay, 0, 0, r.x, r.y, r.w, r.h);
    } else {
      ctx.putImageData(s.overlay, 0, 0);
    }
  }, []);

  const repaint = useCallback(
    (rect?: Rect) => {
      const s = slotsRef.current.get(activeIdRef.current ?? "");
      if (!s) return;
      paintInto(s.overlay, s.job, rect);
      flush(rect);
    },
    [flush],
  );

  /** Coalesced full repaint for slider drags: at most one per frame. */
  const frameRef = useRef(0);
  const repaintSoon = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      repaint();
    });
  }, [repaint]);

  const refreshSelected = useCallback(() => {
    const j = job();
    if (j) setSelected(selectedFraction(j));
  }, [job]);

  const syncChrome = useCallback(() => {
    const s = slot();
    if (!s) return;
    setLayers(s.job.layers.length);
    setCanUndo(s.history.length > 0);
    setCanRedo(s.redo.length > 0);
  }, [slot]);

    /** Redraw the dried-paint canvas whenever the saved layers or the active
   *  photo change. With zero layers the canvas stays hidden and the plain
   *  <img> shows through, so loading stays instant. */
  useEffect(() => {
    const canvas = baseCanvasRef.current;
    const s = slot();
    if (!canvas || !s || layers === 0) return;
    if (canvas.width !== s.job.width || canvas.height !== s.job.height) {
      canvas.width = s.job.width;
      canvas.height = s.job.height;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(new ImageData(s.job.base, s.job.width, s.job.height), 0, 0);
  }, [layers, activeId, ready, slot]);

  /** Full-quality refresh after any change that touches the whole mask. */
  const commitWhole = useCallback(() => {
    const j = job();
    if (!j) return;
    feather(j, { x: 0, y: 0, w: j.width, h: j.height });
    computeMeanLum(j);
    repaint();
    refreshSelected();
  }, [job, refreshSelected, repaint]);

  /* --------------------------------------------------------- history ---- */

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
  }, []);

  const takeSnap = useCallback(
    (j: PaintJob): Snap => ({
      mask: j.mask.slice(),
      picks: j.picks.map((p) => ({ ...p })),
      tol: j.tolerance,
      connected: j.connected,
      layers: j.layers,
      shade: pixelToHex(j.shade),
      intensity: Math.round(j.intensity * 100),
    }),
    [],
  );

  const pushHistory = useCallback(() => {
    const s = slot();
    if (!s) return;
    s.history.push(takeSnap(s.job));
    if (s.history.length > MAX_HISTORY) s.history.shift();
    s.redo = [];
    markDirty();
    syncChrome();
  }, [slot, takeSnap, markDirty, syncChrome]);

  const restoreSnap = useCallback(
    (s: Slot, snap: Snap) => {
      const j = s.job;
      const layersChanged = j.layers !== snap.layers;
      j.mask = snap.mask.slice();
      j.picks = snap.picks.map((p) => ({ ...p }));
      j.tolerance = snap.tol;
      j.connected = snap.connected;
      j.layers = snap.layers;
      j.shade = hexToPixel(snap.shade);
      j.intensity = snap.intensity / 100;
      if (layersChanged) rebuildBase(j);
      computeMeanLum(j);
      setTol(snap.tol);
      setConnected(snap.connected);
      setShade(snap.shade);
      setIntensity(snap.intensity);
      repaint();
      refreshSelected();
      syncChrome();
    },
    [repaint, refreshSelected, syncChrome],
  );

  const undo = useCallback(() => {
    const s = slot();
    if (!s || s.history.length === 0) return;
    const snap = s.history.pop() as Snap;
    s.redo.push(takeSnap(s.job));
    restoreSnap(s, snap);
  }, [slot, takeSnap, restoreSnap]);

  const redo = useCallback(() => {
    const s = slot();
    if (!s || s.redo.length === 0) return;
    const snap = s.redo.pop() as Snap;
    s.history.push(takeSnap(s.job));
    if (s.history.length > MAX_HISTORY) s.history.shift();
    restoreSnap(s, snap);
  }, [slot, takeSnap, restoreSnap]);

  const reset = useCallback(() => {
    const s = slot();
    if (!s) return;
    pushHistory();
    clearMask(s.job);
    anchorRef.current = null;
    commitWhole();
  }, [slot, pushHistory, commitWhole]);

  /** Save progress: freeze the current paint so later colours never touch it. */
  const saveProgress = useCallback(() => {
    const s = slot();
    if (!s) return;
    pushHistory();
    if (bakeLayer(s.job)) {
      anchorRef.current = null;
      repaint();
      refreshSelected();
      syncChrome();
    }
  }, [slot, pushHistory, repaint, refreshSelected, syncChrome]);

    /** Discard every saved layer: the photo falls back to the untouched
   *  original and the whole room can be repainted from scratch. */
  const clearSaved = useCallback(() => {
    const s = slot();
    if (!s || s.job.layers.length === 0) return;
    pushHistory();
    dropLayers(s.job);
    computeMeanLum(s.job);
    repaint();
    refreshSelected();
    syncChrome();
  }, [slot, pushHistory, repaint, refreshSelected, syncChrome]);

  /* --------------------------------------------------------- loading ---- */

  const settingsRef = useRef({ shade: "#e00048", tol: 45, intensity: 100, connected: false });
  useEffect(() => {
    settingsRef.current = { shade, tol, intensity, connected };
  }, [shade, tol, intensity, connected]);

  const adopt = useCallback(
    (id: string, j: PaintJob) => {
      const overlay = new ImageData(j.width, j.height);
      slotsRef.current.set(id, { job: j, overlay, history: [], redo: [] });
      activeIdRef.current = id;
      anchorRef.current = null;
      const s = settingsRef.current;
      j.shade = hexToPixel(s.shade);
      j.tolerance = s.tol;
      j.intensity = s.intensity / 100;
      j.connected = s.connected;
      setActiveId(id);
      setSize({ w: j.width, h: j.height });
      setSelected(0);
      setLayers(0);
      setCanUndo(false);
      setCanRedo(false);
      setReady(true);
      paintInto(overlay, j);
      requestAnimationFrame(() => flush());
    },
    [flush],
  );

  const load = useCallback(
    async (source: Blob | string, id?: string, name?: string) => {
      setLoading(true);
      setReady(false);
      const photoId = id ?? `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const url = typeof source === "string" ? source : URL.createObjectURL(source);
      if (typeof source !== "string") blobUrlsRef.current.push(url);
      setPhotos((prev) =>
        prev.some((p) => p.id === photoId) ? prev : [...prev, { id: photoId, name: name ?? url, url }].slice(0, MAX_PHOTOS),
      );
      try {
        const j = await loadJob(source, maxDim);
        adopt(photoId, j);
      } finally {
        setLoading(false);
      }
    },
    [maxDim, adopt],
  );

  const addPhotos = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
      const room = MAX_PHOTOS - photos.length;
      for (const file of list.slice(0, room)) {
        /* Show first, decode second: the object URL goes to <img> straight
           away inside load(), so the visitor sees their photo immediately. */
        // eslint-disable-next-line no-await-in-loop
        await load(file);
      }
    },
    [load, photos.length],
  );

  const activateSlot = useCallback(
    (id: string | null) => {
      activeIdRef.current = id;
      anchorRef.current = null;
      setActiveId(id);
      const s = id ? slotsRef.current.get(id) : undefined;
      if (!s) {
        setSize({ w: 0, h: 0 });
        setReady(false);
        setSelected(0);
        setLayers(0);
        setCanUndo(false);
        setCanRedo(false);
        return;
      }
      setSize({ w: s.job.width, h: s.job.height });
      setShade(pixelToHex(s.job.shade));
      setTol(s.job.tolerance);
      setIntensity(Math.round(s.job.intensity * 100));
      setConnected(s.job.connected);
      setSelected(selectedFraction(s.job));
      setLayers(s.job.layers.length);
      setCanUndo(s.history.length > 0);
      setCanRedo(s.redo.length > 0);
      setReady(true);
      requestAnimationFrame(() => flush());
    },
    [flush],
  );

  const selectPhoto = useCallback(
    (id: string) => {
      if (id === activeIdRef.current || !slotsRef.current.has(id)) return;
      activateSlot(id);
    },
    [activateSlot],
  );

  const removePhoto = useCallback(
    (id: string) => {
      const target = slotsRef.current.get(id);
      const photo = photos.find((p) => p.id === id);
      if (!target || !photo) return;
      slotsRef.current.delete(id);
      if (photo.url.startsWith("blob:")) URL.revokeObjectURL(photo.url);
      const remaining = photos.filter((p) => p.id !== id);
      setPhotos(remaining);
      if (activeIdRef.current === id) activateSlot(remaining[0]?.id ?? null);
    },
    [photos, activateSlot],
  );

  useEffect(
    () => () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      blobUrlsRef.current = [];
    },
    [],
  );

  /* Guard against losing a painted home to an accidental tab close. */
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  /* ------------------------------------------------------- param sync --- */

  useEffect(() => {
    const j = job();
    if (!j) return;
    j.shade = hexToPixel(shade);
    repaintSoon();
  }, [job, shade, repaintSoon]);

  useEffect(() => {
    const j = job();
    if (!j) return;
    j.intensity = intensity / 100;
    repaintSoon();
  }, [job, intensity, repaintSoon]);

  useEffect(() => {
    const j = job();
    if (!j) return;
    j.tolerance = tol;
    if (j.picks.length === 0) return;
    /* Re-running the match with the new tolerance keeps the selection honest
       instead of freezing it at the value used when the wall was tapped. */
    const id = window.setTimeout(() => {
      matchColours(j, anchorRef.current ?? undefined);
      commitWhole();
    }, 90);
    return () => window.clearTimeout(id);
  }, [job, tol, commitWhole]);

  useEffect(() => {
    const j = job();
    if (j) j.connected = connected;
  }, [job, connected]);

  /* --------------------------------------------------------- pointer ---- */

  const toLocal = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      const j = job();
      if (!canvas || !j) return null;
      const r = canvas.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return null;
      return {
        x: Math.max(0, Math.min(j.width - 1, Math.round(((clientX - r.left) / r.width) * j.width))),
        y: Math.max(0, Math.min(j.height - 1, Math.round(((clientY - r.top) / r.height) * j.height))),
      };
    },
    [job],
  );

  const applyStrokeFrame = useCallback(() => {
    const st = pointerRef.current;
    st.frame = 0;
    const j = job();
    if (!j || !st.target) return;
    const from = st.last ?? st.target;
    const rect = stampLine(j, from, st.target, brush, tool === "brush");
    st.last = st.target;
    st.dirty = mergeRect(st.dirty, rect);
    repaint(rect);
  }, [job, brush, tool, repaint]);

  const scheduleStroke = useCallback(() => {
    const st = pointerRef.current;
    if (st.frame) return;
    st.frame = requestAnimationFrame(applyStrokeFrame);
  }, [applyStrokeFrame]);

    const updateHover = useCallback(
    (point: { x: number; y: number }) => {
      const j = job();
      const canvas = canvasRef.current;
      if (!j || !canvas) return;
      const i = (point.y * j.width + point.x) * 4;
      const hex = pixelToHex({ r: j.base[i], g: j.base[i + 1], b: j.base[i + 2] });
      const chip = chipRef.current;
      if (chip) {
        chip.style.opacity = "1";
        if (chipSwatchRef.current) chipSwatchRef.current.style.background = hex;
        if (chipTextRef.current) chipTextRef.current.textContent = hex.toUpperCase();
      }
      const ring = ringRef.current;
      if (ring) {
        const r = canvas.getBoundingClientRect();
        const scale = r.width / j.width;
        const d = tool === "pick" ? 28 : brush * 2 * scale;
        /* Changing width/height forces layout, so only touch them when the
           diameter really changed; movement stays a cheap transform. */
        if (ring.dataset.d !== String(d)) {
          ring.dataset.d = String(d);
          ring.style.width = `${d}px`;
          ring.style.height = `${d}px`;
        }
        ring.style.opacity = "1";
        ring.style.transform = `translate(${point.x * scale - d / 2}px, ${point.y * scale - d / 2}px)`;
      }
    },
    [job, brush, tool],
  );

    const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const point = toLocal(e.clientX, e.clientY);
      if (!point) return;
      const st = pointerRef.current;
      /* Keep the newest point in the ref: the frame callback below reads it,
         so ring + chip track the cursor instead of a stale earlier event. */
      st.hover = point;
      if (!st.hoverFrame) {
        st.hoverFrame = requestAnimationFrame(() => {
          st.hoverFrame = 0;
          const p = st.hover;
          if (p) updateHover(p);
        });
      }
      if (st.down && tool !== "pick") {
        st.target = point;
        scheduleStroke();
      }
    },
    [toLocal, updateHover, scheduleStroke, tool],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const j = job();
      const point = toLocal(e.clientX, e.clientY);
      if (!j || !point) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      updateHover(point);

      if (tool === "pick") {
        const i = (point.y * j.width + point.x) * 4;
        pushHistory();
        /* Picks accumulate, so tapping a shaded corner of the same wall adds
           that tone to the match instead of throwing the first pick away. */
        j.picks.push({ r: j.base[i], g: j.base[i + 1], b: j.base[i + 2] });
        anchorRef.current = point;
        matchColours(j, point);
        commitWhole();
        return;
      }
      pushHistory();
      markDirty();
      const st = pointerRef.current;
      st.down = true;
      st.last = point;
      st.target = point;
      const rect = stampDisc(j, point.x, point.y, brush, tool === "brush");
      st.dirty = rect;
      repaint(rect);
    },
    [job, toLocal, tool, brush, pushHistory, markDirty, commitWhole, repaint, updateHover],
  );

    const endStroke = useCallback(() => {
    const st = pointerRef.current;
    const j = job();
    if (st.frame) {
      cancelAnimationFrame(st.frame);
      st.frame = 0;
      /* Apply the final segment here: cancelling alone made fast flicks
         lose the tail of the stroke. */
      if (st.down && j && st.target) {
        const from = st.last ?? st.target;
        const rect = stampLine(j, from, st.target, brush, tool === "brush");
        st.last = st.target;
        st.dirty = mergeRect(st.dirty, rect);
      }
    }
    if (st.down && j && st.dirty) {
      /* Soften the fresh stroke edge and re-light the painted area. */
      feather(j, { x: st.dirty.x - 2, y: st.dirty.y - 2, w: st.dirty.w + 4, h: st.dirty.h + 4 });
      computeMeanLum(j);
      repaint({ x: st.dirty.x - 3, y: st.dirty.y - 3, w: st.dirty.w + 6, h: st.dirty.h + 6 });
      refreshSelected();
    }
    st.down = false;
    st.last = null;
    st.target = null;
    st.dirty = null;
  }, [job, brush, tool, repaint, refreshSelected]);

  const onPointerLeave = useCallback(() => {
    /* Drop the pending hover point so a queued frame cannot re-show the
       ring or chip at a stale position after the cursor left the stage. */
    pointerRef.current.hover = null;
    if (chipRef.current) chipRef.current.style.opacity = "0";
    if (ringRef.current) ringRef.current.style.opacity = "0";
  }, []);

  /* ---------------------------------------------------------- actions --- */

  const download = useCallback(async () => {
    const s = slot();
    if (!s) return;
    const blob = await exportPng(s.job, s.overlay);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "paintoor-new-look.png";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, [slot]);

  const active = photos.find((p) => p.id === activeId) ?? null;

  return {
    canvasRef,
    baseCanvasRef,
    chipRef,
    chipSwatchRef,
    chipTextRef,
    ringRef,
    onPointerDown,
    onPointerMove,
    onPointerUp: endStroke,
    onPointerLeave,
    photos,
    active,
    activeId,
    size,
    loading,
    ready,
    compare,
    setCompare,
    selected,
    layers,
    canUndo,
    canRedo,
    tool,
    setTool,
    brush,
    setBrush,
    tol,
    setTol,
    intensity,
    setIntensity,
    connected,
    setConnected,
    shade,
    setShade,
    load,
    addPhotos,
    selectPhoto,
    removePhoto,
    undo,
    redo,
    reset,
    saveProgress,
    clearSaved,
    download,
    maxPhotos: MAX_PHOTOS,
  };
}

export type PaintStudioBag = ReturnType<typeof usePaintStudio>;