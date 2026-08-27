"use client";

import { useEffect, useState } from "react";
import { Sparkles, BookOpen, ChevronLeft, ChevronRight, Dices, Calendar, X, Lightbulb, Quote } from "lucide-react";

interface GitaVerseData {
  id: string;
  chapterNumber: number;
  verseNumber: number;
  sanskritText: string;
  englishTranslation: string;
  explanation?: string;
}

export function GitaModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
    if (isOpen) {
      fetchVerseOfToday();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-xl shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in duration-150">
        <Quote className="absolute -right-6 -bottom-6 w-44 h-44 text-amber-500/10 pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Bhagavad Gita Daily Wisdom</span>
        </div>

        {loading ? (
          <div className="py-12 animate-pulse space-y-3">
            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-16 w-full bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ) : verse ? (
          <div>
            <div className="flex items-center justify-between mt-2 mb-4">
              <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                Chapter {verse.chapterNumber} • Verse {verse.verseNumber}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => navigateVerse("prev")}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1"
                  title="Previous Verse"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>

                <button
                  onClick={fetchRandomVerse}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-1"
                  title="Random Verse"
                >
                  <Dices className="w-3.5 h-3.5" />
                  Random
                </button>

                <button
                  onClick={() => navigateVerse("next")}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1"
                  title="Next Verse"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {isCustomView && (
                  <button
                    onClick={fetchVerseOfToday}
                    className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1"
                    title="Verse of Today"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Today
                  </button>
                )}
              </div>
            </div>

            {/* Devanagari Sanskrit Verse */}
            <p className="text-xl font-serif font-bold text-amber-950 dark:text-amber-100 leading-relaxed mb-4">
              "{verse.sanskritText}"
            </p>

            {/* English Translation */}
            <p className="text-sm text-slate-800 dark:text-slate-200 italic font-medium leading-relaxed mb-4">
              {verse.englishTranslation}
            </p>

            {/* Practical Mindset Explanation */}
            {verse.explanation && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] text-amber-600 dark:text-amber-400 block mb-0.5">
                    Practical Mindset Insight
                  </span>
                  {verse.explanation}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
