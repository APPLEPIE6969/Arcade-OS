"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Gamepad2,
  Keyboard,
  Tag,
  Flame,
  RefreshCw,
  ExternalLink,
  Info,
  AlertTriangle,
  Download,
  AlertCircle,
} from "lucide-react";
import { getGameBySlug, games, type Game, type GameRequirement } from "@/data/games";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const accentTextMap: Record<Game["accent"], string> = {
  cyan: "text-neon-cyan",
  magenta: "text-neon-magenta",
  yellow: "text-neon-yellow",
  purple: "text-neon-purple",
};

const accentBorderMap: Record<Game["accent"], string> = {
  cyan: "border-neon-cyan/40",
  magenta: "border-neon-magenta/40",
  yellow: "border-neon-yellow/40",
  purple: "border-neon-purple/40",
};

const accentBgMap: Record<Game["accent"], string> = {
  cyan: "bg-neon-cyan/10",
  magenta: "bg-neon-magenta/10",
  yellow: "bg-neon-yellow/10",
  purple: "bg-neon-purple/10",
};

const severityIconMap: Record<
  NonNullable<GameRequirement["severity"]>,
  React.ElementType
> = {
  warning: AlertTriangle,
  critical: AlertCircle,
  info: Info,
};

const severityStyleMap: Record<
  NonNullable<GameRequirement["severity"]>,
  { border: string; icon: string; title: string; bg: string }
> = {
  warning: {
    border: "border-neon-yellow/40",
    icon: "text-neon-yellow",
    title: "text-neon-yellow",
    bg: "bg-neon-yellow/5",
  },
  critical: {
    border: "border-neon-magenta/50",
    icon: "text-neon-magenta",
    title: "text-neon-magenta",
    bg: "bg-neon-magenta/5",
  },
  info: {
    border: "border-neon-cyan/40",
    icon: "text-neon-cyan",
    title: "text-neon-cyan",
    bg: "bg-neon-cyan/5",
  },
};

function RequirementBanner({ requirement }: { requirement: GameRequirement }) {
  const severity = requirement.severity ?? "warning";
  const Icon = severityIconMap[severity];
  const styles = severityStyleMap[severity];
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mb-4 overflow-hidden rounded-xl border px-5 py-4 backdrop-blur",
        styles.border,
        styles.bg,
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
            styles.border,
            "bg-background/40",
          )}
        >
          <Icon className={cn("h-5 w-5", styles.icon)} />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              className={cn(
                "font-mono text-xs font-bold uppercase tracking-widest",
                styles.title,
              )}
            >
              {requirement.title}
            </h2>
            {severity === "critical" && (
              <span className="rounded-md border border-neon-magenta/40 bg-neon-magenta/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neon-magenta">
                Required
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-foreground/85">
            {requirement.body}
          </p>
          {requirement.downloadUrl && (
            <a
              href={requirement.downloadUrl}
              download={requirement.downloadLabel ?? true}
              className={cn(
                "mt-1 inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all",
                styles.border,
                "bg-background/40 text-foreground hover:bg-background/70",
              )}
            >
              <Download className={cn("h-3.5 w-3.5", styles.icon)} />
              Download {requirement.downloadLabel ?? "file"}
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function NotFoundState({ slug }: { slug: string }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-neon-magenta/30 bg-neon-magenta/10">
        <span className="font-mono text-2xl text-neon-magenta">404</span>
      </div>
      <h1 className="font-mono text-2xl font-bold text-foreground">
        Game not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We could not find a game with the slug{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-foreground">
          {slug}
        </code>
        . It may have been removed or never existed.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/">
          <Button className="gap-2 rounded-lg bg-neon-cyan text-background hover:bg-neon-cyan/90">
            <ArrowLeft className="h-4 w-4" /> Back to arcade
          </Button>
        </Link>
      </div>
      <div className="mt-10 w-full">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Try one of these instead
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {games.slice(0, 3).map((g) => (
            <Link
              key={g.id}
              href={`/games/${g.slug}`}
              className="block rounded-lg border border-white/10 bg-card/40 p-3 text-left transition-colors hover:border-white/20 hover:bg-card/70"
            >
              <div className="font-mono text-xs font-semibold text-foreground">
                {g.title}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {g.category} game
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function ControlRow({ keys, action }: { keys: string; action: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
      <span className="text-xs text-muted-foreground">{action}</span>
      <div className="flex items-center gap-1">
        {keys.split(" ").map((k, i) => (
          <kbd
            key={`${k}-${i}`}
            className="min-w-[28px] rounded-md border border-white/15 bg-white/5 px-2 py-1 text-center font-mono text-[11px] font-semibold text-foreground shadow-[0_2px_0_0_rgba(255,255,255,0.08)]"
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}

function GameFrame({
  game,
  containerRef,
  iframeRef,
  onFullscreenChange,
  isFullscreen,
}: {
  game: Game;
  containerRef: React.RefObject<HTMLDivElement | null>;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  onFullscreenChange: () => void;
  isFullscreen: boolean;
}) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Track native fullscreen changes (Esc key, etc.) so our button stays in sync.
  useEffect(() => {
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [onFullscreenChange]);

  const reloadIframe = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    // Re-assigning src forces a clean reload without caching tricks.
    const currentSrc = iframe.src;
    iframe.src = "about:blank";
    setIframeLoaded(false);
    requestAnimationFrame(() => {
      iframe.src = currentSrc;
    });
  }, [iframeRef]);

  // Expose reload to the parent via a ref-style callback.
  // We use a ref so the parent's "Restart" button can trigger it.
  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as HTMLDivElement & {
        __reloadIframe?: () => void;
      }).__reloadIframe = reloadIframe;
    }
  }, [reloadIframe, containerRef]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-black",
        // Default theater look: 16:9 with neon border + rounded corners
        !isFullscreen &&
          "aspect-video w-full rounded-2xl border shadow-2xl",
        // When fullscreen: strip ALL chrome so the canvas fills every pixel
        isFullscreen && "h-screen w-screen rounded-none border-0",
        accentBorderMap[game.accent],
      )}
      style={{ backgroundColor: "#000" }}
    >
      {/* Loading overlay */}
      {!iframeLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-white/10 border-t-neon-cyan" />
            <div className="absolute inset-2 flex items-center justify-center">
              <Gamepad2 className="h-4 w-4 text-neon-cyan" />
            </div>
          </div>
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Loading {game.title}…
          </div>
        </div>
      )}

      {/* Scanline overlay for arcade vibe (non-interactive) */}
      <div className="scanline pointer-events-none absolute inset-0 z-[5]" />

      <iframe
        ref={iframeRef}
        src={game.sourceUrl}
        title={game.title}
        onLoad={() => setIframeLoaded(true)}
        className="absolute inset-0 h-full w-full border-0"
        allow="autoplay; fullscreen; gamepad; pointer-lock; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-forms"
        allowFullScreen
      />

      {/* Corner brackets — arcade HUD frame */}
      <div className="pointer-events-none absolute left-3 top-3 z-20 h-6 w-6 border-l-2 border-t-2 border-neon-cyan/40" />
      <div className="pointer-events-none absolute right-3 top-3 z-20 h-6 w-6 border-r-2 border-t-2 border-neon-cyan/40" />
      <div className="pointer-events-none absolute bottom-3 left-3 z-20 h-6 w-6 border-b-2 border-l-2 border-neon-cyan/40" />
      <div className="pointer-events-none absolute bottom-3 right-3 z-20 h-6 w-6 border-b-2 border-r-2 border-neon-cyan/40" />
    </div>
  );
}

/**
 * Launcher panel shown for `openInNewTab` games (e.g. Eaglercraft). Instead
 * of embedding the game in a portal iframe — which would cause Esc-key
 * conflicts between the browser's Esc-to-exit-fullscreen, the portal's
 * Ctrl+Esc shortcut, and the game's own Esc-to-open-menu — we render a
 * prominent "Launch in new tab" call-to-action. Clicking it opens the
 * game's sourceUrl in a brand-new browser tab, giving the game its own
 * clean window with no keyboard conflicts.
 */
function NewTabLauncher({ game }: { game: Game }) {
  const accentText = accentTextMap[game.accent];
  const accentBorder = accentBorderMap[game.accent];
  const accentBg = accentBgMap[game.accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-2xl border bg-black px-6 text-center shadow-2xl",
        accentBorder,
      )}
      style={{ backgroundColor: "#07090f" }}
    >
      {/* Background grid + radial glow for visual interest */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />

      {/* Animated launch icon */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border",
          accentBorder,
          accentBg,
        )}
      >
        <ExternalLink className={cn("h-9 w-9", accentText)} />
        {/* Pulsing ring */}
        <motion.span
          className={cn(
            "absolute inset-0 rounded-2xl border",
            accentBorder,
          )}
          animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="relative font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl"
      >
        Opens in a new tab
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.4 }}
        className="relative mt-2 max-w-md text-sm leading-relaxed text-muted-foreground"
      >
        This game runs in its own browser tab so its keyboard shortcuts (like
        Esc for the in-game menu) don't clash with the portal's fullscreen
        controls. Your progress saves to the browser, so it'll be there next
        time you launch.
      </motion.p>

      <motion.a
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36, duration: 0.4 }}
        href={game.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "relative mt-6 inline-flex items-center gap-2 rounded-lg border px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5",
          accentBorder,
          accentBg,
          accentText,
          "hover:bg-white/10",
        )}
      >
        <ExternalLink className="h-4 w-4" />
        Launch {game.title} in new tab
      </motion.a>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="relative mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-neon-green" />
        Pop-up blocker tip: allow pop-ups for this site if nothing opens
      </motion.div>

      {/* Corner brackets — same arcade HUD frame as the iframe theater */}
      <div className="pointer-events-none absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-neon-cyan/40" />
      <div className="pointer-events-none absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-neon-cyan/40" />
      <div className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-neon-cyan/40" />
      <div className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-neon-cyan/40" />
    </motion.div>
  );
}

export default function GamePlayerPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const game = useMemo(() => getGameBySlug(slug), [slug]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(Boolean(document.fullscreenElement));
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      // Some browsers throw if the element isn't in the DOM yet or the
      // user gesture was lost — surface a console warning rather than crashing.
      console.warn("Fullscreen toggle failed:", err);
    }
  }, []);

  const reloadIframe = useCallback(() => {
    const el = containerRef.current as
      | (HTMLDivElement & { __reloadIframe?: () => void })
      | null;
    el?.__reloadIframe?.();
  }, []);

  // Exit fullscreen via Ctrl+Esc — Esc alone is reserved for in-game input
  // (pause menus, pointer release, inventory close, etc.), so we add an
  // explicit chord shortcut to leave fullscreen without conflicting.
  // Note: the browser's own Esc-to-exit-fullscreen behavior cannot be
  // disabled from JavaScript; this shortcut is an *additional* documented
  // way out for users who want to keep Esc reserved for the game.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === "Escape" && document.fullscreenElement) {
        e.preventDefault();
        document.exitFullscreen().catch((err) => {
          console.warn("Ctrl+Esc exit fullscreen failed:", err);
        });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!game) {
    return <NotFoundState slug={slug} />;
  }

  return (
    <div className="relative min-h-screen bg-grid">
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />

      <div className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        {/* Top bar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-card/40 px-3 font-mono text-xs text-foreground transition-colors hover:border-white/20 hover:bg-card/70"
            >
              <ArrowLeft className="h-4 w-4" /> Arcade
            </Link>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-muted-foreground/40">/</span>
              <span className="font-mono text-xs text-muted-foreground">
                Games
              </span>
              <span className="text-muted-foreground/40">/</span>
              <span className="font-mono text-xs text-foreground">{game.slug}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {game.openInNewTab ? (
              // For new-tab games: no iframe to restart, no fullscreen to toggle.
              // Show a single prominent "Launch in new tab" button.
              <a
                href={game.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-lg border px-4 font-mono text-xs transition-all hover:-translate-y-0.5",
                  accentBgMap[game.accent],
                  accentBorderMap[game.accent],
                  accentTextMap[game.accent],
                  "hover:bg-white/10",
                )}
              >
                <ExternalLink className="h-3.5 w-3.5" /> Launch in new tab
              </a>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={reloadIframe}
                  className="gap-2 rounded-lg border-white/10 bg-card/40 font-mono text-xs hover:bg-card/70"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Restart
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Exit fullscreen (Ctrl+Esc)" : "Enter fullscreen"}
                  className={cn(
                    "gap-2 rounded-lg font-mono text-xs",
                    accentBgMap[game.accent],
                    accentBorderMap[game.accent],
                    accentTextMap[game.accent],
                    "border hover:bg-white/10",
                  )}
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="h-3.5 w-3.5" /> Exit Fullscreen
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Title strip */}
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border",
                accentBorderMap[game.accent],
                accentBgMap[game.accent],
              )}
            >
              <Gamepad2 className={cn("h-6 w-6", accentTextMap[game.accent])} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {game.title}
                </h1>
                {game.trending && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-neon-green/30 bg-neon-green/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neon-green">
                    <Flame className="h-3 w-3" /> Trending
                  </span>
                )}
              </div>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {game.category} · {game.tags.join(" · ")}
              </p>
            </div>
          </div>
        </div>

        {/* Requirements banners (e.g. skin-import warnings) — shown above the canvas */}
        {game.requirements && game.requirements.length > 0 && (
          <div className="mb-2 space-y-3">
            {game.requirements.map((req, idx) => (
              <RequirementBanner key={`${req.title}-${idx}`} requirement={req} />
            ))}
          </div>
        )}

        {/* Game canvas — the theater (or new-tab launcher for openInNewTab games) */}
        {game.openInNewTab ? (
          <NewTabLauncher game={game} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <GameFrame
              key={game.slug}
              game={game}
              containerRef={containerRef}
              iframeRef={iframeRef}
              onFullscreenChange={handleFullscreenChange}
              isFullscreen={isFullscreen}
            />
          </motion.div>
        )}

        {/* Below-canvas info grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Description */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-white/10 bg-card/40 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-neon-cyan" />
                <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-foreground">
                  About this game
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {game.longDescription}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-card/40 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-neon-magenta" />
                <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-foreground">
                  Tags
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {game.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-white/10 bg-white/5 font-mono text-[11px] text-foreground/80"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Controls + meta */}
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-card/40 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-neon-yellow" />
                <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-foreground">
                  Controls
                </h2>
              </div>
              <div className="space-y-2">
                {game.controls.map((ctrl) => (
                  <ControlRow
                    key={ctrl.action}
                    keys={ctrl.keys}
                    action={ctrl.action}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-card/40 p-5">
              <div className="mb-3 flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-neon-green" />
                <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-foreground">
                  Game Source
                </h2>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                This game runs from a self-contained HTML bundle loaded inside a
                sandboxed iframe.
              </p>
              <div className="mt-2 break-all rounded-md border border-white/10 bg-background/60 px-3 py-2 font-mono text-[11px] text-foreground/80">
                {game.sourceUrl}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 font-mono">
            <Link
              href="/"
              className="text-neon-cyan underline-offset-2 hover:underline"
            >
              ARCADE.OS
            </Link>
            <span className="text-muted-foreground/60">·</span>
            <span>{game.title}</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
            {game.openInNewTab ? (
              <>Runs in a dedicated browser tab · Esc works normally for the in-game menu</>
            ) : (
              <>Click Fullscreen for the best experience · Exit with <kbd className="rounded border border-white/15 bg-white/5 px-1 font-mono">Ctrl</kbd>+<kbd className="rounded border border-white/15 bg-white/5 px-1 font-mono">Esc</kbd> (Esc stays a game input)</>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
