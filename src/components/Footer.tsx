import React from "react";
import { Film, Tv, Shield, Send, Heart, Play, Crown } from "lucide-react";
import { SiteSettings } from "../types";

interface FooterProps {
  onNavigate: (tab: string, param?: string) => void;
  settings?: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, settings }) => {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-800/80 text-neutral-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Branding & Intro */}
          <div className="md:col-span-2 space-y-4">
            <div
              id="footer-logo"
              onClick={() => onNavigate("home")}
              className="flex items-center gap-3.5 cursor-pointer group w-fit select-none"
            >
              <div className="w-12 h-12 rounded-full bg-neutral-950 border-2 border-amber-400/80 flex items-center justify-center shadow-lg overflow-hidden group-hover:border-amber-400 transition-colors">
                <img
                  src={settings?.siteLogoUrl || "/logo.png"}
                  alt="SeriesHubLk"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center rounded-full scale-122 group-hover:scale-130 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/logo.jpg";
                  }}
                />
              </div>
              <span className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors tracking-wide">
                SERIES<span className="text-amber-400">HUB</span>
                <span className="ml-1 text-xs bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">
                  LK
                </span>
              </span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-md">
              ලොව ජනප්‍රියම ඉංග්‍රීසි, කොරියානු සහ හොලිවුඩ් චිත්‍රපට හා ටීවී සීරීස් සඳහා ඉහළම ගුණාත්මකභාවයෙන් යුතු සිංහල උපසිරැසි සහ 1080p Full HD වීඩියෝ බාගත කරගැනීමට ඇති ශ්‍රී ලාංකේය ප්‍රමුඛතම සිනමා කේන්ද්‍රස්ථානයයි.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {settings?.telegramUrl && (
                <a
                  href={settings.telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-sky-600 text-sky-400 hover:text-white border border-neutral-800 transition-all text-xs font-semibold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram Channel</span>
                </a>
              )}
              {settings?.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-red-600 text-red-400 hover:text-white border border-neutral-800 transition-all text-xs font-semibold flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>YouTube</span>
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-base tracking-wide border-b border-neutral-800 pb-2 flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" />
              <span>ප්‍රවර්ග (Categories)</span>
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate("films")}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  නවතම චිත්‍රපට (Latest Films)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("series")}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  ටීවී සීරීස් (TV Series)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("collections")}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  චිත්‍රපට එකතු (Movie Collections)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("films", "Action")}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  ක්‍රියාදාම චිත්‍රපට (Action Movies)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Admin */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-base tracking-wide border-b border-neutral-800 pb-2 flex items-center gap-2">
              <Tv className="w-4 h-4 text-amber-400" />
              <span>සම්බන්ධතා & කළමනාකරණය</span>
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate("vip")}
                  className="text-amber-400 font-semibold hover:text-amber-300 transition-colors text-left flex items-center gap-1.5"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>VIP සාමාජිකත්වය (VIP Club)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("contact")}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  අප අමතන්න (Contact Us)
                </button>
              </li>
              <li>
                <span className="text-neutral-500 block text-xs">
                  Email: {settings?.contactEmail || "info@serieshub.lk"}
                </span>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("admin")}
                  className="text-amber-400/90 hover:text-amber-300 transition-colors flex items-center gap-1.5 pt-2 font-medium"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Dashboard</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-10 mt-10 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© 2026 SeriesHubLk. සියලු හිමිකම් ඇවිරිණි (All Rights Reserved).</p>
          <div className="flex items-center gap-1 text-neutral-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for Sinhala Cinema Lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
