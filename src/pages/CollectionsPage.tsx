import React, { useState, useEffect } from "react";
import { Layers, ArrowLeft, Film, Star, Subtitles, Play, Eye } from "lucide-react";
import { MovieCollection, Movie } from "../types";
import { api } from "../api";
import { MovieCard } from "../components/MovieCard";

interface CollectionsPageProps {
  initialCollectionSlug?: string;
  onSelectMovie: (movie: Movie) => void;
}

export const CollectionsPage: React.FC<CollectionsPageProps> = ({
  initialCollectionSlug,
  onSelectMovie,
}) => {
  const [collections, setCollections] = useState<MovieCollection[]>([]);
  const [activeCollection, setActiveCollection] = useState<(MovieCollection & { movies: Movie[] }) | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadCollections() {
      try {
        setLoading(true);
        const data = await api.getCollections();
        setCollections(data);

        if (initialCollectionSlug) {
          const detail = await api.getCollection(initialCollectionSlug);
          setActiveCollection(detail);
        }
      } catch (err) {
        console.error("Failed to load collections:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCollections();
  }, [initialCollectionSlug]);

  const viewCollectionDetails = async (col: MovieCollection) => {
    try {
      setLoading(true);
      const detail = await api.getCollection(col.slug || col.id);
      setActiveCollection(detail);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (activeCollection) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
        {/* Back Button */}
        <button
          onClick={() => setActiveCollection(null)}
          className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>සියලු එකතු වෙත (Back to Collections)</span>
        </button>

        {/* Collection Hero Header */}
        <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl">
          <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden bg-neutral-950">
            <img
              src={activeCollection.backdropUrl || activeCollection.posterUrl}
              alt={activeCollection.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent"></div>

            <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500 text-black text-xs font-black">
                <Layers className="w-3.5 h-3.5" />
                <span>{activeCollection.moviesCount} MOVIES SAGA</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                {activeCollection.title}
              </h1>
              <p className="text-xs sm:text-sm text-amber-400 font-bold uppercase tracking-wider">
                {activeCollection.sinhalaTitle}
              </p>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                {activeCollection.description}
              </p>
            </div>
          </div>
        </div>

        {/* Collection Movies List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-400" />
              <span>මෙම එකතුවට අයත් චිත්‍රපට ({activeCollection.movies?.length || 0})</span>
            </h2>
            <span className="text-xs text-neutral-400">Chronological Release Order</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {activeCollection.movies?.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={() => onSelectMovie(movie)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="space-y-2 border-b border-neutral-800 pb-6">
        <div className="flex items-center gap-2">
          <Layers className="w-6 h-6 text-amber-400" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            COLLECTIONS & SAGAS
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          චිත්‍රපට එකතු (Movie Collections)
        </h1>
        <p className="text-sm text-neutral-400 max-w-2xl">
          Avengers Saga, Marvel MCU, Harry Potter, Fast & Furious ආදී ලොව ජනප්‍රියම සිනමා කතා මාලා සම්පූර්ණයෙන් එකම තැනකින් නරඹන්න.
        </p>
      </div>

      {/* Collections Grid */}
      {loading ? (
        <div className="py-20 text-center text-neutral-400 space-y-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium">එකතු පූරණය වෙමින් පවතී...</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="py-16 text-center bg-neutral-900/60 rounded-2xl border border-neutral-800 p-8 space-y-3">
          <Layers className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">එකතු හමු නොවීය.</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <div
              key={col.id}
              onClick={() => viewCollectionDetails(col)}
              className="group relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-amber-500/60 shadow-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-950">
                <img
                  src={col.backdropUrl || col.posterUrl}
                  alt={col.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent"></div>
                <div className="absolute top-3 right-3 bg-amber-500 text-black text-xs font-black px-2.5 py-1 rounded shadow-md">
                  {col.moviesCount} Movies
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                    {col.sinhalaTitle}
                  </span>
                  <h3 className="text-xl font-black text-white leading-tight mt-0.5 group-hover:text-amber-400 transition-colors">
                    {col.title}
                  </h3>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-neutral-900/90">
                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                  {col.description}
                </p>

                <button
                  id={`view-collection-btn-${col.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    viewCollectionDetails(col);
                  }}
                  className="w-full py-2.5 rounded-xl bg-neutral-800 group-hover:bg-amber-500 text-neutral-200 group-hover:text-black font-bold text-xs transition-all flex items-center justify-center gap-2 border border-neutral-700/60"
                >
                  <Eye className="w-4 h-4" />
                  <span>චිත්‍රපට සියල්ල නරඹන්න ({col.moviesCount})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
