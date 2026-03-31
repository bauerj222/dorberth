"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const TOTAL_FRAMES = 120;
const SCROLL_HEIGHT_VH = 400;

export default function ScrollAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const lastFrameRef = useRef(-1);
  const bgColorRef = useRef("#FFFFFF");
  const rafRef = useRef<number | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [bgColor, setBgColor] = useState("#FFFFFF");

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (sizeRef.current.w === w && sizeRef.current.h === h) return;
    sizeRef.current = { w, h };

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctxRef.current = ctx;
    }
  }, []);

  // Cover mode — image fills entire viewport
  const drawFrame = useCallback((frameIndex: number) => {
    if (frameIndex === lastFrameRef.current) return;
    lastFrameRef.current = frameIndex;

    const ctx = ctxRef.current;
    const img = imagesRef.current[frameIndex];
    if (!ctx || !img || !img.complete || img.naturalWidth === 0) return;

    const { w, h } = sizeRef.current;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const viewRatio = w / h;

    let dw: number, dh: number;
    if (viewRatio > imgRatio) {
      dw = w;
      dh = w / imgRatio;
    } else {
      dh = h;
      dw = h * imgRatio;
    }

    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;

    ctx.fillStyle = bgColorRef.current;
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  // Scroll handler — maps scroll position to frame index
  const onScroll = useCallback(() => {
    if (!loaded || !sectionRef.current) return;

    const rect = sectionRef.current.getBoundingClientRect();
    const sectionHeight = rect.height - window.innerHeight;
    const progress = Math.max(0, Math.min(1, -rect.top / sectionHeight));
    const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(progress * TOTAL_FRAMES)));

    drawFrame(frameIndex);
  }, [loaded, drawFrame]);

  // rAF-throttled scroll listener
  useEffect(() => {
    if (!loaded) return;

    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        onScroll();
        rafRef.current = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [loaded, onScroll]);

  // Preload images
  useEffect(() => {
    setupCanvas();
    let loadedCount = 0;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new window.Image();
      img.src = `/sequence/frame_${i}.webp`;
      img.onload = () => {
        const finish = () => {
          images[i] = img;
          loadedCount++;
          setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
          if (loadedCount === TOTAL_FRAMES) {
            imagesRef.current = images;
            setLoaded(true);
          }
        };
        if (img.decode) { img.decode().then(finish).catch(finish); } else { finish(); }
      };
      img.onerror = () => {
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
        if (loadedCount === TOTAL_FRAMES) { imagesRef.current = images; setLoaded(true); }
      };
    }
  }, [setupCanvas]);

  // Sample BG color from first frame
  useEffect(() => {
    if (loaded && imagesRef.current[0]) {
      const img = imagesRef.current[0];
      try {
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = img.naturalWidth;
        tmpCanvas.height = img.naturalHeight;
        const tmpCtx = tmpCanvas.getContext("2d");
        if (tmpCtx) {
          tmpCtx.drawImage(img, 0, 0);
          const pixel = tmpCtx.getImageData(2, 2, 1, 1).data;
          const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
          bgColorRef.current = color;
          setBgColor(color);
        }
      } catch { /* keep default */ }
      setupCanvas();
      drawFrame(0);
    }
  }, [loaded, drawFrame, setupCanvas]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (loaded) {
        sizeRef.current = { w: 0, h: 0 };
        lastFrameRef.current = -1;
        setupCanvas();
        onScroll();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [loaded, setupCanvas, onScroll]);

  return (
    <>
      {/* Loading Screen */}
      {!loaded && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-8">
            <div className="flex flex-col items-center">
              <span className="text-foreground text-2xl font-bold tracking-tight">MALER DORBERTH</span>
              <span className="text-muted-foreground text-[10px] font-medium tracking-[0.2em] uppercase">Meisterbetrieb seit 1985</span>
            </div>
            <div className="w-48 h-[2px] bg-black/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-200 ease-out" style={{ width: `${loadProgress}%` }} />
            </div>
            <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">{loadProgress}%</span>
          </div>
        </div>
      )}

      {/* Animation section */}
      <div ref={sectionRef} style={{ height: `${SCROLL_HEIGHT_VH}vh` }} className="relative">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ background: "#FFFFFF", willChange: "transform", transform: "translateZ(0)" }}
          />
          {/* Edge feathering */}
          <div className="absolute inset-0 pointer-events-none z-10" style={{
            background: `
              linear-gradient(to right, ${bgColor} 0%, transparent 5%),
              linear-gradient(to left, ${bgColor} 0%, transparent 5%),
              linear-gradient(to bottom, ${bgColor} 0%, transparent 5%),
              linear-gradient(to top, ${bgColor} 0%, transparent 5%)
            `,
          }} />
        </div>
      </div>
    </>
  );
}
