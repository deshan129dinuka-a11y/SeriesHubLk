import React, { useState, useEffect } from "react";
import {
  Film,
  Star,
  Clock,
  Calendar,
  User,
  Users,
  Download,
  Subtitles,
  Play,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Tv,
  Layers,
} from "lucide-react";
import { Movie, SubtitleFile } from "../types";
import { api } from "../api";
import { TrailerPlayer } from "../components/TrailerPlayer";
import { ImageGallery } from "../components/ImageGallery";
import { SubtitleDownload } from "../components/SubtitleDownload";
import { VideoPlayer } from "../components/VideoPlayer";
import { MovieCard } from "../components/MovieCard";

interface MovieDetailPageProps {
  movieIdOrSlug: string;
  onBack: () => void;
  onSelectMovie: (movie: Movie) => void;
  onNavigateToCollection?: (collectionSlug: string) => void;
}

export const MovieDetailPage: React.FC<MovieDetailPageProps> = ({
  movieIdOrSlug,
  onBack,
  onSelectMovie,
  onNavigateToCollection,
}) => {
  const [movie, setMovie] = useState<(Movie & { images: any[]; subtitles: SubtitleFile[] }) | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showPlayer, setShowPlayer] = useState<boolean>(false);

  useEffect(() => {
    async function loadMovieData() {
      try {
        setLoading(true);
        const data = await api.getMovie(movieIdOrSlug);
        setMovie(data);

        // Fetch related movies in same genre or collection
        const relRes = await api.getMovies({
          publishedOnly: true,
          genre: data.genres?.[0],
          limit: 5,
        });
        setRelatedMovies(relRes.movies.filter((m) => m.id !== data.id).slice(0, 4));
      } catch (err) {
        console.error("Failed to load movie detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMovieData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [movieIdOrSlug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDirectDownloadVideo = () => {
    if (movie?.videoDownloadUrl) {
      window.open(movie.videoDownloadUrl, "_blank");
    } else {
      alert("1080p සෘජු වීඩියෝ බාගත කිරීමේ සබැඳිය සකසා ඇත.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-neutral-400 text-sm font-medium">චිත්‍රපට විස්තර පූරණය වෙමින් පවතී...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">චිත්‍රපටය සොයාගත නොහැක.</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl"
        >
          ආපසු යන්න
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fadeIn pb-20">
      {/* Backdrop Header with Poster and Details */}
      <div className="relative w-full overflow-hidden bg-neutral-950 border-b border-neutral-800">
        {/* Backdrop Image */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover filter blur-xs"
          />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent"></div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
          {/* Back & Share Row */}
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ආපසු (Back)</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer"
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? "සබැඳිය පිටපත් විය!" : "Share Link"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Poster Col */}
            <div className="md:col-span-4 lg:col-span-3">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-neutral-800 group">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                {movie.hasSinhalaSub && (
                  <div className="absolute top-3 left-3 bg-emerald-950/95 text-emerald-300 border border-emerald-700/80 text-xs font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                    <Subtitles className="w-3.5 h-3.5" />
                    <span>සිංහල උපසිරැසි සහිතයි</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details Col */}
            <div className="md:col-span-8 lg:col-span-9 space-y-5">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-amber-500 text-black font-black text-xs px-2.5 py-1 rounded-md shadow-md">
                  <Star className="w-3.5 h-3.5 fill-black" />
                  <span>IMDb {movie.rating ? movie.rating.toFixed(1) : "N/A"} / 10</span>
                </div>

                <div className="flex items-center gap-1 bg-neutral-900 text-neutral-300 text-xs px-2.5 py-1 rounded-md border border-neutral-800">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>{movie.year}</span>
                </div>

                {movie.runtime && (
                  <div className="flex items-center gap-1 bg-neutral-900 text-neutral-300 text-xs px-2.5 py-1 rounded-md border border-neutral-800">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{movie.runtime}</span>
                  </div>
                )}

                {movie.contentRating && (
                  <span className="bg-neutral-900 text-neutral-300 text-xs px-2.5 py-1 rounded-md border border-neutral-800 font-bold">
                    {movie.contentRating}
                  </span>
                )}

                <span className="bg-red-950 text-red-300 text-xs px-2.5 py-1 rounded-md border border-red-800 font-bold">
                  1080p FHD
                </span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                  {movie.title}
                </h1>
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <p className="text-sm text-neutral-400 font-mono mt-1">
                    Original Title: {movie.originalTitle}
                  </p>
                )}
              </div>

              {/* Genre chips */}
              <div className="flex flex-wrap gap-2">
                {movie.genres?.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-lg bg-neutral-900 text-amber-300 border border-neutral-800 text-xs font-semibold"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Meta information: Director & Cast */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300 pt-2 border-t border-neutral-800/80">
                {movie.director && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>අධ්‍යක්ෂණය (Director): <strong className="text-white">{movie.director}</strong></span>
                  </div>
                )}
                {movie.cast && movie.cast.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">රංගනය: <strong className="text-white">{movie.cast.slice(0, 4).join(", ")}</strong></span>
                  </div>
                )}
              </div>

              {/* Primary Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="watch-online-player-btn"
                  onClick={() => {
                    setShowPlayer(true);
                    document.getElementById("streaming-player-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>සජීවීව නරඹන්න (Watch Online)</span>
                </button>

                <button
                  id="download-video-btn"
                  onClick={handleDirectDownloadVideo}
                  className="px-5 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm border border-neutral-700 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>1080p වීඩියෝව බාගත කරන්න</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section: Sinhala Description (චිත්‍රපටය පිළිබඳ විස්තරය) */}
        <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Film className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">චිත්‍රපටය පිළිබඳ විස්තරය (Movie Synopsis)</h2>
          </div>

          <div className="space-y-4 text-neutral-300 text-sm sm:text-base leading-relaxed">
            {/* Rich Sinhala Description */}
            <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-amber-100/90 font-sans leading-relaxed whitespace-pre-line">
              {movie.sinhalaDescription ||
                `${movie.title} යනු ${movie.year} වසරේ තිරගත වූ විශිෂ්ටතම ${movie.genres?.join(", ")} ගණයේ සිනමාපටයකි.`}
            </div>

            {/* English Overview */}
            {movie.overview && (
              <div className="text-xs sm:text-sm text-neutral-400 space-y-1 pt-2">
                <span className="text-neutral-500 uppercase tracking-wider text-[11px] font-bold">English Overview:</span>
                <p>{movie.overview}</p>
              </div>
            )}
          </div>
        </div>

        {/* Section: Online Streaming Player */}
        <div id="streaming-player-section" className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-amber-400" />
              <span>සජීවීව නරඹන්න (Online Video Player)</span>
            </h2>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Subtitles className="w-3.5 h-3.5" />
              <span>සිංහල උපසිරැසි අන්තර්ගතයි</span>
            </span>
          </div>

          <VideoPlayer
            src={movie.streamingUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
            title={movie.title}
            posterUrl={movie.backdropUrl || movie.posterUrl}
            subtitleUrl={movie.subtitles?.[0]?.fileUrl || "/api/subtitles/download/sample-1"}
          />
        </div>

        {/* Section: Download Sinhala Subtitles */}
        <SubtitleDownload
          subtitles={movie.subtitles || []}
          title={movie.title}
          hasSinhalaSub={movie.hasSinhalaSub}
        />

        {/* Section: Official Trailer Player */}
        <TrailerPlayer trailerUrl={movie.trailerUrl} title={movie.title} />

        {/* Section: 6 Movie Images Gallery */}
        <ImageGallery images={movie.images || []} title={movie.title} />

        {/* Related Movies */}
        {relatedMovies.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-amber-400" />
                <span>තවත් නිර්දේශිත චිත්‍රපට (Recommended Movies)</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedMovies.map((m) => (
                <MovieCard key={m.id} movie={m} onClick={() => onSelectMovie(m)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
