"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Gamepad2,
  Boxes,
  Flame,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Joystick,
  Trophy,
  LayoutGrid,
} from "lucide-react";
import { games, sidebarCategories, type Game, type GameCategory } from "@/data/games";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CategoryId = "all" | "2d" | "3d" | "trending";

const categoryMeta: Record<
  CategoryId,
  { label: string; icon: React.ElementType; accent: string }
> = {
  all: { label: "All Games", icon: LayoutGrid, accent: "text-neon-cyan" },
  "2d": { label: "2D Games", icon: Gamepad2, accent: "text-neon-yellow" },
  "3d": { label: "3D Games", icon: Boxes, accent: "text-neon-magenta" },
  trending: { label: "Trending", icon: Flame, accent: "text-neon-green" },
};

const accentRingMap: Record<Game["accent"], string> = {
  cyan: "group-hover:border-neon-cyan/60 group-hover:shadow-neon-cyan",
  magenta: "group-hover:border-neon-magenta/60 group-hover:shadow-neon-magenta",
  yellow:
    "group-hover:border-neon-yellow/60 group-hover:[box-shadow:0_0_18px_-2px_rgba(250,204,21,0.6)]",
  purple:
    "group-hover:border-neon-purple/60 group-hover:[box-shadow:0_0_18px_-2px_rgba(168,85,247,0.6)]",
};

const accentBadgeMap: Record<GameCategory, string> = {
  "2D": "bg-neon-yellow/15 text-neon-yellow border-neon-yellow/30",
  "3D": "bg-neon-magenta/15 text-neon-magenta border-neon-magenta/30",
};

const accentChipMap: Record<Game["accent"], string> = {
  cyan: "bg-neon-cyan",
  magenta: "bg-neon-magenta",
  yellow: "bg-neon-yellow",
  purple: "bg-neon-purple",
};

function GameCard({ game, index }: { game: Game; index: number }) {
  // Shared class string for the outer card wrapper — identical for both
  // in-portal links and opens-in-new-tab links.
  const cardClassName = cn(
    "group relative block h-full overflow-hidden rounded-xl border border-white/10 bg-card/60 backdrop-blur transition-all duration-300",
    "hover:-translate-y-1 hover:bg-card/80",
    accentRingMap[game.accent],
  );

  // Shared inner content — identical layout for both card types. Only the
  // outer wrapper element differs (Next.js <Link> vs plain <a target="_blank">).
  const cardInner = (
    <>
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <img
          src={game.thumbnail}
          alt={`${game.title} thumbnail`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />

        {/* Category badge */}
        <div className="absolute left-3 top-3">
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur",
              accentBadgeMap[game.category],
            )}
          >
            {game.category}
          </span>
        </div>

        {/* Trending flame */}
        {game.trending && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md border border-neon-green/30 bg-neon-green/15 px-2 py-0.5 backdrop-blur">
            <Flame className="h-3 w-3 text-neon-green" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neon-green">
              Hot
            </span>
          </div>
        )}

        {/* "Opens in new tab" badge — only for openInNewTab games */}
        {game.openInNewTab && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md border border-white/20 bg-background/70 px-2 py-0.5 backdrop-blur">
            <ExternalLink className="h-3 w-3 text-foreground/80" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/80">
              New Tab
            </span>
          </div>
        )}

        {/* Play overlay — the icon fades in directly (no parent opacity
            transition) so backdrop-blur on the icon itself interpolates
            cleanly instead of snapping once the fade completes. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "flex h-14 w-14 scale-90 items-center justify-center rounded-full border opacity-0 backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100",
              game.accent === "cyan" && "border-neon-cyan/60 bg-neon-cyan/10",
              game.accent === "magenta" &&
                "border-neon-magenta/60 bg-neon-magenta/10",
              game.accent === "yellow" &&
                "border-neon-yellow/60 bg-neon-yellow/10",
              game.accent === "purple" &&
                "border-neon-purple/60 bg-neon-purple/10",
            )}
          >
            {game.openInNewTab ? (
              <ExternalLink
                className={cn(
                  "h-6 w-6",
                  game.accent === "cyan" && "text-neon-cyan",
                  game.accent === "magenta" && "text-neon-magenta",
                  game.accent === "yellow" && "text-neon-yellow",
                  game.accent === "purple" && "text-neon-purple",
                )}
              />
            ) : (
              <Joystick
                className={cn(
                  "h-6 w-6",
                  game.accent === "cyan" && "text-neon-cyan",
                  game.accent === "magenta" && "text-neon-magenta",
                  game.accent === "yellow" && "text-neon-yellow",
                  game.accent === "purple" && "text-neon-purple",
                )}
              />
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-2 p-4">
        <div className="flex items-center gap-2">
          <span
            className={cn("h-1.5 w-1.5 rounded-full", accentChipMap[game.accent])}
          />
          <h3 className="font-mono text-sm font-semibold text-foreground">
            {game.title}
          </h3>
        </div>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {game.description}
        </p>
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-wrap gap-1">
            {game.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
          <span className="flex items-center gap-1 font-mono text-[11px] text-foreground/70 transition-colors group-hover:text-foreground">
            {game.openInNewTab ? (
              <>
                Open <ExternalLink className="h-3 w-3" />
              </>
            ) : (
              <>
                Play <ArrowRight className="h-3 w-3" />
              </>
            )}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{
        // Layout (position) transitions: smooth glide, slightly longer for elegance
        layout: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
        // Entrance/exit transitions: soft fade + settle
        default: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      {game.openInNewTab ? (
        // Opens the game directly in a brand-new browser tab. We use a plain
        // <a> instead of Next.js <Link> because we're navigating to a static
        // asset URL (the game's sourceUrl), not a portal route.
        <a
          href={game.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cardClassName}
        >
          {cardInner}
        </a>
      ) : (
        <Link href={`/games/${game.slug}`} className={cardClassName}>
          {cardInner}
        </Link>
      )}
    </motion.div>
  );
}

function SidebarButton({
  id,
  label,
  icon: Icon,
  accent,
  count,
  active,
  onClick,
}: {
  id: CategoryId;
  label: string;
  icon: React.ElementType;
  accent: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all",
        active
          ? "bg-white/10 text-foreground"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md border transition-all",
          active
            ? "border-white/20 bg-white/10"
            : "border-white/5 bg-transparent group-hover:border-white/10",
        )}
      >
        <Icon className={cn("h-4 w-4", active ? accent : "text-muted-foreground")} />
      </span>
      <span className="flex-1 font-medium">{label}</span>
      <span
        className={cn(
          "rounded-md px-1.5 py-0.5 font-mono text-[10px]",
          active ? "bg-white/10 text-foreground" : "bg-white/5 text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [query, setQuery] = useState("");

  const filteredGames = useMemo(() => {
    const categoryFilter =
      sidebarCategories.find((c) => c.id === activeCategory)?.filter() ?? games;
    if (!query.trim()) return categoryFilter;
    const q = query.trim().toLowerCase();
    return categoryFilter.filter((g) => {
      const haystack = [
        g.title,
        g.description,
        g.category,
        ...g.tags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [activeCategory, query]);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const totalGames = games.length;
  const trendingCount = games.filter((g) => g.trending).length;
  const twoDCount = games.filter((g) => g.category === "2D").length;
  const threeDCount = games.filter((g) => g.category === "3D").length;

  const sidebarItems: {
    id: CategoryId;
    label: string;
    icon: React.ElementType;
    accent: string;
    count: number;
  }[] = [
    {
      id: "all",
      label: "All Games",
      icon: LayoutGrid,
      accent: "text-neon-cyan",
      count: totalGames,
    },
    {
      id: "2d",
      label: "2D Games",
      icon: Gamepad2,
      accent: "text-neon-yellow",
      count: twoDCount,
    },
    {
      id: "3d",
      label: "3D Games",
      icon: Boxes,
      accent: "text-neon-magenta",
      count: threeDCount,
    },
    {
      id: "trending",
      label: "Trending",
      icon: Flame,
      accent: "text-neon-green",
      count: trendingCount,
    },
  ];

  return (
    <div className="relative min-h-screen bg-grid">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />

      <div className="relative flex min-h-screen flex-col lg:flex-row">
        {/* ====== Sidebar ====== */}
        <aside className="sticky top-0 z-20 hidden h-screen w-64 shrink-0 border-r border-white/5 bg-background/80 backdrop-blur lg:flex lg:flex-col">
          <div className="flex items-center gap-2 border-b border-white/5 px-6 py-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neon-cyan/40 bg-neon-cyan/10">
              <Trophy className="h-5 w-5 text-neon-cyan" />
            </div>
            <div className="leading-tight">
              <div className="font-mono text-sm font-bold tracking-tight text-foreground">
                ARCADE<span className="text-neon-cyan">.OS</span>
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Indie Portal
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
            <div className="px-3 pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
              Categories
            </div>
            {sidebarItems.map((item) => (
              <SidebarButton
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                accent={item.accent}
                count={item.count}
                active={activeCategory === item.id}
                onClick={() => setActiveCategory(item.id)}
              />
            ))}

            <div className="px-3 pb-2 pt-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
              Stats
            </div>
            <div className="space-y-2 px-3">
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-neon-yellow" />
                  Total Games
                </span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {totalGames}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Flame className="h-3.5 w-3.5 text-neon-green" />
                  Trending Now
                </span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {trendingCount}
                </span>
              </div>
            </div>
          </nav>

          <div className="border-t border-white/5 p-4">
            <div className="rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 p-3">
              <div className="flex items-center gap-2">
                <Joystick className="h-4 w-4 text-neon-cyan" />
                <span className="font-mono text-xs font-semibold text-neon-cyan">
                  Pro Tip
                </span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                Click any card to launch the game in our fullscreen arcade theater.
              </p>
            </div>
          </div>
        </aside>

        {/* ====== Main ====== */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {/* Mobile top bar */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neon-cyan/40 bg-neon-cyan/10">
                <Trophy className="h-4 w-4 text-neon-cyan" />
              </div>
              <span className="font-mono text-sm font-bold">
                ARCADE<span className="text-neon-cyan">.OS</span>
              </span>
            </div>
          </div>

          {/* Hero */}
          <section className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-card/80 via-card/40 to-background/60 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-mono text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Play. Compete. <span className="text-neon-cyan text-glow-cyan">Repeat.</span>
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  A curated portal of custom-built 2D & 3D HTML5 games. Zero installs,
                  zero downloads — pick a title and jump straight into the action.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-white/10 bg-background/60 px-4 py-3 text-center backdrop-blur">
                  <div className="font-mono text-2xl font-bold text-neon-magenta">
                    {totalGames}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Games Live
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Search bar */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title, tag, or category..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-11 rounded-lg border-white/10 bg-card/60 pl-10 pr-10 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-neon-cyan/60 focus-visible:ring-neon-cyan/20"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mobile category chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin lg:hidden">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveCategory(item.id)}
                  className={cn(
                    "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs transition-colors",
                    activeCategory === item.id
                      ? "border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan"
                      : "border-white/10 bg-card/40 text-muted-foreground",
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section heading */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-lg font-semibold text-foreground">
                {categoryMeta[activeCategory].label}
              </h2>
              <Badge variant="outline" className="border-white/10 font-mono text-[10px]">
                {filteredGames.length}
              </Badge>
            </div>
          </div>

          {/* Grid */}
          {filteredGames.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredGames.map((game, idx) => (
                  <GameCard key={game.id} game={game} index={idx} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-card/30 px-6 py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-mono text-sm font-semibold text-foreground">
                No games match your search
              </h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Try a different keyword, or{" "}
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveCategory("all");
                  }}
                  className="text-neon-cyan underline-offset-2 hover:underline"
                >
                  reset filters
                </button>
                .
              </p>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-neon-cyan">ARCADE.OS</span>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
              © {new Date().getFullYear()} · Indie Games Portal
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
