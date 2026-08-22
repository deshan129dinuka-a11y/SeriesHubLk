import React, { useState, useEffect } from "react";
import { Film, Tv, Layers, ArrowRight, Sparkles, Star, Subtitles, Download, Flame, Crown, Zap, ShieldCheck } from "lucide-react";
import { Movie, TVSeries, MovieCollection, SiteSettings } from "../types";
import { api } from "../api";
import { Hero } from "../components/Hero";
import { MovieCard } from "../components/MovieCard";
import { SeriesCard } from "../components/SeriesCard";

interface HomePageProps {
  onNavigate: (tab: string, param?: string) => void;
  onSelectMovie: (movie: Movie) => void;
  onSelectSeries: (series: TVSeries) => void;
  onSelectCollection: (col: MovieCollection) => void;
  settings?: SiteSettings;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectMovie,
  onSelectSeries,
  onSelectCollection,
  settings,
}) => {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [latestMovies, setLatestMovies] = useState<Movie[]>([]);
  const [seriesList, setSeriesList] = useState<TVSeries[]>([]);
  const [collections, setCollections] = useState<MovieCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [mRes, sRes, colRes] = await Promise.all([
          api.getMovies({ publishedOnly: true, limit: 12 }),
          api.getTVSeries({ publishedOnly: true, limit: 12 }),
          api.getCollections(),
        ]);

        const allM = mRes.movies || [];
        setFeaturedMovies(allM.filter((m) => m.isFeatured).slice(0, 4));
        setLatestMovies(allM.slice(0, 8));
        setSeriesList(sRes.series || []);
        setCollections(colRes || []);
      } catch (err) {
        console.error("Failed to load home data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const scrollToCategory = (id: string) => {
    setActiveCategoryFilter(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // VIP TV Series subset (high rated / exclusive series)
  const vipSeriesList = seriesList.slice(0, 6);

  return (
    <div className="space-y-12 sm:space-y-16 animate-fadeIn pb-16">
      {/* Cinematic Hero */}
      <Hero
        onNavigate={onNavigate}
        settings={settings}
        featuredTitle={featuredMovies[0]?.title || "Avengers: Endgame"}
        onWatchFeatured={() => {
          if (featuredMovies.length > 0) {
            onSelectMovie(featuredMovies[0]);
          } else {
            onNavigate("films");
          }
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 sm:space-y-16">
        {/* Category Quick Navigator Bar */}
        <div className="bg-neutral-900/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-neutral-800 p-2 sm:p-3 shadow-xl">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-1">
            <button
              onClick={() => scrollToCategory("sec-latest-films")}
              className="px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap bg-neutral-850 hover:bg-neutral-800 text-amber-400 border border-amber-500/30 shadow-sm transition-all cursor-pointer group"
            >
              <Film className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>නවතම චිත්රපට (Films)</span>
            </button>

            <button
              onClick={() => scrollToCategory("sec-tv-series")}
              className="px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap bg-neutral-850 hover:bg-neutral-800 text-sky-400 border border-sky-500/30 shadow-sm transition-all cursor-pointer group"
            >
              <Tv className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
              <span>ටීවී සීරීස් (TV Series)</span>
            </button>

            <button
              onClick={() => scrollToCategory("sec-movie-collections")}
              className="px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap bg-neutral-850 hover:bg-neutral-800 text-emerald-400 border border-emerald-500/30 shadow-sm transition-all cursor-pointer group"
            >
              <Layers className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>චිත්රපට එකතු (Movie Collections)</span>
            </button>

            <button
              onClick={() => scrollToCategory("sec-vip-tv-series")}
              className="px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 hover:from-amber-500/30 text-amber-300 border border-amber-500/50 shadow-md transition-all cursor-pointer group ml-auto"
            >
              <Crown className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform animate-bounce" />
              <span>VIP Tv Series (For VIP Members)</span>
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* CATEGORY 1: නවතම චිත්රපට (Films) */}
        {/* ---------------------------------------------------- */}
        <section id="sec-latest-films" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-neutral-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Film className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  LATEST MOVIE RELEASES
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>නවතම චිත්රපට (Films)</span>
              </h2>
              <p className="text-xs text-neutral-400">
                1080p Full HD & 4K UHD සිංහල උපසිරැසි සහිත නවතම සිනමාපට
              </p>
            </div>

            <button
              onClick={() => onNavigate("films")}
              className="text-amber-400 hover:text-amber-300 text-xs sm:text-sm font-bold flex items-center gap-1 group self-start sm:self-end bg-neutral-900 px-3.5 py-2 rounded-xl border border-neutral-800 hover:border-amber-500/40 transition-all"
            >
              <span>සියලු චිත්‍රපට (View All Films)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {latestMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={() => onSelectMovie(movie)}
              />
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* CATEGORY 2: ටීවී සීරීස් (TV Series) */}
        {/* ---------------------------------------------------- */}
        <section id="sec-tv-series" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-neutral-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
                  <Tv className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-sky-400 uppercase tracking-wider">
                  TRENDING TV SHOWS & SEASONS
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>ටීවී සීරීස් (TV Series)</span>
              </h2>
              <p className="text-xs text-neutral-400">
                ලොව ජනප්‍රියම කතාමාලා සහ සියලුම Seasons සිංහල උපසිරැසි සමඟ
              </p>
            </div>

            <button
              onClick={() => onNavigate("series")}
              className="text-sky-400 hover:text-sky-300 text-xs sm:text-sm font-bold flex items-center gap-1 group self-start sm:self-end bg-neutral-900 px-3.5 py-2 rounded-xl border border-neutral-800 hover:border-sky-500/40 transition-all"
            >
              <span>සියලු සීරීස් (View All TV Series)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
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
        </section>

        {/* ---------------------------------------------------- */}
        {/* CATEGORY 3: චිත්රපට එකතු (Movie Collections) */}
        {/* ---------------------------------------------------- */}
        <section id="sec-movie-collections" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-neutral-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  CINEMATIC SAGAS & FRANCHISES
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>චිත්රපට එකතු (Movie Collections)</span>
              </h2>
              <p className="text-xs text-neutral-400">
                MCU, DC, Harry Potter, Fast Saga ඇතුළු සියලුම සිනමා කතාමාලා එක පෙළට
              </p>
            </div>

            <button
              onClick={() => onNavigate("collections")}
              className="text-emerald-400 hover:text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-1 group self-start sm:self-end bg-neutral-900 px-3.5 py-2 rounded-xl border border-neutral-800 hover:border-emerald-500/40 transition-all"
            >
              <span>සියලු එකතු (View All Collections)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.slice(0, 3).map((col) => (
              <div
                key={col.id}
                onClick={() => onSelectCollection(col)}
                className="group relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 shadow-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-950">
                  <img
                    src={col.backdropUrl || col.posterUrl}
                    alt={col.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent"></div>
                  <div className="absolute top-3 right-3 bg-emerald-500 text-black text-[11px] font-black px-2.5 py-1 rounded-md shadow-md">
                    {col.moviesCount} Movies
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                      {col.sinhalaTitle}
                    </span>
                    <h3 className="text-lg font-black text-white leading-tight mt-0.5">
                      {col.title}
                    </h3>
                  </div>
                </div>
                <div className="p-4 bg-neutral-900/90 flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-800">
                  <span className="line-clamp-1">{col.description}</span>
                  <span className="text-emerald-400 font-bold ml-2 shrink-0 flex items-center gap-0.5">
                    නරඹන්න →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* CATEGORY 4: VIP Tv Series (For VIP Members) */}
        {/* ---------------------------------------------------- */}
        <section id="sec-vip-tv-series" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b-2 border-amber-500/40 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  <Crown className="w-4 h-4 animate-bounce" />
                </div>
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  EXCLUSIVE VIP ACCESS & DIRECT 1GBPS+ LINKS
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                  VIP Tv Series (For VIP Members)
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  VIP ONLY
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Direct Google Drive 1Gbps+ Links, 4K HDR & 1080p 10-Bit Sinhala Sub, 100% Ad-Free Downloads
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-end">
              <button
                onClick={() => onNavigate("vip")}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-amber-500/25 cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>Join VIP Club</span>
              </button>
              <button
                onClick={() => onNavigate("series")}
                className="text-amber-400 hover:text-amber-300 text-xs sm:text-sm font-bold flex items-center gap-1 group bg-neutral-900 px-3.5 py-2 rounded-xl border border-neutral-800 hover:border-amber-500/40 transition-all"
              >
                <span>සියලු VIP Series</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* VIP Highlight Series Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {vipSeriesList.map((series) => (
              <div key={`vip-${series.id}`} className="relative group">
                {/* VIP Floating Badge on top left */}
                <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/85 border border-amber-500/70 text-amber-300 text-[10px] font-black tracking-wider shadow-lg backdrop-blur-sm">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>VIP DIRECT</span>
                </div>
                <SeriesCard
                  series={series}
                  onClick={() => onSelectSeries(series)}
                />
              </div>
            ))}
          </div>

          {/* VIP Membership Join Card */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-950/60 via-neutral-900 to-neutral-950 border-2 border-amber-500/50 p-6 sm:p-10 shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black tracking-wider uppercase">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>SERIESHUB VIP MEMBERSHIP</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <h3 className="text-xl sm:text-3xl font-black text-white leading-tight">
                  දැන්වීම් හෝ Countdown නැතිව High-Speed Google Drive Direct Links ලබාගන්න!
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
                  Google Drive Direct 1Gbps+ බාගත කිරීම්, 4K UHD ගුණාත්මකභාවය, VIP Telegram Channel & Cloud Bot සමඟින් විශේෂ වරප්‍රසාද රැසක් ලබාගන්න.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300 pt-1">
                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Ad-Free
                  </span>
                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                    <Zap className="w-4 h-4 text-amber-400" /> 1Gbps+ Direct Drive Links
                  </span>
                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 4K & 1080p Sinhala Subs
                  </span>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                <button
                  onClick={() => onNavigate("vip")}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Crown className="w-4 h-4" />
                  <span>VIP සාමාජිකත්වය ලබාගන්න</span>
                </button>
                <button
                  onClick={() => onNavigate("vip")}
                  className="w-full py-3 px-5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 font-bold text-xs sm:text-sm border border-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>VIP Plans & මිල ගණන්</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Sinhala Subtitle Hub Banner */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/30 border border-amber-500/30 p-8 sm:p-10 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold">
              <Subtitles className="w-4 h-4" />
              <span>100% නිවැරදි සිංහල උපසිරැසි</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              ඔබ සොයන ඕනෑම චිත්‍රපටයක් හෝ සීරීස් එකක් සඳහා සිංහල උපසිරැසි නොමිලේ!
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed">
              SeriesHubLk හරහා ක්ලික් එකකින් .srt, .vtt ගොනු බාගත කරගන්න. ඔබ සතුවද උපසිරැසියක් තිබේ නම් අප වෙත යොමු කරන්න.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate("films")}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs tracking-wide shadow-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>උපසිරැසි සොයන්න (Search Subtitles)</span>
              </button>
              <button
                onClick={() => onNavigate("contact")}
                className="px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs border border-neutral-700 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>අප අමතන්න (Contact Support)</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

