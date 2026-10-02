import { useEffect, useRef, useState } from 'react';
import { Sparkles, Trophy, X } from 'lucide-react';
import { usePrefs } from '@/store/prefs';

interface CelebrationPayload {
  label: string;
  detail: string;
}

const MITHAI_COLORS = [
  '#F2B33D', // Kesar Gold
  '#FF6F8E', // Pomelo Flame
  '#A9CC6B', // Pistachio Barfi
  '#F4A6B7', // Rasmalai Rose
  '#CFD2DA', // Varq Silver
  '#6E1F4B', // Mulberry
];

export function ConfettiEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeCelebration, setActiveCelebration] = useState<CelebrationPayload | null>(null);
  const reducedMotion = usePrefs((s) => s.reducedMotion);

  useEffect(() => {
    const onCelebration = (e: Event) => {
      const custom = e as CustomEvent<CelebrationPayload>;
      const payload = custom.detail ?? { label: 'Milestone Reached!', detail: 'Scout badge unlocked' };
      setActiveCelebration(payload);

      const prefersReduced =
        reducedMotion ||
        (typeof window !== 'undefined' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches);

      if (!prefersReduced && canvasRef.current) {
        runConfetti(canvasRef.current);
      }

      // Auto dismiss banner after 5s
      const timer = window.setTimeout(() => {
        setActiveCelebration(null);
      }, 5000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('btc:milestone-celebrate', onCelebration);
    return () => window.removeEventListener('btc:milestone-celebrate', onCelebration);
  }, [reducedMotion]);

  return (
    <>
      {/* Full screen canvas for non-reduced-motion particles */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[100] h-full w-full"
        aria-hidden="true"
      />

      {/* Accessible celebration banner */}
      {activeCelebration && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 left-1/2 z-[101] -translate-x-1/2 max-w-md w-[90%] pointer-events-auto"
        >
          <div className="scallop grain varq flex items-center justify-between gap-3 rounded-2xl bg-ink p-4 text-canvas shadow-btc-lg border-2 border-kesar">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kesar text-ink shadow-sm">
              <Trophy aria-hidden className="h-6 w-6" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-1.5 text-kesar">
                <Sparkles aria-hidden className="h-3.5 w-3.5" />
                <span className="font-body text-[0.6875rem] font-bold uppercase tracking-wider">
                  Milestone Celebration
                </span>
              </div>
              <p className="truncate font-display text-base font-bold text-canvas">
                {activeCelebration.label}
              </p>
              <p className="line-clamp-1 font-body text-xs text-silver">
                {activeCelebration.detail}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveCelebration(null)}
              aria-label="Dismiss milestone alert"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-silver hover:bg-white/10 hover:text-canvas transition-colors"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function runConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const count = 75;
  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    rotSpeed: number;
    opacity: number;
  }> = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 10 - 4,
      size: Math.random() * 8 + 4,
      color: MITHAI_COLORS[Math.floor(Math.random() * MITHAI_COLORS.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      opacity: 1,
    });
  }

  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    if (elapsed > 2400 || !ctx) {
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.98; // drag
      p.rotation += p.rotSpeed;
      if (elapsed > 1600) {
        p.opacity = Math.max(0, p.opacity - 0.025);
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }

    requestAnimationFrame(animate);
  }

  animate();
}
