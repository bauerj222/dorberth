"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const TOTAL_FRAMES = 120;
const SCROLL_HEIGHT_VH = 400;

// Scroll phases
const HERO_END = 0.06;        // Hero text visible
const TRANSITION_END = 0.14;  // Hero panel fades away
const ANIM_START = 0.14;      // Frame animation begins
const ANIM_END = 1.0;

export default function ScrollAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const lastFrameRef = useRef(-1);
  const bgColorRef = useRef("#FFFFFF");
  const rafRef = useRef<number | null>(null);

  const heroPanelRef = useRef<HTMLDivElement>(null);

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

  // Scroll handler
  useEffect(() => {
    if (!loaded) return;

    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;

        const section = sectionRef.current;
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const sectionHeight = rect.height - window.innerHeight;
        const progress = Math.max(0, Math.min(1, -rect.top / sectionHeight));

        // Hero panel fades out + slides up
        const heroP = Math.max(0, Math.min(1, (progress - HERO_END) / (TRANSITION_END - HERO_END)));
        if (heroPanelRef.current) {
          heroPanelRef.current.style.opacity = String(1 - heroP);
          heroPanelRef.current.style.transform = `translateY(${-heroP * 60}px)`;
        }

        // Frame animation (scroll-linked, reversible)
        if (progress >= ANIM_START) {
          const frameProgress = (progress - ANIM_START) / (ANIM_END - ANIM_START);
          const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(frameProgress * TOTAL_FRAMES)));
          drawFrame(frameIndex);
        } else {
          drawFrame(0);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [loaded, drawFrame]);

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

  // Sample BG color
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

  // Resize
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

      {/* Hero + Animation */}
      <div ref={sectionRef} style={{ height: `${SCROLL_HEIGHT_VH}vh` }} className="relative">
        <div className="sticky top-0 h-screen w-full overflow-hidden">

          {/* Canvas — always visible, shows frame 0 initially = the "hero image" */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full z-10"
            style={{ willChange: "transform", transform: "translateZ(0)" }}
          />

          {/* Edge feathering */}
          <div className="absolute inset-0 pointer-events-none z-20" style={{
            background: `
              linear-gradient(to right, ${bgColor} 0%, transparent 5%),
              linear-gradient(to left, ${bgColor} 0%, transparent 5%),
              linear-gradient(to bottom, ${bgColor} 0%, transparent 5%),
              linear-gradient(to top, ${bgColor} 0%, transparent 5%)
            `,
          }} />

          {/* Hero text panel — covers left side, fades out on scroll */}
          <div
            ref={heroPanelRef}
            className="absolute inset-0 z-30 flex items-center pointer-events-none"
          >
            {/* Left half background + text */}
            <div className="w-full max-w-7xl mx-auto px-4 relative">
              <div className="max-w-lg relative pointer-events-auto">
                {/* White backing so text is readable over canvas */}
                <div className="absolute -inset-8 -left-[40vw] bg-background" style={{
                  background: `linear-gradient(to right, var(--color-background) 70%, transparent 100%)`,
                }} />
                <div className="relative">
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
      </div>
    </>
  );
}
