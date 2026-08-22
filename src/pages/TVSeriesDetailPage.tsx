import React, { useState, useEffect } from "react";
import {
  Tv,
  Star,
  Calendar,
  Layers,
  Play,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Subtitles,
  Download,
  Clock,
  ChevronDown,
  ChevronRight,
  Film,
  Sparkles,
} from "lucide-react";
import { TVSeries, Season, Episode, SubtitleFile } from "../types";
import { api } from "../api";
import { VideoPlayer } from "../components/VideoPlayer";
import { TrailerPlayer } from "../components/TrailerPlayer";
import { ImageGallery } from "../components/ImageGallery";
import { SubtitleDownload } from "../components/SubtitleDownload";

interface TVSeriesDetailPageProps {
  seriesIdOrSlug: string;
  onBack: () => void;
}

export const TVSeriesDetailPage: React.FC<TVSeriesDetailPageProps> = ({
  seriesIdOrSlug,
  onBack,
}) => {
  const [series, setSeries] = useState<(TVSeries & { seasons: (Season & { episodes: Episode[] })[] }) | null>(null);
  const [activeSeasonNumber, setActiveSeasonNumber] = useState<number>(1);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    async function loadSeries() {
      try {
        setLoading(true);
        const data = await api.getSeries(seriesIdOrSlug);
        setSeries(data);

        // Select first episode of first season by default
        if (data.seasons && data.seasons.length > 0) {
          const firstSeason = data.seasons[0];
          setActiveSeasonNumber(firstSeason.seasonNumber);
          if (firstSeason.episodes && firstSeason.episodes.length > 0) {
            setActiveEpisode(firstSeason.episodes[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load TV Series details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSeries();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [seriesIdOrSlug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const currentSeason = series?.seasons?.find((s) => s.seasonNumber === activeSeasonNumber) || series?.seasons?.[0];

  const handlePlayEpisode = (ep: Episode) => {
    setActiveEpisode(ep);
    document.getElementById("series-player-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNextEpisode = () => {
    if (!currentSeason || !activeEpisode) return;
    const currentIndex = currentSeason.episodes.findIndex((e) => e.id === activeEpisode.id);
    if (currentIndex !== -1 && currentIndex < currentSeason.episodes.length - 1) {
      setActiveEpisode(currentSeason.episodes[currentIndex + 1]);
    }
  };

  const handlePrevEpisode = () => {
    if (!currentSeason || !activeEpisode) return;
    const currentIndex = currentSeason.episodes.findIndex((e) => e.id === activeEpisode.id);
    if (currentIndex > 0) {
      setActiveEpisode(currentSeason.episodes[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-neutral-400 text-sm font-medium">ටීවී සීරීස් විස්තර පූරණය වෙමින් පවතී...</p>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">ටීවී සීරීස් සොයාගත නොහැක.</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-sky-500 text-black font-bold text-xs rounded-xl"
        >
          ආපසු යන්න
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fadeIn pb-20">
      {/* Series Hero Backdrop */}
      <div className="relative w-full overflow-hidden bg-neutral-950 border-b border-neutral-800">
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src={series.backdropUrl || series.posterUrl}
            alt={series.title}
            className="w-full h-full object-cover filter blur-xs"
          />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
          {/* Top Actions */}
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
              <span>{copiedLink ? "සබැඳිය පිටපත් විය!" : "Share Series"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Poster */}
            <div className="md:col-span-4 lg:col-span-3">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-neutral-800">
                <img
                  src={series.posterUrl}
                  alt={series.title}
                  className="w-full h-full object-cover"
                />
                {series.hasSinhalaSub && (
                  <div className="absolute top-3 left-3 bg-emerald-950/95 text-emerald-300 border border-emerald-700/80 text-xs font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                    <Subtitles className="w-3.5 h-3.5" />
                    <span>සිංහල උපසිරැසි සහිතයි</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="md:col-span-8 lg:col-span-9 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-amber-500 text-black font-black text-xs px-2.5 py-1 rounded-md shadow-md">
                  <Star className="w-3.5 h-3.5 fill-black" />
                  <span>IMDb {series.rating ? series.rating.toFixed(1) : "N/A"} / 10</span>
                </div>

                <div className="flex items-center gap-1 bg-sky-950 text-sky-300 text-xs px-2.5 py-1 rounded-md border border-sky-800 font-bold">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{series.seasonsCount} Seasons</span>
                </div>

                <div className="flex items-center gap-1 bg-neutral-900 text-neutral-300 text-xs px-2.5 py-1 rounded-md border border-neutral-800">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  <span>{series.year}</span>
                </div>

                <span className="bg-red-950 text-red-300 text-xs px-2.5 py-1 rounded-md border border-red-800 font-bold">
                  1080p FHD
                </span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                  {series.title}
                </h1>
                {series.creators && series.creators.length > 0 && (
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    නිර්මාණය (Creators): <strong className="text-white">{series.creators.join(", ")}</strong>
                  </p>
                )}
              </div>

              {/* Genre chips */}
              <div className="flex flex-wrap gap-2">
                {series.genres?.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-lg bg-neutral-900 text-sky-300 border border-neutral-800 text-xs font-semibold"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Quick Watch Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    document.getElementById("series-player-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-sm shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>කතාංග නරඹන්න (Watch Episodes)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Sinhala Synopsis */}
        <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Tv className="w-5 h-5 text-sky-400" />
            <h2 className="text-xl font-bold text-white">ටීවී සීරීස් විස්තරය (TV Series Synopsis)</h2>
          </div>

          <div className="space-y-4 text-neutral-300 text-sm sm:text-base leading-relaxed">
            <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-sky-100/90 font-sans leading-relaxed whitespace-pre-line">
              {series.sinhalaDescription ||
                `${series.title} යනු ලොව පුරා අතිශය ජනප්‍රියත්වයට පත් වූ විශිෂ්ටතම ${series.genres?.join(", ")} කතා මාලාවකි.`}
            </div>

            {series.overview && (
              <div className="text-xs sm:text-sm text-neutral-400 space-y-1 pt-2">
                <span className="text-neutral-500 uppercase tracking-wider text-[11px] font-bold">English Overview:</span>
                <p>{series.overview}</p>
              </div>
            )}
          </div>
        </div>

        {/* Video Player Section with Active Episode Info */}
        <div id="series-player-section" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-sky-400" />
                <h2 className="text-xl font-bold text-white">
                  දැන් ධාවනය වේ: {activeEpisode ? `S${activeSeasonNumber}E${activeEpisode.episodeNumber} - ${activeEpisode.title}` : series.title}
                </h2>
              </div>
              <span className="text-xs text-neutral-400">1080p Direct Web Stream with Sinhala Subtitles</span>
            </div>

            {/* Next / Prev episode buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevEpisode}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-semibold border border-neutral-800 cursor-pointer"
              >
                ◀ කලින් කොටස
              </button>
              <button
                onClick={handleNextEpisode}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-semibold border border-neutral-800 cursor-pointer"
              >
                ඊළඟ කොටස ▶
              </button>
            </div>
          </div>

          <VideoPlayer
            src={activeEpisode?.videoUrl || series.streamingUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
            title={`${series.title} - S${activeSeasonNumber}E${activeEpisode?.episodeNumber || 1}: ${activeEpisode?.title || "Episode"}`}
            posterUrl={activeEpisode?.stillUrl || series.backdropUrl || series.posterUrl}
            subtitleUrl={activeEpisode?.subtitleUrl || "/api/subtitles/download/sample-1"}
          />
        </div>

        {/* Seasons & Episodes Explorer matching user design */}
        <div id="seasons-and-episodes-section" className="bg-neutral-900/90 rounded-2xl border border-neutral-800 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-red-500" />
                <span>කතාංග සහ Seasons (Seasons & Episodes)</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                ඔබට නැරඹීමට හෝ බාගත කිරීමට අවශ්‍ය Season එක තෝරන්න
              </p>
            </div>

            <div className="text-xs font-mono text-neutral-400">
              <span className="text-red-400 font-bold">{series.seasons?.length || 1} Seasons</span> •{" "}
              <span>{currentSeason?.episodes?.length || 0} Episodes</span>
            </div>
          </div>

          {/* 1. SEPARATE SEASONS OPTION BUTTONS (Pill style matching screenshot) */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5 p-2 bg-neutral-950/80 rounded-2xl border border-neutral-800">
              {series.seasons && series.seasons.length > 0 ? (
                series.seasons.map((season) => {
                  const isSelected = activeSeasonNumber === season.seasonNumber;
                  const sNum = season.seasonNumber;
                  const formattedName = season.name || `Season ${sNum < 10 ? `0${sNum}` : sNum}`;

                  return (
                    <button
                      key={season.id}
                      id={`btn-season-select-${sNum}`}
                      onClick={() => {
                        setActiveSeasonNumber(sNum);
                        if (season.episodes && season.episodes.length > 0) {
                          setActiveEpisode(season.episodes[0]);
                        }
                      }}
                      className={`px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? "bg-red-600 text-white shadow-xl shadow-red-900/50 ring-2 ring-red-400 scale-105"
                          : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700"
                      }`}
                    >
                      <span>{formattedName}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                          isSelected ? "bg-black/30 text-white font-bold" : "bg-neutral-900 text-neutral-400"
                        }`}
                      >
                        {season.episodes?.length || season.episodeCount || 0} eps
                      </span>
                    </button>
                  );
                })
              ) : (
                <button className="px-5 py-2.5 rounded-full bg-red-600 text-white text-xs font-black shadow-lg">
                  Season 01
                </button>
              )}
            </div>
          </div>

          {/* 2. SEASON-WISE DESCRIPTION & OVERVIEW */}
          {currentSeason && (
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>
                  {currentSeason.name || `Season ${activeSeasonNumber}`} විස්තරය & සාරාංශය (Season Synopsis)
                </span>
              </div>

              {currentSeason.sinhalaDescription ? (
                <div className="text-neutral-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-neutral-900/60 p-4 rounded-xl border border-neutral-800/80 font-sans">
                  {currentSeason.sinhalaDescription}
                </div>
              ) : (
                <p className="text-neutral-400 text-xs italic">
                  {series.title} හි {currentSeason.name || `Season ${activeSeasonNumber}`} සඳහා සිංහල සාරාංශය සහ විචාරය.
                </p>
              )}

              {currentSeason.overview && (
                <p className="text-[11px] text-neutral-400 font-mono">
                  <strong className="text-neutral-300">English:</strong> {currentSeason.overview}
                </p>
              )}
            </div>
          )}

          {/* 3. SHOW ALL EPISODES UNDER EACH SEASON WITH 720p & 1080p ONLY */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-red-500" />
                <span>
                  {currentSeason?.name || `Season ${activeSeasonNumber}`} හි සියලු Episodes ({currentSeason?.episodes?.length || 0})
                </span>
              </h4>
              <span className="text-[11px] text-neutral-400">
                Quality: <strong className="text-white">720p HD & 1080p FHD</strong>
              </span>
            </div>

            {currentSeason?.episodes && currentSeason.episodes.length > 0 ? (
              <div className="space-y-2.5">
                {currentSeason.episodes.map((ep, idx) => {
                  const isActive = activeEpisode?.id === ep.id;
                  const epNum = ep.episodeNumber || idx + 1;

                  return (
                    <div
                      key={ep.id || idx}
                      id={`episode-row-${epNum}`}
                      className={`p-3 sm:p-4 rounded-2xl transition-all duration-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border ${
                        isActive
                          ? "bg-red-600 text-white shadow-xl shadow-red-900/40 border-red-500"
                          : "bg-neutral-950/70 text-neutral-300 border-neutral-800/90 hover:bg-neutral-900 hover:border-neutral-700"
                      }`}
                    >
                      {/* Left: Episode Number, Thumbnail, Title & Air Date (matching uploaded screenshot) */}
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Number */}
                        <div
                          className={`w-8 sm:w-10 text-center font-mono font-black text-base sm:text-lg shrink-0 ${
                            isActive ? "text-white" : "text-neutral-400"
                          }`}
                        >
                          {epNum}
                        </div>

                        {/* 16:9 Thumbnail Still */}
                        <div
                          onClick={() => handlePlayEpisode(ep)}
                          className="relative aspect-video w-24 sm:w-32 rounded-xl overflow-hidden bg-neutral-900 shrink-0 border border-neutral-800/80 cursor-pointer group shadow"
                        >
                          <img
                            src={ep.thumbnailUrl || ep.stillUrl || series.backdropUrl || series.posterUrl}
                            alt={ep.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                            <div className="w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                            </div>
                          </div>
                        </div>

                        {/* Title & Metadata */}
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5
                              onClick={() => handlePlayEpisode(ep)}
                              className={`font-black text-sm sm:text-base hover:underline cursor-pointer truncate ${
                                isActive ? "text-white" : "text-white"
                              }`}
                            >
                              {ep.title || `Episode ${epNum}`}
                            </h5>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full bg-white text-red-600 text-[10px] font-black uppercase tracking-wider">
                                Now Playing
                              </span>
                            )}
                          </div>

                          <div
                            className={`flex items-center gap-3 text-xs flex-wrap ${
                              isActive ? "text-red-100" : "text-neutral-400"
                            }`}
                          >
                            {ep.airDate && <span className="font-mono">{ep.airDate}</span>}
                            {ep.runtime && <span>• {ep.runtime} min</span>}
                            <span
                              className={`font-semibold ${
                                isActive ? "text-white" : "text-emerald-400"
                              }`}
                            >
                              • සිංහල උපසිරැසි ඇත
                            </span>
                          </div>

                          {ep.overview && (
                            <p
                              className={`text-[11px] line-clamp-1 max-w-lg hidden sm:block ${
                                isActive ? "text-red-100/90" : "text-neutral-400"
                              }`}
                            >
                              {ep.overview}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Separate 720p & 1080p Download Buttons & Sinhala Subtitle */}
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full lg:w-auto shrink-0 justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-800/40">
                        {/* Play Now Button */}
                        <button
                          onClick={() => handlePlayEpisode(ep)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow ${
                            isActive
                              ? "bg-white text-red-600 hover:bg-neutral-100"
                              : "bg-red-600 hover:bg-red-500 text-white"
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>නරඹන්න</span>
                        </button>

                        {/* 720p HD Download (Strictly 720p) */}
                        {(ep.download720pUrl || ep.video720pUrl || ep.downloadUrl) && (
                          <a
                            href={ep.download720pUrl || ep.video720pUrl || ep.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              isActive
                                ? "bg-black/30 hover:bg-black/50 text-white border border-white/30"
                                : "bg-neutral-900 hover:bg-neutral-800 text-sky-300 hover:text-white border border-sky-900/60"
                            }`}
                            title="720p HD වීඩියෝ බාගත කරන්න"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>720p ({ep.download720pSize || "450 MB"})</span>
                          </a>
                        )}

                        {/* 1080p FHD Download (Strictly 1080p) */}
                        {(ep.download1080pUrl || ep.video1080pUrl || ep.downloadUrl) && (
                          <a
                            href={ep.download1080pUrl || ep.video1080pUrl || ep.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              isActive
                                ? "bg-black/30 hover:bg-black/50 text-white border border-white/30"
                                : "bg-neutral-900 hover:bg-neutral-800 text-amber-300 hover:text-white border border-amber-900/60"
                            }`}
                            title="1080p FHD වීඩියෝ බාගත කරන්න"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>1080p ({ep.download1080pSize || "1.1 GB"})</span>
                          </a>
                        )}

                        {/* Sinhala Subtitle (.srt / .zip download) */}
                        {ep.hasSinhalaSub && (
                          <a
                            href={ep.subtitleUrl || "/api/subtitles/download/sample-1"}
                            download
                            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                              isActive
                                ? "bg-black/30 hover:bg-black/50 text-white border border-white/30"
                                : "bg-neutral-900 hover:bg-neutral-800 text-emerald-300 hover:text-white border border-emerald-900/60"
                            }`}
                            title="සිංහල උපසිරැසි (.srt) බාගත කරන්න"
                          >
                            <Subtitles className="w-4 h-4" />
                            <span className="hidden sm:inline">සිංහල Sub</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center rounded-2xl bg-neutral-950 border border-dashed border-neutral-800 space-y-2">
                <p className="text-xs text-neutral-400">
                  මෙම Season එක සඳහා කතාංග (Episodes) තවමත් ඇතුළත් කර නොමැත.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sinhala Subtitles Section */}
        <SubtitleDownload
          title={`${series.title} S${activeSeasonNumber}`}
          hasSinhalaSub={series.hasSinhalaSub}
        />

        {/* Trailer & Gallery */}
        <TrailerPlayer trailerUrl={series.trailerUrl} title={series.title} />
        <ImageGallery images={series.images || []} title={series.title} />
      </div>
    </div>
  );
};
