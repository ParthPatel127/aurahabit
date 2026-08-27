import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDayOfYear } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");
    const currentId = searchParams.get("currentId");
    const direction = searchParams.get("direction");

    const allVerses = await prisma.gitaVerse.findMany({
      orderBy: [{ chapterNumber: "asc" }, { verseNumber: "asc" }],
    });

    if (allVerses.length === 0) {
      // Fallback if GitaVerse table is being populated
      const fallbackQuote = await prisma.quote.findFirst();
      if (fallbackQuote) {
        return NextResponse.json({
          id: fallbackQuote.id,
          chapterNumber: fallbackQuote.chapter,
          verseNumber: fallbackQuote.verse,
          sanskritText: fallbackQuote.sanskritVerse,
          englishTranslation: fallbackQuote.englishTranslation,
          explanation: fallbackQuote.explanation,
        });
      }
      return NextResponse.json({ error: "No verses found" }, { status: 404 });
    }

    // Mode 1: Random Verse
    if (mode === "random") {
      const randomIndex = Math.floor(Math.random() * allVerses.length);
      return NextResponse.json(allVerses[randomIndex]);
    }

    // Mode 2: Next / Previous Navigation
    if (mode === "nav" && currentId) {
      const currentIndex = allVerses.findIndex((v) => v.id === currentId);
      if (currentIndex !== -1) {
        let targetIndex = currentIndex;
        if (direction === "next") {
          targetIndex = (currentIndex + 1) % allVerses.length;
        } else if (direction === "prev") {
          targetIndex = (currentIndex - 1 + allVerses.length) % allVerses.length;
        }
        return NextResponse.json(allVerses[targetIndex]);
      }
    }

    // Mode 3: Verse of the Day (based on calendar day of year)
    const day = getDayOfYear();
    const verseIndex = (day - 1) % allVerses.length;
    return NextResponse.json(allVerses[verseIndex]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
