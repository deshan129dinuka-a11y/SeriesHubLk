import React from "react";
import { Star, Subtitles, Eye, Tv, Play } from "lucide-react";
import { TVSeries } from "../types";

interface SeriesCardProps {
  series: TVSeries;
  onClick: () => void;
}

export const SeriesCard: React.FC<SeriesCardProps> = ({ series, onClick }) => {
  return (
    <div
      id={`series-card-${series.id}`}
      onClick={onClick}
      className="group relative flex flex-col bg-neutral-900/90 hover:bg-neutral-850 rounded-2xl overflow-hidden border border-neutral-800/80 hover:border-sky-500/50 shadow-lg hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1.5"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950">
        <img
          src={series.posterUrl || "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg"}
          alt={series.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg";
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1 bg-neutral-950/85 backdrop-blur-md text-amber-400 font-bold text-xs px-2 py-1 rounded-lg border border-amber-500/30 shadow-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{series.rating ? series.rating.toFixed(1) : "N/A"}</span>
          </div>

          <div className="flex items-center gap-1 bg-sky-950/90 backdrop-blur-md text-sky-400 font-semibold text-[11px] px-2 py-1 rounded-lg border border-sky-500/30 shadow-md">
            <Tv className="w-3 h-3" />
            <span>{series.seasonsCount || 1} {series.seasonsCount === 1 ? "Season" : "Seasons"}</span>
          </div>
        </div>

        {/* Subtitle Badge */}
        {series.hasSinhalaSub && (
          <div className="absolute bottom-2.5 left-2.5 bg-emerald-950/90 backdrop-blur-md text-emerald-400 font-semibold text-[11px] px-2 py-1 rounded-lg border border-emerald-500/30 shadow-md flex items-center gap-1">
            <Subtitles className="w-3 h-3" />
            <span>සිංහල උපසිරැසි ඇත</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-13 h-13 rounded-full bg-sky-500 text-black flex items-center justify-center shadow-lg shadow-sky-500/40 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 fill-black ml-0.5" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold text-sky-400">{series.year}</span>
            <span className="text-neutral-500 truncate max-w-[120px]">
              {series.genres?.slice(0, 2).join(" • ") || "TV Series"}
            </span>
          </div>

          <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-sky-400 transition-colors leading-tight" title={series.title}>
            {series.title}
          </h3>

          <p className="text-[12px] text-neutral-400 font-medium line-clamp-1">
            {series.creators?.join(", ") || "TV Series"}
          </p>
        </div>

        {/* Button */}
        <button
          id={`view-series-btn-${series.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-neutral-800/90 hover:bg-sky-500 text-neutral-200 hover:text-black font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 border border-neutral-700/60 hover:border-sky-400 group-hover:shadow-md cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>විස්තර බලන්න (View Details)</span>
        </button>
      </div>
    </div>
  );
};
