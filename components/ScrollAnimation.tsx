"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

const TOTAL_FRAMES = 120;
const FPS = 30;
const FRAME_DURATION = 1000 / FPS;
const SCROLL_HEIGHT_VH = 300;

export default function ScrollAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const lastFrameRef = useRef(-1);
  const bgColorRef = useRef("#FFFFFF");

  // DOM refs for scroll-driven animation (no re-renders)
  const textRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [animationStarted, setAnimationStarted] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const animationTriggeredRef = useRef(false);

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

  // Scroll-driven hero transition (direct DOM manipulation, no re-renders)
  useEffect(() => {
    if (!loaded) return;

    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const sectionHeight = rect.height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / sectionHeight));

      // Phase 1: Text fades out (progress 0 → 0.12)
      const textOpacity = Math.max(0, 1 - progress / 0.12);
      if (textRef.current) {
        textRef.current.style.opacity = String(textOpacity);
        textRef.current.style.transform = `translateY(${-progress * 120}px)`;
      }

      // Phase 2: Gradient overlay fades out (progress 0.05 → 0.2)
      const overlayOpacity = Math.max(0, 1 - (progress - 0.05) / 0.15);
      if (overlayRef.current) {
        overlayRef.current.style.opacity = String(overlayOpacity);
      }

      // Phase 3: Canvas appears (progress 0.18 → 0.22)
      const canvasOpacity = Math.min(1, Math.max(0, (progress - 0.18) / 0.04));
      if (canvasWrapRef.current) {
        canvasWrapRef.current.style.opacity = String(canvasOpacity);
      }

      // Phase 4: Trigger auto-play (progress > 0.22)
      if (progress > 0.22 && !animationTriggeredRef.current) {
        animationTriggeredRef.current = true;
        setAnimationStarted(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loaded]);

  // Auto-play animation at fixed FPS once triggered
  useEffect(() => {
    if (!loaded || !animationStarted || animationDone) return;

    let lastTime = 0;
    let currentFrame = 0;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;

      if (elapsed >= FRAME_DURATION) {
        lastTime = timestamp - (elapsed % FRAME_DURATION);
        currentFrame++;
        if (currentFrame >= TOTAL_FRAMES) {
          drawFrame(TOTAL_FRAMES - 1);
          setAnimationDone(true);
          return;
        }
        drawFrame(currentFrame);
      }

      rafId = requestAnimationFrame(animate);
    };

    drawFrame(0);
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [loaded, animationStarted, animationDone, drawFrame]);

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
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [loaded, setupCanvas]);

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

      {/* Combined Hero + Animation section */}
      <div ref={sectionRef} style={{ height: `${SCROLL_HEIGHT_VH}vh` }} className="relative">
        <div className="sticky top-0 h-screen w-full overflow-hidden">

          {/* Layer 1: Full-screen start frame image (always visible as base) */}
          <Image
            src="/start_frame.png"
            alt="Maler Dorberth"
            fill
            priority
            className="object-cover"
          />

          {/* Layer 2: Canvas (fades in over the start image, then plays animation) */}
          <div ref={canvasWrapRef} className="absolute inset-0" style={{ opacity: 0 }}>
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ willChange: "transform", transform: "translateZ(0)" }}
            />
          </div>

          {/* Layer 3: Edge feathering */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: `
                linear-gradient(to right, ${bgColor} 0%, transparent 6%),
                linear-gradient(to left, ${bgColor} 0%, transparent 6%),
                linear-gradient(to bottom, ${bgColor} 0%, transparent 6%),
                linear-gradient(to top, ${bgColor} 0%, transparent 6%)
              `,
            }}
          />

          {/* Layer 4: Left gradient overlay — creates "image on right" hero effect */}
          <div
            ref={overlayRef}
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: "linear-gradient(to right, #FFFFFF 0%, #FFFFFF 35%, rgba(255,255,255,0.85) 50%, transparent 70%)",
            }}
          />

          {/* Layer 5: Hero text — fades out and slides up on scroll */}
          <div
            ref={textRef}
            className="absolute inset-0 z-30 flex items-center pointer-events-none"
          >
            <div className="max-w-7xl mx-auto px-4 w-full">
              <div className="max-w-lg pointer-events-auto">
                <span className="inline-block rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] font-medium bg-primary/10 text-primary mb-6">
                  Meisterbetrieb seit 1985
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground tracking-tight leading-[1.1] mb-6">
                  Ihr Maler aus{" "}
                  <span className="text-primary">Burgfarrnbach</span>
                </h1>
                <p className="text-lg lg:text-xl text-muted-foreground max-w-md mb-10 leading-relaxed">
                  Professionelle Maler- und Lackierarbeiten mit über 40 Jahren Erfahrung.
                  Von Fassadengestaltung bis dekorativer Wandtechnik.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="/contact"
                    className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 shadow-[0_4px_20px_rgba(0,128,128,0.15)] text-center"
                    style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
                  >
                    Kostenloses Angebot
                  </a>
                  <a
                    href="tel:091197794971"
                    className="px-8 py-4 border border-foreground/20 text-foreground font-medium rounded-full hover:bg-foreground/5 hover:border-foreground/40 transition-all duration-500 text-center"
                    style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
                  >
                    0911 / 977 949 71
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
