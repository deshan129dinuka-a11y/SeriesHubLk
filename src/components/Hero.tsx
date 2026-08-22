import React from "react";
import { Crown } from "lucide-react";
import { SiteSettings } from "../types";

interface HeroProps {
  onNavigate?: (tab: string, param?: string) => void;
  settings?: SiteSettings;
  featuredTitle?: string;
  onWatchFeatured?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
}) => {
  const coverSrc = settings?.siteCoverUrl || "/cover.jpg";

  return (
    <div className="relative w-full overflow-hidden bg-neutral-950 border-b border-neutral-800/60 min-h-[280px] sm:min-h-[360px] md:min-h-[420px] lg:min-h-[480px] flex items-end">
      {/* Background Graphic: Full Cover Image Perfectly Visible */}
      <div className="absolute inset-0 z-0">
        <img
          src={coverSrc}
          alt="SeriesHub LK Cover"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center select-none pointer-events-none"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src.endsWith(".jpg")) {
              target.src = "/cover.png";
            } else if (target.src.endsWith(".png")) {
              target.src = "/assets/cover.png";
            }
          }}
        />

        {/* Soft, Transparent Ambient Gradient Layer to blend cleanly into the page */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent pointer-events-none"></div>
      </div>

      {/* Hero Content Overlay: Clean bottom badge */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Tagline Pill */}
          <div className="w-[390px] h-[45px] -mb-[160px] text-[27px] inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/50 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0"></span>
            <Crown className="w-6 h-6 text-amber-400 shrink-0" />
            <span className="text-[18px] mr-[1px] -mt-[6px] font-bold text-amber-300 drop-shadow-md whitespace-nowrap">
              {settings?.heroHeading || "ලොව ජනප්‍රිය TV Series & Films නිවහන"}
            </span>
          </div>

          {/* Resolution Badge */}
          <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-500/30 text-xs font-semibold text-neutral-200 flex items-center gap-2 shadow-lg ml-auto mr-[938px] mb-[30px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-white font-bold">1080p & 4K UHD</span>
            <span className="text-amber-400 font-bold">•</span>
            <span className="text-amber-300">සිංහල උපසිරැසි</span>
          </div>
        </div>
      </div>
    </div>
  );
};

