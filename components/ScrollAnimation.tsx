"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

const TOTAL_FRAMES = 120;
const SCROLL_HEIGHT_VH = 400;

// Scroll phases (as fraction of total scroll)
const HERO_END = 0.08;        // Hero rests
const TRANSITION_END = 0.18;  // Text fades, image grows to fullscreen
const CANVAS_IN = 0.20;       // Canvas fades in over the image
const ANIM_START = 0.20;      // Frame animation begins
const ANIM_END = 1.0;         // Frame animation ends

export default function ScrollAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const lastFrameRef = useRef(-1);
  const bgColorRef = useRef("#FFFFFF");
  const rafRef = useRef<number | null>(null);

  // Hero transition refs (direct DOM, no re-renders)
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

  // Calculate transform to take hero image from its position to fullscreen
  const computeTransform = useCallback(() => {
    const el = heroImageRef.current;
    if (!el) return;

    // Reset transform to measure natural position
    const saved = el.style.transform;
    el.style.transform = "none";

    const rect = el.getBoundingClientRect();

    el.style.transform = saved;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const imgCenterX = rect.left + rect.width / 2;
    const imgCenterY = rect.top + rect.height / 2;

    const dx = vw / 2 - imgCenterX;
    const dy = vh / 2 - imgCenterY;
    // Cover mode scale: image must fill entire viewport
    const scale = Math.max(vw / rect.width, vh / rect.height) * 1.02;

    transformTargetRef.current = { dx, dy, scale };
  }, []);

  // Main scroll handler — drives everything
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

        // --- Phase 1: Hero text fade + slide up ---
        const textP = Math.max(0, Math.min(1, (progress - HERO_END) / (TRANSITION_END - HERO_END)));
        if (textRef.current) {
          textRef.current.style.opacity = String(1 - textP);
          textRef.current.style.transform = `translateY(${-textP * 80}px)`;
        }

        // --- Phase 2: Hero image grows to fullscreen ---
        const { dx, dy, scale } = transformTargetRef.current;
        if (heroImageRef.current) {
          const imgP = textP; // same timing as text
          heroImageRef.current.style.transform = `translate(${dx * imgP}px, ${dy * imgP}px) scale(${1 + (scale - 1) * imgP})`;

          // Fade out hero image as canvas takes over
          const fadeP = Math.max(0, Math.min(1, (progress - TRANSITION_END) / (CANVAS_IN - TRANSITION_END)));
          heroImageRef.current.style.opacity = String(1 - fadeP);
        }

        // --- Phase 3: Canvas fades in ---
        if (canvasWrapRef.current) {
          const canvasP = Math.max(0, Math.min(1, (progress - TRANSITION_END) / (CANVAS_IN - TRANSITION_END)));
          canvasWrapRef.current.style.opacity = String(canvasP);
        }

        // --- Phase 4: Frame animation (scroll-linked, reversible) ---
        if (progress >= ANIM_START) {
          const frameProgress = (progress - ANIM_START) / (ANIM_END - ANIM_START);
          const frameIndex = Math.min(
            TOTAL_FRAMES - 1,
            Math.max(0, Math.floor(frameProgress * TOTAL_FRAMES)),
          );
          drawFrame(frameIndex);
        } else {
          // Before animation range — show frame 0
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
        if (img.decode) {
          img.decode().then(finish).catch(finish);
        } else {
          finish();
        }
      };
      img.onerror = () => {
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = images;
          setLoaded(true);
        }
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
      } catch {
        /* keep default */
      }

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
              <span className="text-foreground text-2xl font-bold tracking-tight">
                MALER DORBERTH
              </span>
              <span className="text-muted-foreground text-[10px] font-medium tracking-[0.2em] uppercase">
                Meisterbetrieb seit 1985
              </span>
            </div>
            <div className="w-48 h-[2px] bg-black/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-200 ease-out"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
              {loadProgress}%
            </span>
          </div>
        </div>
      )}

      {/* Combined Hero + Animation section */}
      <div
        ref={sectionRef}
        style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
        className="relative"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Layer 1: Canvas (hidden initially, fades in after hero transition) */}
          <div
            ref={canvasWrapRef}
            className="absolute inset-0 z-10"
            style={{ opacity: 0 }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{
                willChange: "transform",
                transform: "translateZ(0)",
              }}
            />
          </div>

          {/* Layer 2: Hero image — starts on the right, scales to fullscreen */}
          <div
            ref={heroImageRef}
            className="absolute z-20 right-[4%] top-[12%] w-[40%] h-[76%] md:right-[5%] md:top-[10%] md:w-[42%] md:h-[80%]"
            style={{ transformOrigin: "center center" }}
          >
            <Image
              src="/start_frame.png"
              alt="Maler Dorberth"
              fill
              priority
              className="object-cover"
            />
            {/* Gradient edges — image blends seamlessly into background */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  linear-gradient(to right, #FFFFFF 0%, transparent 12%),
                  linear-gradient(to left, #FFFFFF 0%, transparent 8%),
                  linear-gradient(to bottom, #FFFFFF 0%, transparent 15%),
                  linear-gradient(to top, #FFFFFF 0%, transparent 12%)
                `,
              }}
            />
          </div>

          {/* Layer 3: Edge feathering for animation canvas */}
          <div
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              background: `
                linear-gradient(to right, ${bgColor} 0%, transparent 5%),
                linear-gradient(to left, ${bgColor} 0%, transparent 5%),
                linear-gradient(to bottom, ${bgColor} 0%, transparent 5%),
                linear-gradient(to top, ${bgColor} 0%, transparent 5%)
              `,
            }}
          />

          {/* Layer 4: Hero text — fades out + slides up on scroll */}
          <div
            ref={textRef}
            className="absolute inset-0 z-40 flex items-center pointer-events-none"
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
                  Professionelle Maler- und Lackierarbeiten mit über 40 Jahren
                  Erfahrung. Von Fassadengestaltung bis dekorativer Wandtechnik.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="/contact"
                    className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 shadow-[0_4px_20px_rgba(0,128,128,0.15)] text-center"
                    style={{
                      transitionTimingFunction:
                        "cubic-bezier(0.32, 0.72, 0, 1)",
                    }}
                  >
                    Kostenloses Angebot
                  </a>
                  <a
                    href="tel:091197794971"
                    className="px-8 py-4 border border-foreground/20 text-foreground font-medium rounded-full hover:bg-foreground/5 hover:border-foreground/40 transition-all duration-500 text-center"
                    style={{
                      transitionTimingFunction:
                        "cubic-bezier(0.32, 0.72, 0, 1)",
                    }}
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
