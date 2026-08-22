import React, { useState, useEffect, useRef } from "react";
import { Search, X, Film, Tv, Star, Subtitles, ArrowRight, Loader2 } from "lucide-react";
import { Movie, TVSeries } from "../types";
import { api } from "../api";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (movie: Movie) => void;
  onSelectSeries: (series: TVSeries) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectMovie,
  onSelectSeries,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "movie" | "series">("all");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<TVSeries[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Live search query
  useEffect(() => {
    if (!searchTerm.trim()) {
      setMovies([]);
      setSeries([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [mRes, sRes] = await Promise.all([
          api.getMovies({ search: searchTerm, limit: 8, publishedOnly: true }),
          api.getTVSeries({ search: searchTerm, limit: 8, publishedOnly: true }),
        ]);
        setMovies(mRes.movies || []);
        setSeries(sRes.series || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  const filteredMovies = filterType === "series" ? [] : movies;
  const filteredSeries = filterType === "movie" ? [] : series;
  const totalResults = filteredMovies.length + filteredSeries.length;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 md:p-12 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center gap-3 bg-neutral-950/70">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="චිත්‍රපට හෝ ටීවී සීරීස් සොයන්න... (නම, වර්ෂය, ප්‍රභේදය, IMDb ID)"
            className="w-full bg-transparent text-white placeholder-neutral-500 text-sm sm:text-base font-medium focus:outline-none"
          />
          {loading && <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg border border-neutral-700"
          >
            ESC
          </button>
        </div>

        {/* Filter Type Pills */}
        <div className="px-4 py-2.5 bg-neutral-950/40 border-b border-neutral-800/80 flex items-center gap-2 text-xs">
          <span className="text-neutral-400 mr-1">පෙරහන:</span>
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              filterType === "all"
                ? "bg-amber-500 text-black font-bold"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            සියල්ල ({movies.length + series.length})
          </button>
          <button
            onClick={() => setFilterType("movie")}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
              filterType === "movie"
                ? "bg-amber-500 text-black font-bold"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>චිත්‍රපට ({movies.length})</span>
          </button>
          <button
            onClick={() => setFilterType("series")}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
              filterType === "series"
                ? "bg-amber-500 text-black font-bold"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>ටීවී සීරීස් ({series.length})</span>
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 divide-y divide-neutral-800/60">
          {searchTerm.trim() === "" ? (
            <div className="py-12 text-center text-neutral-500 space-y-2">
              <Search className="w-10 h-10 mx-auto text-neutral-600" />
              <p className="text-sm">චිත්‍රපටයේ හෝ ටීවී සීරීස් එකේ නම ටයිප් කරන්න...</p>
              <p className="text-xs text-neutral-600">උදාහරණ: Avengers, Game of Thrones, Breaking Bad, tt0848228</p>
            </div>
          ) : totalResults === 0 && !loading ? (
            <div className="py-12 text-center text-neutral-400 space-y-2">
              <p className="text-base font-semibold">චිත්‍රපට හෝ ටීවී සීරීස් සොයාගත නොහැක.</p>
              <p className="text-xs text-neutral-500">වෙනත් නමකින් හෝ IMDb ID එකකින් නැවත සොයා බලන්න.</p>
            </div>
          ) : (
            <>
              {/* Movies Section */}
              {filteredMovies.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5" />
                    <span>චිත්‍රපට (Movies)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredMovies.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          onSelectMovie(m);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-neutral-950/60 hover:bg-neutral-800 border border-neutral-800/80 hover:border-amber-500/50 flex items-center gap-3 cursor-pointer transition-all group"
                      >
                        <img
                          src={m.posterUrl || "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg"}
                          alt={m.title}
                          className="w-12 h-16 object-cover rounded-lg shrink-0 bg-neutral-900"
                        />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h5 className="font-bold text-white text-sm truncate group-hover:text-amber-400">
                            {m.title}
                          </h5>
                          <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <span>{m.year}</span>
                            <span>•</span>
                            <span className="text-amber-400 flex items-center gap-0.5 font-semibold">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {m.rating || "N/A"}
                            </span>
                          </div>
                          {m.hasSinhalaSub && (
                            <span className="inline-block text-[10px] text-emerald-400 font-semibold">
                              සිංහල උපසිරැසි ඇත
                            </span>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Series Section */}
              {filteredSeries.length > 0 && (
                <div className="space-y-2 pt-4">
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5" />
                    <span>ටීවී සීරීස් (TV Series)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredSeries.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onSelectSeries(s);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-neutral-950/60 hover:bg-neutral-800 border border-neutral-800/80 hover:border-sky-500/50 flex items-center gap-3 cursor-pointer transition-all group"
                      >
                        <img
                          src={s.posterUrl || "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg"}
                          alt={s.title}
                          className="w-12 h-16 object-cover rounded-lg shrink-0 bg-neutral-900"
                        />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h5 className="font-bold text-white text-sm truncate group-hover:text-sky-400">
                            {s.title}
                          </h5>
                          <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <span>{s.year}</span>
                            <span>•</span>
                            <span className="text-sky-400 font-medium">
                              {s.seasonsCount} {s.seasonsCount === 1 ? "Season" : "Seasons"}
                            </span>
                          </div>
                          {s.hasSinhalaSub && (
                            <span className="inline-block text-[10px] text-emerald-400 font-semibold">
                              සිංහල උපසිරැසි ඇත
                            </span>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-sky-400 group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
