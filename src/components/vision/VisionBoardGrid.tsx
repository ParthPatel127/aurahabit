"use client";

import { useState, useEffect } from "react";
import { Sparkles, Plus, Trash2, Image as ImageIcon, Heart } from "lucide-react";

interface VisionItem {
  id: string;
  title: string;
  imageUrl: string;
  category?: string;
  motivationalStatement?: string;
  targetDate?: string;
}

export function VisionBoardGrid() {
  const [items, setItems] = useState<VisionItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [motivationalStatement, setMotivationalStatement] = useState("");
  const [category, setCategory] = useState("Life");
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/vision-board");
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    setLoading(true);
    try {
      await fetch("/api/vision-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, imageUrl, category, motivationalStatement }),
      });

      setTitle("");
      setImageUrl("");
      setMotivationalStatement("");
      setIsModalOpen(false);
      fetchItems();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Remove this vision item?")) return;
    try {
      await fetch(`/api/vision-board?id=${id}`, { method: "DELETE" });
      fetchItems();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-amber-500/5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            My Dream Vision Board
          </h2>
          <p className="text-xs text-slate-500">Visualize your life goals, inspirational quotes & dream outcomes</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Vision Card
        </button>
      </div>

      {/* Vision Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-16 glass-card text-slate-400 text-sm">
            Your Vision Board is empty. Click "+ Add Vision Card" to pin your dream goals & aspirations!
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="glass-card overflow-hidden group border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 shadow-md flex flex-col justify-between"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback placeholder image on load error
                    (e.target as HTMLElement).setAttribute("src", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80");
                  }}
                />
                <button
                  onClick={() => deleteItem(item.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white uppercase tracking-wider">
                  {item.category || "Life"}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{item.title}</h3>
                {item.motivationalStatement && (
                  <p className="text-xs text-purple-700 dark:text-purple-300 italic mt-2 font-medium">
                    "{item.motivationalStatement}"
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Add Vision Card</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build $1M SaaS, Visit Japan, Buy Dream House..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Motivational Statement</label>
                <input
                  type="text"
                  placeholder="e.g. Relentless execution leads to success!"
                  value={motivationalStatement}
                  onChange={(e) => setMotivationalStatement(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-500">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl">Save Card</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
