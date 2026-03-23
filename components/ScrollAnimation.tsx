"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TOTAL_FRAMES = 120;
const DEFAULT_BG_COLOR = "#FFFFFF";

type TextPosition = "left" | "right" | "bottom-center" | "center";

const BEATS = [
  {
    id: 0,
    frameStart: 0,
    frameEnd: 0,
    label: {
      title: "Maler Dorberth",
      subtitle: "Ihr Maler aus Burgfarrnbach — Meisterbetrieb seit 1985",
      position: "center" as TextPosition,
      hero: true,
    },
  },
  {
    id: 1,
    frameStart: 0,
    frameEnd: 59,
    label: {
      title: "40 Jahre\nErfahrung",
      subtitle: "Fassaden, Wandgestaltung & dekorative Techniken im Großraum Nürnberg",
      position: "left" as TextPosition,
    },
  },
  {
    id: 2,
    frameStart: 59,
    frameEnd: 119,
    label: {
      title: "Ihr Projekt\nstarten",
      subtitle: null,
      position: "bottom-center" as TextPosition,
      cta: true,
    },
  },
];

export default function ScrollAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const animatingRef = useRef(false);
  const currentBeatRef = useRef(0);
  const currentFrameRef = useRef(0);
  const bgColorRef = useRef(DEFAULT_BG_COLOR);
  const bgRgbRef = useRef({ r: 255, g: 255, b: 255 });
  const featherCacheRef = useRef<{ w: number; h: number; canvas: HTMLCanvasElement | null }>({ w: 0, h: 0, canvas: null });

  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [activeBeat, setActiveBeat] = useState(0);
  const [showIndicator, setShowIndicator] = useState(true);
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

  const buildFeatherMask = useCallback((w: number, h: number, dx: number, dy: number, dw: number, dh: number) => {
    const cache = featherCacheRef.current;
    if (cache.w === w && cache.h === h && cache.canvas) return cache.canvas;

    const { r, g, b } = bgRgbRef.current;
    const bgSolid = `rgba(${r},${g},${b},1)`;
    const bgClear = `rgba(${r},${g},${b},0)`;
    const fadeSize = 60;

    const offscreen = document.createElement("canvas");
    offscreen.width = w;
    offscreen.height = h;
    const octx = offscreen.getContext("2d");
    if (!octx) return null;

    const gTop = octx.createLinearGradient(0, dy, 0, dy + fadeSize);
    gTop.addColorStop(0, bgSolid); gTop.addColorStop(1, bgClear);
    octx.fillStyle = gTop;
    octx.fillRect(dx, dy, dw, fadeSize);

    const gBottom = octx.createLinearGradient(0, dy + dh, 0, dy + dh - fadeSize);
    gBottom.addColorStop(0, bgSolid); gBottom.addColorStop(1, bgClear);
    octx.fillStyle = gBottom;
    octx.fillRect(dx, dy + dh - fadeSize, dw, fadeSize);

    const gLeft = octx.createLinearGradient(dx, 0, dx + fadeSize, 0);
    gLeft.addColorStop(0, bgSolid); gLeft.addColorStop(1, bgClear);
    octx.fillStyle = gLeft;
    octx.fillRect(dx, dy, fadeSize, dh);

    const gRight = octx.createLinearGradient(dx + dw, 0, dx + dw - fadeSize, 0);
    gRight.addColorStop(0, bgSolid); gRight.addColorStop(1, bgClear);
    octx.fillStyle = gRight;
    octx.fillRect(dx + dw - fadeSize, dy, fadeSize, dh);

    featherCacheRef.current = { w, h, canvas: offscreen };
    return offscreen;
  }, []);

  const drawFrame = useCallback((frameIndex: number) => {
    const ctx = ctxRef.current;
    const img = imagesRef.current[frameIndex];
    if (!ctx || !img || !img.complete || img.naturalWidth === 0) return;

    const { w, h } = sizeRef.current;

    const padding = 0.1;
    const availW = w * (1 - padding * 2);
    const availH = h * (1 - padding * 2);
    const imgRatio = img.naturalWidth / img.naturalHeight;
    let dw: number, dh: number;

    if (availW / availH > imgRatio) {
      dh = availH; dw = availH * imgRatio;
    } else {
      dw = availW; dh = availW / imgRatio;
    }

    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;

    ctx.fillStyle = bgColorRef.current;
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, dx, dy, dw, dh);

    const mask = buildFeatherMask(w, h, dx, dy, dw, dh);
    if (mask) ctx.drawImage(mask, 0, 0);
  }, [buildFeatherMask]);

  const animateToFrame = useCallback(
    (fromFrame: number, toFrame: number, durationMs: number): Promise<void> => {
      return new Promise((resolve) => {
        const startTime = performance.now();
        const direction = toFrame > fromFrame ? 1 : -1;
        const totalFrames = Math.abs(toFrame - fromFrame);

        if (totalFrames === 0) { resolve(); return; }

        const step = (now: number) => {
          const elapsed = now - startTime;
          const rawProgress = Math.min(elapsed / durationMs, 1);
          const t = rawProgress < 0.5
            ? 4 * rawProgress * rawProgress * rawProgress
            : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

          const currentFrame = Math.round(fromFrame + direction * totalFrames * t);
          currentFrameRef.current = currentFrame;
          drawFrame(currentFrame);

          if (rawProgress < 1) {
            requestAnimationFrame(step);
          } else {
            currentFrameRef.current = toFrame;
            drawFrame(toFrame);
            resolve();
          }
        };

        requestAnimationFrame(step);
      });
    },
    [drawFrame]
  );

  const goToBeat = useCallback(
    async (beatIndex: number) => {
      if (animatingRef.current) return;
      if (beatIndex < 0 || beatIndex >= BEATS.length) return;
      if (beatIndex === currentBeatRef.current) return;

      animatingRef.current = true;
      setShowIndicator(false);

      if (animationDone && beatIndex < BEATS.length) {
        setAnimationDone(false);
      }

      const fromFrame = currentFrameRef.current;
      const toBeat = BEATS[beatIndex];
      const toFrame = toBeat.frameEnd;

      const frameDist = Math.abs(toFrame - fromFrame);
      const duration = Math.max(1200, Math.min(4000, frameDist * 60));

      setActiveBeat(-1);
      await new Promise((r) => setTimeout(r, 300));
      await animateToFrame(fromFrame, toFrame, duration);

      currentBeatRef.current = beatIndex;
      setActiveBeat(beatIndex);
      animatingRef.current = false;
    },
    [animateToFrame, animationDone]
  );

  useEffect(() => {
    if (!loaded) return;

    let scrollAccumulator = 0;
    const THRESHOLD = 80;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let exitScrollCount = 0;

    const handleWheel = (e: WheelEvent) => {
      if (animationDone) {
        if (window.scrollY <= 0 && e.deltaY < 0) {
          e.preventDefault();
          setAnimationDone(false);
          currentBeatRef.current = BEATS.length - 1;
          setActiveBeat(BEATS.length - 1);
          goToBeat(BEATS.length - 2);
        }
        return;
      }

      e.preventDefault();
      if (animatingRef.current) return;

      scrollAccumulator += e.deltaY;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => { scrollAccumulator = 0; exitScrollCount = 0; }, 300);

      if (scrollAccumulator > THRESHOLD) {
        scrollAccumulator = 0;
        if (currentBeatRef.current >= BEATS.length - 1) {
          exitScrollCount++;
          if (exitScrollCount >= 1) {
            setAnimationDone(true);
            setActiveBeat(-1);
            return;
          }
        }
        goToBeat(Math.min(currentBeatRef.current + 1, BEATS.length - 1));
      } else if (scrollAccumulator < -THRESHOLD) {
        scrollAccumulator = 0;
        exitScrollCount = 0;
        goToBeat(Math.max(currentBeatRef.current - 1, 0));
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const handleTouchEnd = (e: TouchEvent) => {
      if (animationDone) return;
      if (animatingRef.current) return;
      const deltaY = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(deltaY) > 50) {
        if (deltaY > 0) {
          if (currentBeatRef.current >= BEATS.length - 1) {
            setAnimationDone(true); setActiveBeat(-1); return;
          }
          goToBeat(Math.min(currentBeatRef.current + 1, BEATS.length - 1));
        } else {
          goToBeat(Math.max(currentBeatRef.current - 1, 0));
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (animationDone) return;
      if (animatingRef.current) return;
      if (e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        if (currentBeatRef.current >= BEATS.length - 1) {
          setAnimationDone(true); setActiveBeat(-1); return;
        }
        goToBeat(Math.min(currentBeatRef.current + 1, BEATS.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goToBeat(Math.max(currentBeatRef.current - 1, 0));
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      if (timeout) clearTimeout(timeout);
    };
  }, [loaded, goToBeat, animationDone]);

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
          bgRgbRef.current = { r: pixel[0], g: pixel[1], b: pixel[2] };
          featherCacheRef.current = { w: 0, h: 0, canvas: null };
        }
      } catch { /* keep default */ }

      setupCanvas();
      drawFrame(0);
      setTimeout(() => setActiveBeat(0), 500);
      currentBeatRef.current = 0;
    }
  }, [loaded, drawFrame, setupCanvas]);

  useEffect(() => {
    const handleResize = () => {
      if (loaded) {
        sizeRef.current = { w: 0, h: 0 };
        featherCacheRef.current = { w: 0, h: 0, canvas: null };
        setupCanvas();
        drawFrame(currentFrameRef.current);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [loaded, drawFrame, setupCanvas]);

  const currentLabel = BEATS.find((b) => b.id === activeBeat)?.label;

  return (
    <div ref={containerRef}>
      {/* Loading Screen */}
      {!loaded && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center" style={{ background: DEFAULT_BG_COLOR }}>
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

      {/* Canvas */}
      <div className={`${animationDone ? "relative" : "fixed inset-0"} z-0`} style={animationDone ? { height: "100vh" } : undefined}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ background: DEFAULT_BG_COLOR, willChange: "transform", transform: "translateZ(0)" }}
        />

        {/* Text overlays */}
        <AnimatePresence mode="wait">
          {!animationDone && currentLabel && (() => {
            const pos = currentLabel.position;
            const isCta = "cta" in currentLabel && currentLabel.cta;
            const isHero = "hero" in currentLabel && currentLabel.hero;

            const containerClass = pos === "center"
              ? "absolute inset-0 flex items-center justify-center px-6 pointer-events-none"
              : pos === "left"
              ? "absolute inset-0 flex items-center justify-start px-8 lg:px-20 pointer-events-none"
              : pos === "right"
              ? "absolute inset-0 flex items-center justify-end px-8 lg:px-20 pointer-events-none"
              : "absolute inset-0 flex items-end justify-center px-6 lg:px-16 pb-20 lg:pb-28 pointer-events-none";

            const initX = pos === "left" ? -30 : pos === "right" ? 30 : 0;
            const initY = pos === "bottom-center" ? 30 : pos === "center" ? 20 : 0;
            const exitX = pos === "left" ? -20 : pos === "right" ? 20 : 0;
            const exitY = pos === "bottom-center" ? -20 : pos === "center" ? -20 : 0;

            return (
              <motion.div
                key={activeBeat}
                initial={{ opacity: 0, y: initY, x: initX, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: exitY, x: exitX, filter: "blur(4px)" }}
                transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                className={containerClass}
              >
                {isHero ? (
                  <div className="text-center max-w-2xl">
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                      className="inline-block text-[10px] uppercase tracking-[0.3em] font-medium text-primary mb-4"
                    >
                      Burgfarrnbach
                    </motion.span>
                    <motion.h1
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                      className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-4"
                    >
                      {currentLabel.title}
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                      className="text-base lg:text-lg text-muted-foreground mb-8 max-w-lg mx-auto"
                    >
                      {currentLabel.subtitle}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                      className="flex flex-col sm:flex-row items-center justify-center gap-3 pointer-events-auto"
                    >
                      <a
                        href="/contact"
                        className="px-8 py-3.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 shadow-[0_4px_20px_rgba(0,128,128,0.2)]"
                        style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
                      >
                        Kostenloses Angebot
                      </a>
                      <a
                        href="tel:091197794971"
                        className="px-8 py-3.5 border border-foreground/15 text-foreground text-sm font-medium rounded-full hover:bg-foreground/5 hover:border-foreground/30 transition-all duration-500"
                        style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
                      >
                        0911 / 977 949 71
                      </a>
                    </motion.div>
                  </div>
                ) : (
                  <div
                    className={`${isCta ? "max-w-lg" : "max-w-sm lg:max-w-md"} ${pos === "left" ? "text-left" : pos === "right" ? "text-right" : "text-center"} px-8 py-7 rounded-2xl`}
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      backdropFilter: "blur(24px)",
                      WebkitBackdropFilter: "blur(24px)",
                      border: "1px solid rgba(0,0,0,0.05)",
                      boxShadow: "0 8px 40px rgba(0,0,0,0.04)",
                    }}
                  >
                    {isCta ? (
                      <>
                        <span className="inline-block text-[10px] uppercase tracking-[0.25em] font-medium text-muted-foreground mb-3">
                          Maler Dorberth
                        </span>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3 whitespace-pre-line">
                          {currentLabel.title}
                        </h2>
                        <p className="text-sm text-muted-foreground mb-6">
                          Sämtliche Malerarbeiten im Innen- und Außenbereich — auch Nachtarbeit
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pointer-events-auto">
                          <a
                            href="/contact"
                            className="px-8 py-3.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 shadow-[0_4px_20px_rgba(0,128,128,0.2)]"
                            style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
                          >
                            Angebot anfragen
                          </a>
                          <a
                            href="tel:091197794971"
                            className="px-8 py-3.5 border-2 border-foreground/15 text-foreground text-sm font-medium rounded-full hover:bg-foreground/5 hover:border-foreground/30 transition-all duration-500"
                            style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
                          >
                            0911 / 977 949 71
                          </a>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="inline-block text-[10px] uppercase tracking-[0.25em] font-medium text-primary mb-2">
                          Maler Dorberth
                        </span>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-2 whitespace-pre-line">
                          {currentLabel.title}
                        </h2>
                        {currentLabel.subtitle && (
                          <p className="text-sm lg:text-base text-muted-foreground font-light">
                            {currentLabel.subtitle}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Scroll indicator */}
        <AnimatePresence>
          {showIndicator && loaded && !animationDone && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
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
        </AnimatePresence>

        {/* Progress dots */}
        {loaded && !animationDone && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
            {BEATS.map((beat) => (
              <button
                key={beat.id}
                onClick={() => goToBeat(beat.id)}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  activeBeat === beat.id ? "bg-primary scale-125" : "bg-foreground/20 hover:bg-foreground/40"
                }`}
                aria-label={`Section ${beat.id}`}
              />
            ))}
          </div>
        )}
      </div>

      {!animationDone && <div style={{ height: "100vh" }} />}
    </div>
  );
}
