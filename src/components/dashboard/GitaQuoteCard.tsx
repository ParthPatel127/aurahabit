"use client";

import { useEffect, useState } from "react";
import { Sparkles, Quote as QuoteIcon, BookOpen, ChevronLeft, ChevronRight, Dices, Calendar } from "lucide-react";

interface GitaVerseData {
  id: string;
  chapterNumber: number;
  verseNumber: number;
  sanskritText: string;
  englishTranslation: string;
  explanation?: string;
}

export function GitaQuoteCard() {
  const [verse, setVerse] = useState<GitaVerseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCustomView, setIsCustomView] = useState(false);

  const fetchVerseOfToday = () => {
    setLoading(true);
    fetch("/api/quotes/daily")
      .then((res) => res.json())
      .then((data) => {
        setVerse(data);
        setIsCustomView(false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchRandomVerse = () => {
    setLoading(true);
    fetch("/api/quotes/daily?mode=random")
      .then((res) => res.json())
      .then((data) => {
        setVerse(data);
        setIsCustomView(true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const navigateVerse = (dir: "next" | "prev") => {
    if (!verse) return;
    setLoading(true);
    fetch(`/api/quotes/daily?mode=nav&currentId=${verse.id}&direction=${dir}`)
      .then((res) => res.json())
      .then((data) => {
        setVerse(data);
        setIsCustomView(true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchVerseOfToday();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse flex flex-col gap-3">
        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
      </div>
    );
  }

  if (!verse) return null;

  return (
    <div className="glass-card p-6 relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-teal-500/10 border-amber-500/20 shadow-md">
      {/* Background Watermark Icon */}
      <QuoteIcon className="absolute -right-4 -bottom-4 w-36 h-36 text-amber-500/10 pointer-events-none" />

      {/* Card Top Title & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Bhagavad Gita Daily Inspiration</span>
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-500" />
            Chapter {verse.chapterNumber} • Verse {verse.verseNumber}
          </h3>
        </div>

        {/* Verse Controls: Previous, Random, Next, Today */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigateVerse("prev")}
            className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold flex items-center gap-1 transition-all"
            title="Previous Verse"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <button
            onClick={fetchRandomVerse}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-1 transition-all"
            title="Random Verse"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Random</span>
          </button>

          <button
            onClick={() => navigateVerse("next")}
            className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold flex items-center gap-1 transition-all"
            title="Next Verse"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {isCustomView && (
            <button
              onClick={fetchVerseOfToday}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 transition-all"
              title="Return to Today's Verse"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Today</span>
            </button>
          )}
        </div>
      </div>

      {/* Sanskrit Verse Unicode Text */}
      <p className="text-lg md:text-xl font-serif font-bold text-amber-950 dark:text-amber-100 leading-relaxed mb-3">
        "{verse.sanskritText}"
      </p>

      {/* English Translation */}
      <p className="text-sm text-slate-800 dark:text-slate-200 italic font-medium leading-relaxed">
        {verse.englishTranslation}
      </p>
    </div>
  );
}
