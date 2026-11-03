'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  FILMS,
  Film,
  SHEETS,
  CROPS,
  getCropBackgroundStyle,
} from '@/lib/vasariData';

const DECADES = [
  { label: 'ALL / すべて', key: 'all' },
  { label: '1950s', key: '1950s' },
  { label: '1960s', key: '1960s' },
  { label: '1970s', key: '1970s' },
  { label: '1980s', key: '1980s' },
];

function smoothstep(x: number) {
  const c = Math.max(0, Math.min(1, x));
  return c * c * (3 - 2 * c);
}

export function VasariShelfHero() {
  // State for rendering
  const [activeFilmIndex, setActiveFilmIndex] = useState(5); // Noon in Ashes default
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [cursorState, setCursorState] = useState<'default' | 'spine' | 'btn' | 'open'>('default');
  const [probeH, setProbeH] = useState(380);
  const [playRingVisible, setPlayRingVisible] = useState(true);

  // References for animation
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabIndicatorRef = useRef<HTMLDivElement>(null);
  const tabBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Caption line refs for Web Animations API slide
  const titleMaskRef = useRef<HTMLDivElement>(null);
  const subtitleMaskRef = useRef<HTMLDivElement>(null);
  const yearMaskRef = useRef<HTMLDivElement>(null);

  // Detail dialog ref & poster ink mask circles
  const detailSheetRef = useRef<HTMLDivElement>(null);
  const inkCirclesRef = useRef<SVGCircleElement[]>([]);

  // Cursor ref
  const cursorRef = useRef<HTMLDivElement>(null);

  // Engine state (mutable refs to avoid React re-render overhead in rAF loop)
  const engine = useRef({
    s: 17, // 5 + 12 (middle copy)
    T: 17,
    hoverVirtual: -1,
    activeFilm: 5,
    mx: -100,
    my: -100,
    cx: -100,
    cy: -100,
    tiltX: 0,
    tiltY: 0,
    onCover: false,
    isOpen: false,
    isDragging: false,
    dragStartX: 0,
    dragStartT: 0,
    dragMoved: false,
    lastTime: performance.now(),
    lifts: new Array(36).fill(0),
    coverRect: null as DOMRect | null,
    wheelTimeout: null as any,
  });

  // Calculate dimensions from H
  const H = probeH;
  const ws = (H * 142) / 840;
  const d = (H * 474) / 900;
  const gap = H * 0.03;

  // Measure --H on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (probeRef.current) {
        const measured = probeRef.current.offsetHeight;
        if (measured > 0) setProbeH(measured);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Preload Higgsfield sheets
  useEffect(() => {
    Object.values(SHEETS).forEach((sheet) => {
      const img = new Image();
      img.src = sheet.url;
    });
  }, []);

  // Sync tab indicator
  const updateTabIndicator = useCallback((filmIdx: number) => {
    const film = FILMS[filmIdx];
    if (!film || !tabsRef.current || !tabIndicatorRef.current) return;

    let targetTabIdx = 1; // 1950s
    if (film.year >= 1980) targetTabIdx = 4;
    else if (film.year >= 1970) targetTabIdx = 3;
    else if (film.year >= 1960) targetTabIdx = 2;

    const btn = tabBtnRefs.current[targetTabIdx];
    if (btn) {
      tabIndicatorRef.current.style.width = `${btn.offsetWidth}px`;
      tabIndicatorRef.current.style.transform = `translateX(${btn.offsetLeft}px)`;
    }
  }, []);

  // Caption swap animation (Web Animations API)
  const swapCaption = useCallback((filmIdx: number, dir: number) => {
    const film = FILMS[filmIdx];
    if (!film) return;

    setActiveFilmIndex(filmIdx);
    updateTabIndicator(filmIdx);

    const timing: KeyframeAnimationOptions = {
      duration: 650,
      easing: 'cubic-bezier(.2,.8,.2,1)',
      fill: 'both',
    };

    const animateMask = (maskEl: HTMLDivElement | null, newText: string) => {
      if (!maskEl) return;
      const oldChild = maskEl.firstElementChild as HTMLElement;

      const newChild = document.createElement('span');
      newChild.className = 'block whitespace-nowrap will-change-transform';
      newChild.textContent = newText;
      maskEl.appendChild(newChild);

      // Slide in new child
      newChild.animate(
        [
          { transform: `translateY(${dir * 105}%)` },
          { transform: 'translateY(0%)' },
        ],
        timing
      );

      // Slide out old child
      if (oldChild && oldChild !== newChild) {
        oldChild.style.position = 'absolute';
        oldChild.style.top = '0';
        oldChild.style.left = '0';
        oldChild.style.right = '0';
        const anim = oldChild.animate(
          [
            { transform: 'translateY(0%)' },
            { transform: `translateY(${-dir * 105}%)` },
          ],
          timing
        );
        anim.onfinish = () => {
          oldChild.remove();
        };
      }
    };

    animateMask(titleMaskRef.current, film.title);
    animateMask(subtitleMaskRef.current, `${film.romaji} / ${film.kanji}`);
    animateMask(yearMaskRef.current, `${film.year}`);
  }, [updateTabIndicator]);

  // Open Detail Sequence
  const openDetail = useCallback(() => {
    const eng = engine.current;
    if (eng.isOpen) return;
    eng.isOpen = true;
    setIsDetailOpen(true);

    // Snap T to integer
    eng.T = Math.round(eng.T);

    const activeVirtual = ((Math.round(eng.s) % 36) + 36) % 36;
    const tapeEl = stageRef.current?.querySelector(`[data-virtual="${activeVirtual}"]`) as HTMLElement;
    const coverFace = tapeEl?.querySelector('.cv') as HTMLElement;
    if (coverFace) {
      eng.coverRect = coverFace.getBoundingClientRect();
    }

    const detailSheet = detailSheetRef.current;
    if (!detailSheet) return;

    detailSheet.style.visibility = 'visible';
    detailSheet.style.pointerEvents = 'auto';

    const rect = eng.coverRect || {
      top: window.innerHeight / 2 - 200,
      left: window.innerWidth / 2 - 120,
      width: 240,
      height: 400,
    };

    const insetTop = rect.top;
    const insetLeft = rect.left;
    const insetRight = window.innerWidth - (rect.left + (rect as any).width);
    const insetBottom = window.innerHeight - (rect.top + (rect as any).height);

    // Sheet growth animation
    detailSheet.animate(
      [
        {
          clipPath: `inset(${insetTop}px ${insetRight}px ${insetBottom}px ${insetLeft}px round 3px)`,
          transform: 'rotate(-4.5deg)',
        },
        {
          clipPath: 'inset(0px 0px 0px 0px round 0px)',
          transform: 'rotate(0deg)',
        },
      ],
      {
        duration: 1050,
        easing: 'cubic-bezier(.76,0,.18,1)',
        fill: 'both',
      }
    );

    // Masked text rise
    const detailMasks = detailSheet.querySelectorAll('.detail-line-mask');
    detailMasks.forEach((mask, idx) => {
      const child = mask.firstElementChild as HTMLElement;
      if (child) {
        child.animate(
          [
            { transform: 'translateY(110%)' },
            { transform: 'translateY(0%)' },
          ],
          {
            duration: 900,
            delay: 620 + idx * 75,
            easing: 'cubic-bezier(.2,.8,.2,1)',
            fill: 'both',
          }
        );
      }
    });

    // Poster ink bleed in rAF loop
    const blobs = [
      { cx: 150, cy: 330, delay: 0 },
      { cx: 340, cy: 600, delay: 120 },
      { cx: 250, cy: 120, delay: 220 },
      { cx: 90, cy: 760, delay: 300 },
      { cx: 400, cy: 250, delay: 360 },
      { cx: 260, cy: 860, delay: 420 },
      { cx: 230, cy: 470, delay: 180 },
    ];

    inkCirclesRef.current.forEach((c) => {
      if (c) c.setAttribute('r', '0');
    });

    const startTime = performance.now() + 520;
    const duration = 1250;

    const animateBlobs = (now: number) => {
      if (!eng.isOpen) return;
      let allDone = true;

      blobs.forEach((b, idx) => {
        const circle = inkCirclesRef.current[idx];
        if (!circle) return;

        const elapsed = now - (startTime + b.delay);
        if (elapsed <= 0) {
          circle.setAttribute('r', '0');
          allDone = false;
        } else {
          const progress = Math.min(1, elapsed / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          circle.setAttribute('r', `${eased * 720}`);
          if (progress < 1) allDone = false;
        }
      });

      if (!allDone) {
        requestAnimationFrame(animateBlobs);
      }
    };

    setTimeout(() => {
      requestAnimationFrame(animateBlobs);
    }, 520);
  }, []);

  // Close Detail Sequence
  const closeDetail = useCallback(() => {
    const eng = engine.current;
    if (!eng.isOpen) return;

    const detailSheet = detailSheetRef.current;
    if (!detailSheet) return;

    const rect = eng.coverRect || {
      top: window.innerHeight / 2 - 200,
      left: window.innerWidth / 2 - 120,
      width: 240,
      height: 400,
    };

    const insetTop = rect.top;
    const insetLeft = rect.left;
    const insetRight = window.innerWidth - (rect.left + (rect as any).width);
    const insetBottom = window.innerHeight - (rect.top + (rect as any).height);

    const anim = detailSheet.animate(
      [
        {
          clipPath: 'inset(0px 0px 0px 0px round 0px)',
          transform: 'rotate(0deg)',
        },
        {
          clipPath: `inset(${insetTop}px ${insetRight}px ${insetBottom}px ${insetLeft}px round 3px)`,
          transform: 'rotate(-4.5deg)',
        },
      ],
      {
        duration: 850,
        easing: 'cubic-bezier(.76,0,.18,1)',
        fill: 'both',
      }
    );

    anim.onfinish = () => {
      detailSheet.style.visibility = 'hidden';
      detailSheet.style.pointerEvents = 'none';
      eng.isOpen = false;
      setIsDetailOpen(false);
    };
  }, []);

  // Decade Jump
  const jumpToDecade = (key: string) => {
    const eng = engine.current;
    let targetIndex = 0;
    if (key === '1950s') targetIndex = 0;
    else if (key === '1960s') targetIndex = 1;
    else if (key === '1970s') targetIndex = 5;
    else if (key === '1980s') targetIndex = 9;

    const currentFilm = ((Math.round(eng.T) % 12) + 12) % 12;
    let diff = targetIndex - currentFilm;
    if (diff > 6) diff -= 12;
    if (diff < -6) diff += 12;

    eng.T = Math.round(eng.T + diff);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const eng = engine.current;
      if (e.key === 'ArrowLeft') {
        eng.T = Math.round(eng.T) - 1;
      } else if (e.key === 'ArrowRight') {
        eng.T = Math.round(eng.T) + 1;
      } else if (e.key === 'Enter') {
        if (!eng.isOpen) openDetail();
      } else if (e.key === 'Escape') {
        if (eng.isOpen) closeDetail();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openDetail, closeDetail]);

  // Main Motion Engine (rAF Loop)
  useEffect(() => {
    let animId: number;

    const loop = (now: number) => {
      const eng = engine.current;
      const dt = Math.min(0.05, (now - eng.lastTime) / 1000);
      eng.lastTime = now;

      // Spring physics
      const k = eng.isDragging ? 18 : 5.2;
      eng.s += (eng.T - eng.s) * (1 - Math.exp(-k * dt));
      if (Math.abs(eng.T - eng.s) < 1e-4) {
        eng.s = eng.T;
      }

      // Normalise s & T if drifted beyond full loops
      if (eng.s < 6) {
        eng.s += 12;
        eng.T += 12;
      } else if (eng.s > 30) {
        eng.s -= 12;
        eng.T -= 12;
      }

      // Track active film index
      const activeFilmIdx = ((Math.round(eng.s) % 12) + 12) % 12;
      if (activeFilmIdx !== eng.activeFilm) {
        const dir = Math.sign(eng.T - eng.s) || 1;
        eng.activeFilm = activeFilmIdx;
        swapCaption(activeFilmIdx, dir);
      }

      // Smooth custom cursor cx, cy
      eng.cx += (eng.mx - eng.cx) * (1 - Math.exp(-16 * dt));
      eng.cy += (eng.my - eng.cy) * (1 - Math.exp(-16 * dt));

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${eng.cx}px, ${eng.cy}px, 0)`;
      }

      // Tilt smoothing
      const W = window.innerWidth;
      const cy_shelf = window.innerHeight * 0.5;

      const onCover =
        Math.abs(eng.mx - W / 2) < 0.55 * d &&
        Math.abs(eng.my - cy_shelf) < 0.55 * H &&
        !eng.isOpen &&
        Math.abs(eng.T - eng.s) < 0.3;

      eng.onCover = onCover;

      let targetTiltY = 0;
      let targetTiltX = 0;

      if (onCover) {
        targetTiltY = ((eng.mx - W / 2) / (0.55 * d)) * 9;
        targetTiltX = -((eng.my - cy_shelf) / (H / 2)) * 6;
      } else {
        targetTiltY = ((eng.mx - W / 2) / W) * 5;
        targetTiltX = 0;
      }

      eng.tiltY += (targetTiltY - eng.tiltY) * (1 - Math.exp(-7 * dt));
      eng.tiltX += (targetTiltX - eng.tiltX) * (1 - Math.exp(-7 * dt));

      // Update Cursor State
      if (eng.isOpen) {
        setCursorState('default');
      } else if (onCover) {
        setCursorState('open');
      } else if (eng.hoverVirtual >= 0) {
        setCursorState('spine');
      } else {
        setCursorState('default');
      }

      // Update Play ring scale
      const ringScale = smoothstep(Math.max(0, 1 - Math.abs(eng.T - eng.s) * 3));
      setPlayRingVisible(ringScale > 0.05 && !eng.isOpen);

      // Render all 36 tapes in 3D
      const stage = stageRef.current;
      if (stage) {
        stage.style.setProperty('--ws', `${ws}px`);
        stage.style.setProperty('--d', `${d}px`);

        const tapeNodes = stage.children;
        for (let v = 0; v < 36; v++) {
          const tapeEl = tapeNodes[v] as HTMLElement;
          if (!tapeEl) continue;

          // Relative index r in range [-18 .. +18]
          const r = ((((v - eng.s) % 36) + 54) % 36) - 18;

          // Smooth step B(r)
          let Br = 0;
          if (Math.abs(r) < 1) {
            Br = (r + Math.sin(Math.PI * r) / Math.PI) / 2;
          } else {
            Br = r > 0 ? 0.5 : -0.5;
          }

          const x = r * (ws + gap) + (d - ws + 1.6 * gap) * Br;

          // Culling off-screen tapes
          if (Math.abs(x) > W / 2 + 1.5 * d) {
            tapeEl.style.visibility = 'hidden';
            continue;
          } else {
            tapeEl.style.visibility = 'visible';
          }

          // Openness o
          const openRaw = Math.max(0, 1 - Math.abs(r));
          const o = smoothstep(openRaw);

          // Hover lift
          const targetLift = eng.hoverVirtual === v && Math.abs(r) > 0.5 ? 1 : 0;
          eng.lifts[v] += (targetLift - eng.lifts[v]) * (1 - Math.exp(-12 * dt));
          const lift = eng.lifts[v];

          // 3D transforms
          const rotY = -90 * o + eng.tiltY * o;
          const rotX = eng.tiltX * o;
          const rotZ = -4.5 * o;
          const tz = o * 0.2 * H;
          const ty = -o * 0.025 * H - lift * 0.045 * H;

          tapeEl.style.transform = `translate3d(${x}px, ${ty}px, ${tz}px) rotateZ(${rotZ}deg) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
          tapeEl.style.zIndex = `${Math.round(100 - Math.abs(r) * 4)}`;

          // Shade variables
          tapeEl.style.setProperty('--spine-shade', `${o * 0.55}`);
          tapeEl.style.setProperty('--cover-shade', `${(1 - o) * 0.5}`);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [H, d, gap, ws, swapCaption]);

  // Pointer move handler
  const handlePointerMove = (e: React.PointerEvent) => {
    const eng = engine.current;
    eng.mx = e.clientX;
    eng.my = e.clientY;

    if (eng.isDragging) {
      const dx = e.clientX - eng.dragStartX;
      if (Math.abs(dx) > 5) {
        eng.dragMoved = true;
      }
      eng.T = eng.dragStartT - dx / (ws + gap);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const eng = engine.current;
    eng.isDragging = true;
    eng.dragStartX = e.clientX;
    eng.dragStartT = eng.T;
    eng.dragMoved = false;
  };

  const handlePointerUp = () => {
    const eng = engine.current;
    eng.isDragging = false;
    eng.T = Math.round(eng.T);
  };

  // Wheel scrubbing
  const handleWheel = (e: React.WheelEvent) => {
    const eng = engine.current;
    if (eng.isOpen) return;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    eng.T += (delta / (ws + gap)) * 0.45;

    clearTimeout(eng.wheelTimeout);
    eng.wheelTimeout = setTimeout(() => {
      eng.T = Math.round(eng.T);
    }, 160);
  };

  // Tape click
  const handleTapeClick = (v: number) => {
    const eng = engine.current;
    if (eng.dragMoved) return;

    const r = ((((v - eng.s) % 36) + 54) % 36) - 18;
    if (Math.abs(r) < 0.5) {
      openDetail();
    } else {
      eng.T = Math.round(eng.T + r);
    }
  };

  const activeFilm = FILMS[activeFilmIndex] || FILMS[5];
  const activeCoverCrop = CROPS[`cover-${activeFilm.id}`];
  const activeCoverSheet = activeCoverCrop ? SHEETS[activeCoverCrop.sheet] : null;

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      className="vasari-root relative w-full h-screen overflow-hidden select-none bg-[#EDEBE6] text-[#141414]"
      style={{
        cursor: 'default',
        touchAction: 'pan-y',
      }}
    >
      {/* Off-screen height probe to resolve --H */}
      <div
        ref={probeRef}
        className="fixed opacity-0 pointer-events-none -left-[9999px]"
        style={{ height: 'var(--H)' }}
      />

      {/* 0. Fullscreen Paper Grain Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          mixBlendMode: 'multiply',
          opacity: 0.55,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.45 0 0 0 0 0.42 0 0 0 0 0.38 0 0 0 0.22 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 1. Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-[84px] px-8 grid grid-cols-3 items-center z-30 pointer-events-auto">
        <div className="flex items-center gap-3">
          <Link
            href="/bmkg"
            className="vasari-lbl vasari-box text-[#141414] hover:bg-[#141414] hover:text-[#EDEBE6] transition-colors"
          >
            BMKG MONITOR ↗
          </Link>
          <button
            type="button"
            className="vasari-lbl vasari-box text-[#141414] hover:bg-[#141414] hover:text-[#EDEBE6] transition-colors"
          >
            BACK / 戻る
          </button>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center justify-center text-[#1F3FB0]">
          <span className="vasari-kanji-logo text-[22px] font-bold tracking-[0.04em] leading-tight">
            莱昂·瓦萨里
          </span>
          <span className="vasari-sans font-semibold text-[9px] tracking-[0.34em] pl-[0.34em] leading-none mt-1">
            LEON VASARI
          </span>
        </div>

        {/* Right Label */}
        <div className="flex justify-end">
          <span className="vasari-lbl text-[#141414] hidden md:inline">
            CAREER 1958年〜1989年
          </span>
        </div>
      </header>

      {/* 2. Decade Tabs */}
      <nav
        ref={tabsRef}
        aria-label="Decades"
        className="fixed left-1/2 -translate-x-1/2 z-30 flex items-center"
        style={{
          top: `calc(50% - ${H / 2}px - 86px)`,
        }}
      >
        {/* Sliding Cobalt Background Block */}
        <div
          ref={tabIndicatorRef}
          className="absolute top-0 left-0 h-[23px] bg-[#1F3FB0] transition-all duration-[600ms] pointer-events-none"
          style={{
            transitionTimingFunction: 'var(--ease)',
          }}
        />

        {DECADES.map((tab, idx) => {
          const isActive =
            (tab.key === '1950s' && activeFilm.year < 1960) ||
            (tab.key === '1960s' && activeFilm.year >= 1960 && activeFilm.year < 1970) ||
            (tab.key === '1970s' && activeFilm.year >= 1970 && activeFilm.year < 1980) ||
            (tab.key === '1980s' && activeFilm.year >= 1980);

          return (
            <button
              key={tab.key}
              ref={(el) => {
                tabBtnRefs.current[idx] = el;
              }}
              type="button"
              onClick={() => jumpToDecade(tab.key)}
              className={`vasari-lbl relative h-[23px] px-[11px] border border-[var(--rule)] -ml-[1px] first:ml-0 transition-colors duration-[450ms] whitespace-nowrap z-10 ${
                isActive ? 'text-white' : 'text-[#141414] hover:text-[#1F3FB0]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* 3. The 3D Shelf Stage */}
      <section
        aria-label="Filmography shelf"
        className="fixed inset-x-0 overflow-visible z-20"
        style={{
          top: `calc(50% - ${H / 2}px - 40px)`,
          height: `${H + 80}px`,
          perspective: '2200px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        <div
          ref={stageRef}
          className="preserve-3d absolute left-1/2 top-1/2 w-0 h-0"
        >
          {Array.from({ length: 36 }).map((_, v) => {
            const filmIdx = v % 12;
            const film = FILMS[filmIdx];
            const spineStyle = getCropBackgroundStyle(`spine-${film.id}`);
            const coverStyle = getCropBackgroundStyle(`cover-${film.id}`);

            return (
              <div
                key={v}
                data-virtual={v}
                onClick={() => handleTapeClick(v)}
                onPointerEnter={() => {
                  engine.current.hoverVirtual = v;
                }}
                onPointerLeave={() => {
                  if (engine.current.hoverVirtual === v) {
                    engine.current.hoverVirtual = -1;
                  }
                }}
                className="preserve-3d absolute left-0 top-0 w-0 h-0 will-change-transform cursor-pointer"
              >
                {/* Spine Face (.sp) */}
                <div
                  className="sp backface-hidden absolute rounded-[2px] overflow-hidden"
                  style={{
                    width: 'var(--ws)',
                    height: `${H}px`,
                    left: 'calc(var(--ws) * -0.5)',
                    top: `${-H / 2}px`,
                    transform: 'translateZ(calc(var(--d) * 0.5))',
                    ...spineStyle,
                  }}
                >
                  {/* Dynamic Shading Overlay */}
                  <div
                    className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-150"
                    style={{ opacity: 'var(--spine-shade, 0)' }}
                  />
                </div>

                {/* Cover Face (.cv) */}
                <div
                  className="cv backface-hidden absolute rounded-[2px] overflow-hidden"
                  style={{
                    width: 'var(--d)',
                    height: `${H}px`,
                    left: 'calc(var(--d) * -0.5)',
                    top: `${-H / 2}px`,
                    transform: 'rotateY(90deg) translateZ(calc(var(--ws) * 0.5))',
                    boxShadow: '0 30px 60px -28px rgba(20, 16, 10, 0.55)',
                    ...coverStyle,
                  }}
                >
                  {/* Dynamic Shading Overlay */}
                  <div
                    className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-150"
                    style={{ opacity: 'var(--cover-shade, 0)' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Play Ring on Active Cover */}
      {playRingVisible && (
        <button
          type="button"
          aria-label="Open film"
          onClick={openDetail}
          className="fixed z-30 w-[42px] h-[42px] rounded-full border border-[#1F3FB0] text-[#1F3FB0] bg-[#EDEBE6]/75 flex items-center justify-center transition-transform hover:scale-110 shadow-md backdrop-blur-sm"
          style={{
            left: `calc(50% - ${d / 2}px - 6px)`,
            top: `calc(50% + ${H * 0.36}px)`,
          }}
        >
          <svg className="w-[12px] h-[12px] fill-current ml-[2px]" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}

      {/* 5. Caption Stack */}
      <div
        aria-live="polite"
        className="fixed left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-[9px] pointer-events-none text-center"
        style={{
          top: `calc(50% + ${H / 2}px + 30px)`,
          width: 'min(92vw, 760px)',
        }}
      >
        {/* Title */}
        <div ref={titleMaskRef} className="relative overflow-hidden h-[38px] flex items-center justify-center">
          <span className="vasari-serif text-[31px] leading-[1.12] tracking-[-0.01em] block">
            {activeFilm.title}
          </span>
        </div>

        {/* Subtitle */}
        <div ref={subtitleMaskRef} className="relative overflow-hidden h-[18px] flex items-center justify-center">
          <span className="vasari-lbl text-[#1F3FB0] font-medium block">
            {activeFilm.romaji} / {activeFilm.kanji}
          </span>
        </div>

        {/* Year */}
        <div ref={yearMaskRef} className="relative overflow-hidden h-[16px] flex items-center justify-center">
          <span className="vasari-sans text-[11px] font-medium tracking-[0.08em] text-[#141414] block">
            {activeFilm.year}
          </span>
        </div>
      </div>

      {/* 6. Navigation Arrows */}
      <button
        type="button"
        aria-label="Previous film"
        onClick={() => (engine.current.T = Math.round(engine.current.T) - 1)}
        className="fixed z-30 w-[44px] h-[44px] left-5 flex items-center justify-center text-[#141414] hover:text-[#1F3FB0] transition-colors"
        style={{ top: `calc(50% + ${H / 2}px + 40px)` }}
      >
        <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M5 1L1 5L5 9" />
          <path d="M1 5H17" />
        </svg>
      </button>

      <button
        type="button"
        aria-label="Next film"
        onClick={() => (engine.current.T = Math.round(engine.current.T) + 1)}
        className="fixed z-30 w-[44px] h-[44px] right-5 flex items-center justify-center text-[#141414] hover:text-[#1F3FB0] transition-colors"
        style={{ top: `calc(50% + ${H / 2}px + 40px)` }}
      >
        <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M13 1L17 5L13 9" />
          <path d="M17 5H1" />
        </svg>
      </button>

      {/* 7. Footer */}
      <footer className="fixed bottom-[26px] inset-x-8 z-30 flex items-center justify-between text-[#141414]">
        <span className="vasari-lbl text-[10px]">
          © LEON VASARI. ALL RIGHTS RESERVED.
        </span>
        <div className="flex items-center gap-2 vasari-lbl text-[10px]">
          <span className="hover:text-[#1F3FB0] cursor-pointer">FB</span>
          <span>/</span>
          <span className="hover:text-[#1F3FB0] cursor-pointer">TW</span>
        </div>
      </footer>

      {/* 8. Custom Ring Cursor */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-[58px] h-[58px] -ml-[29px] -mt-[29px] pointer-events-none z-50 hidden md:flex items-center justify-center will-change-transform"
      >
        {/* Ring */}
        <div
          className={`absolute inset-0 rounded-full border transition-all duration-300 ease-[var(--ease)] flex items-center justify-center ${
            cursorState === 'open'
              ? 'scale-[1.75] bg-[#1F3FB0] border-[#1F3FB0]'
              : cursorState === 'spine'
              ? 'scale-[0.72] border-[#141414]'
              : cursorState === 'btn'
              ? 'scale-[0.55] border-[#141414]'
              : 'scale-100 border-[#141414]'
          }`}
          style={{ borderWidth: '1.5px' }}
        >
          {/* Label inside OPEN ring */}
          <span
            className={`vasari-sans text-white text-[10px] font-semibold leading-[1.25] tracking-[0.1em] text-center transition-transform duration-200 ${
              cursorState === 'open' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}
          >
            OPEN
            <br />
            開く
          </span>
        </div>

        {/* Center dot */}
        <div
          className={`w-[6px] h-[6px] rounded-full bg-[#141414] transition-transform duration-200 ${
            cursorState === 'default' || cursorState === 'spine' ? 'scale-100' : 'scale-0'
          }`}
        />
      </div>

      {/* 9. Detail Dialog: Paper Sheet Growth & Ink Bleed Reveal */}
      <div
        ref={detailSheetRef}
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[60] bg-[#F4F2ED] overflow-y-auto invisible pointer-events-none will-change-transform"
      >
        {/* Detail Header with Close & Logo */}
        <div className="sticky top-0 w-full h-[84px] px-8 flex items-center justify-between z-10 bg-[#F4F2ED]/90 backdrop-blur-sm">
          <button
            type="button"
            onClick={closeDetail}
            className="vasari-lbl vasari-box text-[#141414] hover:bg-[#141414] hover:text-[#F4F2ED] transition-colors"
          >
            CLOSE / 閉じる
          </button>

          <div className="flex flex-col items-center justify-center text-[#1F3FB0]">
            <span className="vasari-kanji-logo text-[22px] font-bold tracking-[0.04em] leading-tight">
              莱昂·瓦萨里
            </span>
            <span className="vasari-sans font-semibold text-[9px] tracking-[0.34em] pl-[0.34em] leading-none mt-1">
              LEON VASARI
            </span>
          </div>

          <div className="w-[100px]" />
        </div>

        {/* Detail Content Grid */}
        <div className="max-w-6xl mx-auto px-6 sm:px-12 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[calc(100vh-100px)]">
          {/* Left Column: Masked Text Lines */}
          <div className="space-y-4 max-w-[520px]">
            {/* Subtitle */}
            <div className="detail-line-mask overflow-hidden">
              <span className="vasari-lbl text-[#1F3FB0] block">
                {activeFilm.romaji} / {activeFilm.kanji}
              </span>
            </div>

            {/* Title */}
            <div className="detail-line-mask overflow-hidden">
              <h1 className="vasari-serif text-[clamp(44px,5.4vw,84px)] leading-[1] tracking-[-0.025em] text-[#141414] block">
                {activeFilm.title}
              </h1>
            </div>

            {/* Meta */}
            <div className="detail-line-mask overflow-hidden">
              <span className="vasari-lbl text-[#6D6A63] block">
                {activeFilm.year} / {activeFilm.genre.toUpperCase()} / {activeFilm.minutes} MIN
              </span>
            </div>

            {/* Synopsis */}
            <div className="detail-line-mask overflow-hidden">
              <p className="vasari-serif text-[17px] leading-[1.5] text-[#141414] max-w-[42ch] block">
                {activeFilm.synopsis}
              </p>
            </div>

            {/* Italic Credit */}
            <div className="detail-line-mask overflow-hidden">
              <p className="vasari-serif italic text-[15px] text-[#6D6A63] block">
                Written and directed by Leon Vasari. 監督作品
              </p>
            </div>

            {/* Action Watch Button */}
            <div className="detail-line-mask overflow-hidden pt-2">
              <button
                type="button"
                className="vasari-lbl h-[44px] px-6 border border-[#1F3FB0] text-[#1F3FB0] hover:bg-[#1F3FB0] hover:text-white transition-colors"
              >
                WATCH THE FILM / 映画を見る
              </button>
            </div>
          </div>

          {/* Right Column: Poster with SVG Ink Mask */}
          <div className="flex items-center justify-center">
            <div
              className="relative w-full max-w-[420px] aspect-[474/900] shadow-2xl rounded-[3px] overflow-hidden"
              style={{ maxHeight: '78vh' }}
            >
              {activeCoverCrop && activeCoverSheet && (
                <svg
                  viewBox="0 0 474 900"
                  className="w-full h-full"
                  aria-hidden="true"
                >
                  <defs>
                    {/* Ink Turbulence & Displacement Filter */}
                    <filter id="ink-filter" x="-20%" y="-20%" width="140%" height="140%">
                      <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.011"
                        numOctaves="3"
                        seed="7"
                        result="noise"
                      />
                      <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="120"
                        xChannelSelector="R"
                        yChannelSelector="G"
                      />
                    </filter>

                    {/* Ragged Ink Mask with 7 expanding circles */}
                    <mask id="ink-mask" maskUnits="userSpaceOnUse" x="-200" y="-200" width="874" height="1300">
                      <rect x="-200" y="-200" width="874" height="1300" fill="black" />
                      <g filter="url(#ink-filter)" fill="white">
                        <circle ref={(el) => { if (el) inkCirclesRef.current[0] = el; }} cx="150" cy="330" r="0" />
                        <circle ref={(el) => { if (el) inkCirclesRef.current[1] = el; }} cx="340" cy="600" r="0" />
                        <circle ref={(el) => { if (el) inkCirclesRef.current[2] = el; }} cx="250" cy="120" r="0" />
                        <circle ref={(el) => { if (el) inkCirclesRef.current[3] = el; }} cx="90" cy="760" r="0" />
                        <circle ref={(el) => { if (el) inkCirclesRef.current[4] = el; }} cx="400" cy="250" r="0" />
                        <circle ref={(el) => { if (el) inkCirclesRef.current[5] = el; }} cx="260" cy="860" r="0" />
                        <circle ref={(el) => { if (el) inkCirclesRef.current[6] = el; }} cx="230" cy="470" r="0" />
                      </g>
                    </mask>

                    {/* Cover Crop clipPath */}
                    <clipPath id="poster-clip">
                      <rect x="0" y="0" width="474" height="900" />
                    </clipPath>
                  </defs>

                  {/* Clipped & Masked Image */}
                  <g clipPath="url(#poster-clip)" mask="url(#ink-mask)">
                    <image
                      href={activeCoverSheet.url}
                      x={(-activeCoverCrop.x * 474) / activeCoverCrop.w}
                      y={(-activeCoverCrop.y * 900) / activeCoverCrop.h}
                      width={(activeCoverSheet.w * 474) / activeCoverCrop.w}
                      height={(activeCoverSheet.h * 900) / activeCoverCrop.h}
                      preserveAspectRatio="none"
                    />
                  </g>
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
