"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

const TOTAL_FRAMES = 120;
const SCROLL_HEIGHT_VH = 400; // How many viewport heights the scroll area spans

export default function ScrollAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const lastFrameRef = useRef(-1);
  const rafRef = useRef<number | null>(null);
  const bgColorRef = useRef("#FFFFFF");

  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [animationDone, setAnimationDone] = useState(false);

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

  // Cover mode — image fills entire viewport, no visible edges
  const drawFrame = useCallback((frameIndex: number) => {
    if (frameIndex === lastFrameRef.current) return; // Skip duplicate draws
    lastFrameRef.current = frameIndex;

    const ctx = ctxRef.current;
    const img = imagesRef.current[frameIndex];
    if (!ctx || !img || !img.complete || img.naturalWidth === 0) return;

    const { w, h } = sizeRef.current;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const viewRatio = w / h;

    let dw: number, dh: number;
    if (viewRatio > imgRatio) {
      // Viewport wider than image — fit to width
      dw = w;
      dh = w / imgRatio;
    } else {
      // Viewport taller than image — fit to height
      dh = h;
      dw = h * imgRatio;
    }

    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;

    ctx.fillStyle = bgColorRef.current;
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  // Scroll handler — maps scroll position directly to frame index
  const onScroll = useCallback(() => {
    if (!loaded || !sectionRef.current) return;

    const section = sectionRef.current;
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionHeight = rect.height - window.innerHeight;

    // How far through the scroll section are we? (0 to 1)
    const progress = Math.max(0, Math.min(1, -sectionTop / sectionHeight));

    const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));

    // Check if animation is complete
    if (progress >= 1 && !animationDone) {
      setAnimationDone(true);
    } else if (progress < 1 && animationDone) {
      setAnimationDone(false);
    }

    drawFrame(frameIndex);
  }, [loaded, drawFrame, animationDone]);

  // Use rAF-throttled scroll listener for 60fps
  useEffect(() => {
    if (!loaded) return;

    const handleScroll = () => {
      if (rafRef.current) return; // Already scheduled
      rafRef.current = requestAnimationFrame(() => {
        onScroll();
        rafRef.current = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial draw

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
      const img = new Image();
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

  // Sample BG color from first frame + initial draw
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
          bgColorRef.current = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
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
              <motion.div className="h-full bg-primary rounded-full" initial={{ width: "0%" }} animate={{ width: `${loadProgress}%` }} transition={{ duration: 0.2, ease: "easeOut" }} />
            </div>
            <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">{loadProgress}%</span>
          </div>
        </div>
      )}

      {/* Scroll section — the tall container that drives the animation */}
      <div ref={sectionRef} style={{ height: `${SCROLL_HEIGHT_VH}vh` }} className="relative">
        {/* Sticky canvas — stays fixed while scrolling through the section */}
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ background: "#FFFFFF", willChange: "transform", transform: "translateZ(0)" }}
          />

          {/* Scroll indicator — only visible at start */}
          {loaded && !animationDone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none"
            >
              <span className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">Scrollen</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-5 h-8 border-2 border-foreground/20 rounded-full flex items-start justify-center p-1"
              >
                <motion.div className="w-1 h-2 bg-foreground/30 rounded-full" />
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
