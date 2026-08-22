import React, { useState, useEffect } from "react";
import { Film, Search, Filter, Star, Sparkles, RefreshCcw } from "lucide-react";
import { Movie } from "../types";
import { api } from "../api";
import { MovieCard } from "../components/MovieCard";

interface FilmsPageProps {
  initialGenre?: string;
  onSelectMovie: (movie: Movie) => void;
}

const GENRES = [
  "සියල්ල (All)",
  "Action",
  "Adventure",
  "Sci-Fi",
  "Drama",
  "Thriller",
  "Fantasy",
  "Crime",
  "Comedy",
  "Animation",
  "Horror",
];

export const FilmsPage: React.FC<FilmsPageProps> = ({ initialGenre, onSelectMovie }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre || "සියල්ල (All)");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("latest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchFilms() {
      try {
        setLoading(true);
        const genreParam = selectedGenre.includes("සියල්ල") ? undefined : selectedGenre;
        const yearParam = selectedYear === "all" ? undefined : parseInt(selectedYear, 10);
        const res = await api.getMovies({
          publishedOnly: true,
          genre: genreParam,
          year: yearParam,
          search: searchQuery.trim() || undefined,
          sort: sortBy,
          limit: 30,
        });
        setMovies(res.movies || []);
      } catch (err) {
        console.error("Failed to load films:", err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchFilms();
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedGenre, selectedYear, sortBy, searchQuery]);

  const resetFilters = () => {
    setSelectedGenre("සියල්ල (All)");
    setSelectedYear("all");
    setSortBy("latest");
    setSearchQuery("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="space-y-2 border-b border-neutral-800 pb-6">
        <div className="flex items-center gap-2">
          <Film className="w-6 h-6 text-amber-400" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            FILMS DIRECTORY
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          චිත්‍රපට නාමාවලිය (Movies)
        </h1>
        <p className="text-sm text-neutral-400 max-w-2xl">
          සියලුම හොලිවුඩ් සහ ලෝක ප්‍රකට චිත්‍රපට සඳහා උසස් තත්ත්වයේ සිංහල උපසිරැසි සහ 1080p වීඩියෝ මෙතැනින් ලබාගන්න.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="චිත්‍රපට නම හෝ IMDb ID සොයන්න..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500/60"
            />
          </div>

          {/* Year selector */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500/60"
            >
              <option value="all">සියලුම වර්ෂ (All Years)</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2019">2019 (Endgame)</option>
              <option value="2018">2018 (Infinity War)</option>
              <option value="2015">2015 (Age of Ultron)</option>
              <option value="2012">2012 (The Avengers)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500/60"
            >
              <option value="latest">නවතම ඒවා (Latest Released)</option>
              <option value="rating">ඉහළම IMDb Rating (Top Rated)</option>
              <option value="title">මාතෘකාව අනුව (Title A-Z)</option>
            </select>
          </div>
        </div>

        {/* Genre Quick Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedGenre === g
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                  : "bg-neutral-950 text-neutral-300 hover:bg-neutral-800 border border-neutral-800"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="py-20 text-center text-neutral-400 space-y-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium">චිත්‍රපට පූරණය වෙමින් පවතී...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="py-16 text-center bg-neutral-900/60 rounded-2xl border border-neutral-800 p-8 space-y-3">
          <Film className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">චිත්‍රපට හමු නොවීය.</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            ඔබ තෝරාගත් පෙරහන් වලට අදාළ චිත්‍රපට සොයාගත නොහැක. කරුණාකර පෙරහන් වෙනස් කරන්න.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 flex items-center gap-1.5 mx-auto mt-2"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>පෙරහන් ඉවත් කරන්න (Reset)</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
            <span>චිත්‍රපට <strong>{movies.length}</strong> ක් හමුවිය</span>
            <span>සිංහල උපසිරැසි සහිතයි</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={() => onSelectMovie(movie)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
