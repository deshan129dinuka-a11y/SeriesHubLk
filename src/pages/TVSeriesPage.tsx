import React, { useState, useEffect } from "react";
import { Tv, Search, Star, RefreshCcw } from "lucide-react";
import { TVSeries } from "../types";
import { api } from "../api";
import { SeriesCard } from "../components/SeriesCard";

interface TVSeriesPageProps {
  onSelectSeries: (series: TVSeries) => void;
}

const SERIES_GENRES = [
  "සියල්ල (All)",
  "Drama",
  "Action",
  "Sci-Fi",
  "Fantasy",
  "Crime",
  "Mystery",
  "Comedy",
  "Animation",
];

export const TVSeriesPage: React.FC<TVSeriesPageProps> = ({ onSelectSeries }) => {
  const [seriesList, setSeriesList] = useState<TVSeries[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("සියල්ල (All)");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchSeries() {
      try {
        setLoading(true);
        const genreParam = selectedGenre.includes("සියල්ල") ? undefined : selectedGenre;
        const res = await api.getTVSeries({
          publishedOnly: true,
          genre: genreParam,
          search: searchQuery.trim() || undefined,
          limit: 30,
        });
        setSeriesList(res.series || []);
      } catch (err) {
        console.error("Failed to load series:", err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchSeries();
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedGenre, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="space-y-2 border-b border-neutral-800 pb-6">
        <div className="flex items-center gap-2">
          <Tv className="w-6 h-6 text-sky-400" />
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
            TV SERIES HUB
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          ටීවී සීරීස් නාමාවලිය (TV Series)
        </h1>
        <p className="text-sm text-neutral-400 max-w-2xl">
          ලොව ඉහළම IMDb අගයක් හිමි ජනප්‍රිය කතා මාලා (Seasons & Episodes) සිංහල උපසිරැසි සමඟ සම්පූර්ණයෙන්ම නොමිලේ.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ටීවී සීරීස් නම හෝ IMDb ID සොයන්න..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-sky-500/60"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {SERIES_GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedGenre === g
                    ? "bg-sky-500 text-black font-bold shadow-md shadow-sky-500/20"
                    : "bg-neutral-950 text-neutral-300 hover:bg-neutral-800 border border-neutral-800"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Series Grid */}
      {loading ? (
        <div className="py-20 text-center text-neutral-400 space-y-3">
          <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium">ටීවී සීරීස් පූරණය වෙමින් පවතී...</p>
        </div>
      ) : seriesList.length === 0 ? (
        <div className="py-16 text-center bg-neutral-900/60 rounded-2xl border border-neutral-800 p-8 space-y-3">
          <Tv className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">ටීවී සීරීස් හමු නොවීය.</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            ඔබ සෙවූ නමට අදාළ කතා මාලා සොයාගත නොහැක. කරුණාකර වෙනත් නමකින් සොයන්න.
          </p>
          <button
            onClick={() => {
              setSelectedGenre("සියල්ල (All)");
              setSearchQuery("");
            }}
            className="px-4 py-2 bg-sky-500 text-black font-bold text-xs rounded-xl hover:bg-sky-400 flex items-center gap-1.5 mx-auto mt-2"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>නැවත සකසන්න</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
            <span>ටීවී සීරීස් <strong>{seriesList.length}</strong> ක් හමුවිය</span>
            <span>සිංහල උපසිරැසි සහිතයි</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {seriesList.map((series) => (
              <SeriesCard
                key={series.id}
                series={series}
                onClick={() => onSelectSeries(series)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
