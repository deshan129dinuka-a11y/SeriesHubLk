import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { SearchModal } from "./components/SearchModal";
import { HomePage } from "./pages/HomePage";
import { FilmsPage } from "./pages/FilmsPage";
import { TVSeriesPage } from "./pages/TVSeriesPage";
import { CollectionsPage } from "./pages/CollectionsPage";
import { VIPMembershipPage } from "./pages/VIPMembershipPage";
import { ContactPage } from "./pages/ContactPage";
import { MovieDetailPage } from "./pages/MovieDetailPage";
import { TVSeriesDetailPage } from "./pages/TVSeriesDetailPage";
import { AdminPage } from "./pages/AdminPage";
import { Movie, TVSeries, MovieCollection, SiteSettings } from "./types";
import { api } from "./api";

export function App() {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [selectedCollectionSlug, setSelectedCollectionSlug] = useState<string | null>(null);
  const [initialFilmGenre, setInitialFilmGenre] = useState<string | undefined>(undefined);

  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [settings, setSettings] = useState<SiteSettings | undefined>(undefined);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Load site settings and check auth
  const loadSettings = async () => {
    try {
      const s = await api.getSettings();
      setSettings(s);
    } catch (e) {
      console.warn("Could not load settings:", e);
    }
  };

  useEffect(() => {
    loadSettings();
    api.checkAuth().then(setIsAdminLoggedIn);
  }, []);

  // Navigation router handler
  const handleNavigate = (tab: string, param?: string) => {
    if (tab === "films" && param) {
      setInitialFilmGenre(param);
    } else {
      setInitialFilmGenre(undefined);
    }

    if (tab === "movie" && param) {
      setSelectedMovieId(param);
      setCurrentTab("movie-detail");
    } else if (tab === "series-detail" && param) {
      setSelectedSeriesId(param);
      setCurrentTab("series-detail");
    } else if (tab === "collection-detail" && param) {
      setSelectedCollectionSlug(param);
      setCurrentTab("collections");
    } else {
      setSelectedMovieId(null);
      setSelectedSeriesId(null);
      setSelectedCollectionSlug(null);
      setCurrentTab(tab);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovieId(movie.slug || movie.id);
    setCurrentTab("movie-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectSeries = (series: TVSeries) => {
    setSelectedSeriesId(series.slug || series.id);
    setCurrentTab("series-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectCollection = (col: MovieCollection) => {
    setSelectedCollectionSlug(col.slug || col.id);
    setCurrentTab("collections");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-black font-sans">
      {/* Header */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchModalOpen(true)}
        settings={settings}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Page View */}
      <main className="flex-1">
        {currentTab === "home" && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectMovie={handleSelectMovie}
            onSelectSeries={handleSelectSeries}
            onSelectCollection={handleSelectCollection}
            settings={settings}
          />
        )}

        {currentTab === "films" && (
          <FilmsPage
            initialGenre={initialFilmGenre}
            onSelectMovie={handleSelectMovie}
          />
        )}

        {currentTab === "series" && (
          <TVSeriesPage onSelectSeries={handleSelectSeries} />
        )}

        {currentTab === "collections" && (
          <CollectionsPage
            initialCollectionSlug={selectedCollectionSlug || undefined}
            onSelectMovie={handleSelectMovie}
          />
        )}

        {currentTab === "vip" && (
          <VIPMembershipPage
            onNavigate={handleNavigate}
            settings={settings}
          />
        )}

        {currentTab === "contact" && (
          <ContactPage settings={settings} />
        )}

        {currentTab === "admin" && (
          <AdminPage
            onNavigateToMovie={handleSelectMovie}
            onNavigateToSeries={handleSelectSeries}
            settings={settings}
            onSettingsUpdated={loadSettings}
          />
        )}

        {currentTab === "movie-detail" && selectedMovieId && (
          <MovieDetailPage
            movieIdOrSlug={selectedMovieId}
            onBack={() => handleNavigate("films")}
            onSelectMovie={handleSelectMovie}
            onNavigateToCollection={(col) => handleNavigate("collections", col)}
          />
        )}

        {currentTab === "series-detail" && selectedSeriesId && (
          <TVSeriesDetailPage
            seriesIdOrSlug={selectedSeriesId}
            onBack={() => handleNavigate("series")}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} settings={settings} />

      {/* Global Instant Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectMovie={handleSelectMovie}
        onSelectSeries={handleSelectSeries}
      />
    </div>
  );
}

export default App;
