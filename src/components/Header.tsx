import React, { useState } from "react";
import { Search, Film, Tv, Layers, Mail, Shield, Menu, X, Play, Sparkles, Crown } from "lucide-react";
import { SiteSettings } from "../types";

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
  onOpenSearch: () => void;
  settings?: SiteSettings;
  isAdminLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenSearch,
  settings,
  isAdminLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "HOME", icon: Play },
    { id: "films", label: "Films", icon: Film },
    { id: "series", label: "Tv Series", icon: Tv },
    { id: "collections", label: "Movie Collections", icon: Layers },
    { id: "vip", label: "VIP Membership", icon: Crown, isVIP: true },
    { id: "contact", label: "Contact Us", icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800/60 shadow-2xl transition-all">
      {/* Top micro banner if configured */}
      {settings?.noticeBanner && (
        <div className="bg-gradient-to-r from-amber-600/90 via-red-600/90 to-amber-600/90 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide shadow-inner flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>{settings.noticeBanner}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            id="site-logo"
            onClick={() => onNavigate("home")}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="relative">
              {/* Neon Glow around logo */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-sky-500 rounded-full blur-md opacity-80 group-hover:opacity-100 group-hover:blur-lg transition duration-300"></div>
              <div className="relative w-13 h-13 rounded-full bg-neutral-950 border-2 border-amber-400/90 flex items-center justify-center overflow-hidden shadow-2xl">
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
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-wider text-white group-hover:text-amber-400 transition-colors">
                  SERIES<span className="text-amber-400">HUB</span>
                  <span className="ml-1 text-xs bg-red-600 text-white px-1.5 py-0.5 rounded font-bold tracking-normal shadow-sm">
                    LK
                  </span>
                </span>
              </div>
              <span className="text-[10.5px] text-neutral-400 font-semibold tracking-wider -mt-0.5">
                DISCOVER. WATCH. ENJOY.
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 w-[536px]">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              const isVIP = item.id === "vip";
              const isHome = item.id === "home";
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`relative px-3.5 lg:px-4 py-2 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    isHome ? "w-[72px] px-[14px] ml-1.5" : ""
                  } ${
                    active
                      ? "text-amber-400 bg-neutral-900/90 shadow-md border border-amber-500/30"
                      : isVIP
                      ? "text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 border border-amber-500/20"
                      : "text-neutral-300 hover:text-white hover:bg-neutral-900/50"
                  }`}
                >
                  {isVIP && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b]"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              id="header-search-btn"
              onClick={onOpenSearch}
              className="flex items-center gap-2 ml-1 px-3.5 py-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-amber-500/40 transition-all text-xs font-medium group cursor-pointer shadow-sm"
              title="සෙවීම (Search)"
            >
              <Search className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-neutral-400">චිත්‍රපට / සීරීස් සොයන්න...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-neutral-800 text-neutral-400 rounded border border-neutral-700">
                ⌘K
              </kbd>
            </button>

            {/* Admin Portal Shortcut */}
            <button
              id="header-admin-btn"
              onClick={() => onNavigate("admin")}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                currentTab === "admin"
                  ? "bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                  : isAdminLoggedIn
                  ? "bg-emerald-950/60 text-emerald-400 border-emerald-700 hover:bg-emerald-900/60"
                  : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-amber-400 hover:border-neutral-700"
              }`}
              title={isAdminLoggedIn ? "Admin Panel (සක්‍රියයි)" : "Admin Login"}
            >
              <Shield className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-neutral-900 text-neutral-300 border border-neutral-800 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-950/98 border-b border-neutral-800 px-4 py-4 space-y-2 animate-fadeIn shadow-2xl">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  active
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "text-neutral-300 hover:bg-neutral-900"
                }`}
              >
                <item.icon className="w-5 h-5 text-amber-400" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
            <button
              id="mobile-nav-search"
              onClick={() => {
                onOpenSearch();
                setMobileMenuOpen(false);
              }}
              className="flex-1 mr-2 py-2.5 bg-neutral-900 text-neutral-200 rounded-xl flex items-center justify-center gap-2 text-sm border border-neutral-800"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span>සෙවීම</span>
            </button>
            <button
              id="mobile-nav-admin"
              onClick={() => {
                onNavigate("admin");
                setMobileMenuOpen(false);
              }}
              className="px-4 py-2.5 bg-amber-500 text-black font-semibold rounded-xl text-sm flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
