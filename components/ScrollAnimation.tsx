"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

const TOTAL_FRAMES = 120;
const SCROLL_HEIGHT_VH = 400;

// Scroll phases
const HERO_END = 0.08;
const TRANSITION_END = 0.18;
const CANVAS_IN = 0.20;
const ANIM_START = 0.20;
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

  const textRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const transformTargetRef = useRef({ dx: 0, dy: 0, scale: 1 });

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

  // Measure hero image grid position → calculate transform to fullscreen
  const computeTransform = useCallback(() => {
    const el = heroImageRef.current;
    if (!el) return;

    const saved = el.style.transform;
    el.style.transform = "none";
    const rect = el.getBoundingClientRect();
    el.style.transform = saved;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = vw / 2 - centerX;
    const dy = vh / 2 - centerY;
    const scale = Math.max(vw / rect.width, vh / rect.height) * 1.02;

    transformTargetRef.current = { dx, dy, scale };
  }, []);

  // Scroll handler
  useEffect(() => {
    if (!loaded) return;

    computeTransform();

    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;

        const section = sectionRef.current;
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const sectionHeight = rect.height - window.innerHeight;
        const progress = Math.max(0, Math.min(1, -rect.top / sectionHeight));

        // Text fade + slide up
        const textP = Math.max(0, Math.min(1, (progress - HERO_END) / (TRANSITION_END - HERO_END)));
        if (textRef.current) {
          textRef.current.style.opacity = String(1 - textP);
          textRef.current.style.transform = `translateY(${-textP * 80}px)`;
        }

        // Image grows from grid position to fullscreen
        const { dx, dy, scale } = transformTargetRef.current;
        if (heroImageRef.current) {
          heroImageRef.current.style.transform = `translate(${dx * textP}px, ${dy * textP}px) scale(${1 + (scale - 1) * textP})`;
          heroImageRef.current.style.zIndex = textP > 0 ? "25" : "0";

          const fadeP = Math.max(0, Math.min(1, (progress - TRANSITION_END) / (CANVAS_IN - TRANSITION_END)));
          heroImageRef.current.style.opacity = String(1 - fadeP);
        }

        // Canvas fades in
        if (canvasWrapRef.current) {
          const canvasP = Math.max(0, Math.min(1, (progress - TRANSITION_END) / (CANVAS_IN - TRANSITION_END)));
          canvasWrapRef.current.style.opacity = String(canvasP);
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
  }, [loaded, drawFrame, computeTransform]);

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
        computeTransform();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [loaded, setupCanvas, computeTransform]);

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
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-background">

          {/* Canvas (behind everything, fades in after transition) */}
          <div ref={canvasWrapRef} className="absolute inset-0 z-10" style={{ opacity: 0 }}>
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ willChange: "transform", transform: "translateZ(0)" }}
            />
            {/* Edge feathering on canvas */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `
                linear-gradient(to right, ${bgColor} 0%, transparent 5%),
                linear-gradient(to left, ${bgColor} 0%, transparent 5%),
                linear-gradient(to bottom, ${bgColor} 0%, transparent 5%),
                linear-gradient(to top, ${bgColor} 0%, transparent 5%)
              `,
            }} />
          </div>

          {/* Hero grid layout — text left, image right */}
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="max-w-7xl mx-auto px-4 w-full grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">

              {/* Text column — fades out on scroll */}
              <div ref={textRef}>
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

              {/* Image column — grows to fullscreen on scroll */}
              <div
                ref={heroImageRef}
                className="relative aspect-[4/3] md:aspect-square overflow-visible"
                style={{ transformOrigin: "center center" }}
              >
                <Image
                  src="/start_frame.png"
                  alt="Maler Dorberth — Professionelle Malerarbeiten"
                  fill
                  priority
                  className="object-cover"
                />
                {/* Gradient edges so image blends seamlessly */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: `
                    linear-gradient(to right, var(--color-background) 0%, transparent 12%),
                    linear-gradient(to left, var(--color-background) 0%, transparent 8%),
                    linear-gradient(to bottom, var(--color-background) 0%, transparent 15%),
                    linear-gradient(to top, var(--color-background) 0%, transparent 12%)
                  `,
                }} />
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}
