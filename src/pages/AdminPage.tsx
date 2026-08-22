import React, { useState, useEffect } from "react";
import {
  Shield,
  Film,
  Tv,
  Layers,
  FileText,
  Settings,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  Search,
  Upload,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ExternalLink,
  Star,
  RefreshCcw,
  MessageSquare,
  Eye,
  Images,
  Image as ImageIcon,
  Download,
  AlertTriangle,
  X,
  Loader2,
  Crown,
  HardDrive,
  Link2,
  Zap,
  Check,
  Globe,
} from "lucide-react";
import { Movie, TVSeries, MovieCollection, SubtitleFile, SiteSettings, AdminStats, Season, Episode } from "../types";
import { api } from "../api";
import { SampleImagesManager } from "../components/SampleImagesManager";
import { SeasonEpisodeManager } from "../components/SeasonEpisodeManager";

interface AdminPageProps {
  onNavigateToMovie: (movie: Movie) => void;
  onNavigateToSeries: (series: TVSeries) => void;
  settings?: SiteSettings;
  onSettingsUpdated: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  onNavigateToMovie,
  onNavigateToSeries,
  settings,
  onSettingsUpdated,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "add-movie"
    | "add-series"
    | "movies"
    | "series"
    | "vip-series"
    | "collections"
    | "subtitles"
    | "settings"
  >("dashboard");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [moviesList, setMoviesList] = useState<Movie[]>([]);
  const [seriesList, setSeriesList] = useState<TVSeries[]>([]);
  const [collectionsList, setCollectionsList] = useState<MovieCollection[]>([]);
  const [subtitlesList, setSubtitlesList] = useState<SubtitleFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "movie" | "series" | "subtitle";
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // VIP TV Series Management States
  const [vipSearchQuery, setVipSearchQuery] = useState<string>("");
  const [vipFilterTab, setVipFilterTab] = useState<"all" | "vip-only" | "non-vip">("all");
  const [editingVipSeries, setEditingVipSeries] = useState<TVSeries | null>(null);
  const [vipFormData, setVipFormData] = useState<{
    isVip: boolean;
    vipTier: "all" | "silver" | "gold" | "platinum";
    vipDriveLink: string;
    vipMegaLink: string;
    vipTelegramCode: string;
    vipNotes: string;
  }>({
    isVip: true,
    vipTier: "all",
    vipDriveLink: "",
    vipMegaLink: "",
    vipTelegramCode: "",
    vipNotes: "",
  });
  const [isSavingVip, setIsSavingVip] = useState<boolean>(false);

  // Manage Movies Filter & Edit States
  const [movieSearchQuery, setMovieSearchQuery] = useState<string>("");
  const [movieFilterTab, setMovieFilterTab] = useState<"all" | "sinhala-sub" | "vip" | "featured">("all");
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [movieEditForm, setMovieEditForm] = useState<any>(null);
  const [isSavingMovie, setIsSavingMovie] = useState<boolean>(false);
  const [isGeneratingMovieAi, setIsGeneratingMovieAi] = useState<boolean>(false);
  const [movieAiPromptNote, setMovieAiPromptNote] = useState<string>("");

  // Manage Series Filter & Edit States
  const [seriesSearchQuery, setSeriesSearchQuery] = useState<string>("");
  const [seriesFilterTab, setSeriesFilterTab] = useState<"all" | "sinhala-sub" | "vip" | "featured">("all");
  const [editingSeries, setEditingSeries] = useState<TVSeries | null>(null);
  const [seriesEditForm, setSeriesEditForm] = useState<any>(null);
  const [isSavingSeries, setIsSavingSeries] = useState<boolean>(false);
  const [isGeneratingSeriesAi, setIsGeneratingSeriesAi] = useState<boolean>(false);
  const [seriesAiPromptNote, setSeriesAiPromptNote] = useState<string>("");

  // Dedicated Seasons & Episodes Management Modal States
  const [manageSeasonsSeries, setManageSeasonsSeries] = useState<TVSeries | null>(null);
  const [manageSeasonsList, setManageSeasonsList] = useState<Season[]>([]);
  const [isLoadingSeasons, setIsLoadingSeasons] = useState<boolean>(false);
  const [isSavingSeasons, setIsSavingSeasons] = useState<boolean>(false);

  // Add Movie & Add Series AI Assistant States
  const [isGeneratingAddMovieAi, setIsGeneratingAddMovieAi] = useState<boolean>(false);
  const [addMovieAiPromptNote, setAddMovieAiPromptNote] = useState<string>("");
  const [isGeneratingAddSeriesAi, setIsGeneratingAddSeriesAi] = useState<boolean>(false);
  const [addSeriesAiPromptNote, setAddSeriesAiPromptNote] = useState<string>("");

  // Form states: Movie IMDb fetcher
  const [movieImdbId, setMovieImdbId] = useState<string>("tt0848228");
  const [fetchingMovie, setFetchingMovie] = useState<boolean>(false);
  const [movieFormData, setMovieFormData] = useState<any>({
    title: "",
    originalTitle: "",
    year: 2026,
    rating: 8.5,
    imdbId: "",
    overview: "",
    sinhalaDescription: "",
    posterUrl: "",
    backdropUrl: "",
    trailerUrl: "",
    streamingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    videoDownloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    genres: ["Action", "Sci-Fi"],
    director: "",
    cast: [],
    runtime: "2h 23m",
    contentRating: "PG-13",
    collectionName: "",
    hasSinhalaSub: true,
    isFeatured: true,
    isPublished: true,
    images: [],
  });

  // Form states: TV Series IMDb fetcher
  const [seriesImdbId, setSeriesImdbId] = useState<string>("tt0944947");
  const [fetchingSeries, setFetchingSeries] = useState<boolean>(false);
  const [seriesFormData, setSeriesFormData] = useState<any>({
    title: "",
    originalTitle: "",
    year: 2026,
    rating: 9.0,
    imdbId: "",
    overview: "",
    sinhalaDescription: "",
    posterUrl: "",
    backdropUrl: "",
    trailerUrl: "",
    streamingUrl: "",
    genres: ["Drama", "Action", "Fantasy"],
    creators: [],
    seasonsCount: 1,
    contentRating: "TV-MA",
    hasSinhalaSub: true,
    isFeatured: true,
    isPublished: true,
    images: [],
    seasons: [],
  });

  // Settings form state
  const [siteSettingsForm, setSiteSettingsForm] = useState<SiteSettings>(
    settings || {
      siteName: "SeriesHubLk",
      heroHeading: "ලොව ජනප්‍රිය TV Series & Films නිවහන",
      heroSubheading: "",
      noticeBanner: "✨ SeriesHubLk වෙත සාදරයෙන් පිළිගනිමු! නවතම චිත්‍රපට සහ ටීවී සීරීස් දිනපතා එක්කෙරේ.",
      contactEmail: "info@serieshub.lk",
      telegramUrl: "https://t.me/SeriesHubLk",
      youtubeUrl: "https://youtube.com/@SeriesHubLk",
      tmdbApiKey: "4a1a05db269fb2395c9b055504a95439",
      siteLogoUrl: "/logo.png",
      siteCoverUrl: "/cover.jpg",
    }
  );

  const [uploadingCover, setUploadingCover] = useState<boolean>(false);
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);

  useEffect(() => {
    if (settings) {
      setSiteSettingsForm(settings);
    }
  }, [settings]);

  // Subtitle upload state
  const [subTargetType, setSubTargetType] = useState<"movie" | "episode">("movie");
  const [subTargetId, setSubTargetId] = useState<string>("");
  const [subTargetTitle, setSubTargetTitle] = useState<string>("");
  const [subLanguage, setSubLanguage] = useState<string>("Sinhala");
  const [subFile, setSubFile] = useState<File | null>(null);

  // Check auth on mount
  useEffect(() => {
    async function initAuth() {
      const ok = await api.checkAuth();
      setIsAuthenticated(ok);
      if (ok) {
        loadAdminData();
      }
    }
    initAuth();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [st, mRes, sRes, colRes, subRes] = await Promise.all([
        api.getAdminStats(),
        api.getMovies({ publishedOnly: false, limit: 100 }),
        api.getTVSeries({ publishedOnly: false, limit: 100 }),
        api.getCollections(),
        api.getSubtitles(),
      ]);
      setStats(st);
      setMoviesList(mRes.movies || []);
      setSeriesList(sRes.series || []);
      setCollectionsList(colRes || []);
      setSubtitlesList(subRes || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorBanner(msg);
    setTimeout(() => setErrorBanner(null), 5000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAuthError(null);
      await api.login(passwordInput);
      setIsAuthenticated(true);
      showSuccess("සාර්ථකව Admin ගිණුමට ඇතුළු විය!");
      loadAdminData();
    } catch (err: any) {
      setAuthError(err.message || "මුරපදය වැරදියි.");
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
  };

  // Movie Fetcher via TMDB + Gemini AI
  const handleFetchMovieMetadata = async () => {
    if (!movieImdbId.trim().startsWith("tt")) {
      showError("කරුණාකර වලංගු IMDb ID එකක් ඇතුළත් කරන්න (උදා: tt0848228 හෝ tt4154796).");
      return;
    }

    try {
      setFetchingMovie(true);
      const data = await api.fetchTmdbMovie(movieImdbId.trim());
      setMovieFormData({
        title: data.title,
        originalTitle: data.originalTitle || data.title,
        year: data.year || 2026,
        rating: data.rating || 8.0,
        imdbId: data.imdbId,
        overview: data.overview || "",
        sinhalaDescription: data.sinhalaDescription || "",
        posterUrl: data.posterUrl || "",
        backdropUrl: data.backdropUrl || "",
        trailerUrl: data.trailerUrl || "",
        streamingUrl: movieFormData.streamingUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        videoDownloadUrl: movieFormData.videoDownloadUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        genres: data.genres || ["Action"],
        director: data.director || "",
        cast: data.cast || [],
        runtime: data.runtime || "2h 10m",
        contentRating: "PG-13",
        collectionName: data.collectionName || "",
        hasSinhalaSub: true,
        isFeatured: true,
        isPublished: true,
        images: data.images || [],
      });
      showSuccess(`"${data.title}" සඳහා TMDB දත්ත සහ සිංහල විස්තරය සාර්ථකව උකහා ගන්නා ලදී!`);
    } catch (err: any) {
      showError(err.message || "TMDB දත්ත ලබාගැනීමට නොහැකි විය.");
    } finally {
      setFetchingMovie(false);
    }
  };

  // Create Movie
  const handleCreateMovieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.createMovie(movieFormData);
      showSuccess(`"${movieFormData.title}" චිත්‍රපටය සාර්ථකව ප්‍රකාශයට පත් කරන ලදී!`);
      loadAdminData();
      setActiveTab("movies");
    } catch (err: any) {
      showError(err.message || "චිත්‍රපටය එක්කිරීම අසාර්ථක විය.");
    } finally {
      setLoading(false);
    }
  };

  // TV Series Fetcher via TMDB + Gemini AI
  const handleFetchSeriesMetadata = async () => {
    if (!seriesImdbId.trim().startsWith("tt")) {
      showError("කරුණාකර වලංගු IMDb ID එකක් ඇතුළත් කරන්න (උදා: tt0944947 හෝ tt0903747).");
      return;
    }

    try {
      setFetchingSeries(true);
      const data = await api.fetchTmdbSeries(seriesImdbId.trim());
      const defaultSeasons: Season[] = (data.seasons && data.seasons.length > 0)
        ? data.seasons.map((s: any, sIdx: number) => ({
            id: s.id || `temp-seas-${s.seasonNumber || sIdx + 1}-${Date.now()}`,
            seriesId: "",
            seasonNumber: s.seasonNumber || sIdx + 1,
            name: s.name || `Season ${(s.seasonNumber || sIdx + 1) < 10 ? `0${s.seasonNumber || sIdx + 1}` : s.seasonNumber || sIdx + 1}`,
            overview: s.overview || "",
            sinhalaDescription: s.sinhalaDescription || "",
            posterUrl: s.posterUrl || data.posterUrl || "",
            episodesCount: s.episodes?.length || s.episodeCount || 1,
            episodes: (s.episodes && s.episodes.length > 0)
              ? s.episodes.map((ep: any, epIdx: number) => ({
                  id: ep.id || `temp-ep-${s.seasonNumber || sIdx + 1}-${ep.episodeNumber || epIdx + 1}-${Date.now()}`,
                  seasonId: s.id || "",
                  seasonNumber: s.seasonNumber || sIdx + 1,
                  episodeNumber: ep.episodeNumber || epIdx + 1,
                  title: ep.title || `Episode ${ep.episodeNumber || epIdx + 1}`,
                  overview: ep.overview || "",
                  airDate: ep.airDate || `${data.year || 2026}`,
                  runtime: ep.runtime || 45,
                  thumbnailUrl: ep.thumbnailUrl || ep.stillUrl || data.backdropUrl || data.posterUrl || "",
                  stillUrl: ep.stillUrl || ep.thumbnailUrl || data.backdropUrl || data.posterUrl || "",
                  video720pUrl: ep.video720pUrl || "",
                  video1080pUrl: ep.video1080pUrl || "",
                  download720pUrl: ep.download720pUrl || "",
                  download1080pUrl: ep.download1080pUrl || "",
                  download720pSize: ep.download720pSize || "450 MB",
                  download1080pSize: ep.download1080pSize || "1.1 GB",
                  subtitleUrl: ep.subtitleUrl || "",
                  subtitleFileName: ep.subtitleFileName || "",
                  hasSinhalaSub: ep.hasSinhalaSub ?? true,
                  published: ep.published ?? true,
                }))
              : [
                  {
                    id: `temp-ep-${s.seasonNumber || sIdx + 1}-1-${Date.now()}`,
                    seasonId: "",
                    seasonNumber: s.seasonNumber || sIdx + 1,
                    episodeNumber: 1,
                    title: "Episode 01",
                    airDate: `${data.year || 2026}`,
                    runtime: 45,
                    overview: "",
                    video720pUrl: "",
                    video1080pUrl: "",
                    download720pUrl: "",
                    download1080pUrl: "",
                    download720pSize: "450 MB",
                    download1080pSize: "1.1 GB",
                    subtitleUrl: "",
                    subtitleFileName: "",
                    hasSinhalaSub: true,
                    published: true,
                  },
                ],
          }))
        : [
            {
              id: `temp-seas-1`,
              seriesId: "",
              seasonNumber: 1,
              name: "Season 01",
              overview: data.overview || "",
              sinhalaDescription: data.sinhalaDescription || "",
              episodesCount: 1,
              episodes: [
                {
                  id: `temp-ep-1-1`,
                  seasonId: "temp-seas-1",
                  seasonNumber: 1,
                  episodeNumber: 1,
                  title: "Episode 01",
                  airDate: `${data.year || 2026}`,
                  runtime: 45,
                  overview: "",
                  video720pUrl: "",
                  video1080pUrl: "",
                  download720pUrl: "",
                  download1080pUrl: "",
                  download720pSize: "450 MB",
                  download1080pSize: "1.1 GB",
                  subtitleUrl: "",
                  subtitleFileName: "",
                  hasSinhalaSub: true,
                  published: true,
                },
              ],
            },
          ];

      setSeriesFormData({
        title: data.title,
        originalTitle: data.originalTitle || data.title,
        year: data.year || 2026,
        rating: data.rating || 9.0,
        imdbId: data.imdbId,
        overview: data.overview || "",
        sinhalaDescription: data.sinhalaDescription || "",
        posterUrl: data.posterUrl || "",
        backdropUrl: data.backdropUrl || "",
        trailerUrl: data.trailerUrl || "",
        streamingUrl: "",
        genres: data.genres || ["Drama", "Action"],
        creators: data.creators || [],
        seasonsCount: defaultSeasons.length,
        episodesCount: defaultSeasons.reduce((acc, s) => acc + (s.episodes?.length || 0), 0),
        contentRating: "TV-MA",
        hasSinhalaSub: true,
        isFeatured: true,
        isPublished: true,
        images: data.images || [],
        seasons: defaultSeasons,
      });
      showSuccess(`"${data.title}" ටීවී සීරීස් සඳහා Seasons සහ සිංහල විස්තරය සාර්ථකව උකහා ගන්නා ලදී!`);
    } catch (err: any) {
      showError(err.message || "TMDB සීරීස් දත්ත ලබාගැනීමට නොහැකි විය.");
    } finally {
      setFetchingSeries(false);
    }
  };

  // Create Series
  const handleCreateSeriesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.createTVSeries(seriesFormData);
      showSuccess(`"${seriesFormData.title}" ටීවී සීරීස් සාර්ථකව ප්‍රකාශයට පත් කරන ලදී!`);
      loadAdminData();
      setActiveTab("series");
    } catch (err: any) {
      showError(err.message || "ටීවී සීරීස් එක්කිරීම අසාර්ථක විය.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Request Triggers
  const requestDeleteMovie = (id: string, title: string) => {
    setDeleteTarget({ type: "movie", id, title });
  };

  const requestDeleteSeries = (id: string, title: string) => {
    setDeleteTarget({ type: "series", id, title });
  };

  const requestDeleteSubtitle = (id: string, fileName: string) => {
    setDeleteTarget({ type: "subtitle", id, title: fileName });
  };

  // Execute Deletion
  const executeDelete = async () => {
    if (!deleteTarget) return;
    const { type, id, title } = deleteTarget;
    try {
      setIsDeleting(true);
      if (type === "movie") {
        await api.deleteMovie(id);
        setMoviesList((prev) => prev.filter((m) => m.id !== id));
        showSuccess(`"${title}" චිත්‍රපටය සාර්ථකව මකා දමන ලදී.`);
      } else if (type === "series") {
        await api.deleteTVSeries(id);
        setSeriesList((prev) => prev.filter((s) => s.id !== id));
        showSuccess(`"${title}" ටීවී සීරීස් සාර්ථකව මකා දමන ලදී.`);
      } else if (type === "subtitle") {
        await api.deleteSubtitle(id);
        setSubtitlesList((prev) => prev.filter((s) => s.id !== id));
        showSuccess(`"${title}" උපසිරැසිය සාර්ථකව මකා දමන ලදී.`);
      }
      setDeleteTarget(null);
      loadAdminData();
    } catch (err: any) {
      showError(err.message || "මකා දැමීම අසාර්ථක විය.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Subtitle Upload Handler
  const handleSubtitleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subFile) {
      showError("කරුණාකර උපසිරැසි ගොනුවක් තෝරන්න (.srt, .vtt, .ass).");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("subtitleFile", subFile);
      formData.append("targetType", subTargetType);
      formData.append("targetId", subTargetId);
      formData.append("targetTitle", subTargetTitle || subFile.name);
      formData.append("language", subLanguage);

      await api.uploadSubtitle(formData);
      showSuccess(`"${subFile.name}" උපසිරැසිය සාර්ථකව උඩුගත කරන ලදී!`);
      setSubFile(null);
      loadAdminData();
    } catch (err: any) {
      showError(err.message || "උපසිරැසි උඩුගත කිරීම අසාර්ථක විය.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Cover Image Upload
  const handleCoverFileUpload = async (file: File) => {
    try {
      setUploadingCover(true);
      const res = await api.uploadImage(file);
      const updated = { ...siteSettingsForm, siteCoverUrl: res.url };
      setSiteSettingsForm(updated);
      await api.updateSettings({ siteCoverUrl: res.url });
      showSuccess("Hero Cover Image එක සාර්ථකව Upload කර වෙබ් අඩවියට යොදන ලදී!");
      onSettingsUpdated();
    } catch (err: any) {
      showError(err.message || "Cover Image උඩුගත කිරීම අසාර්ථක විය.");
    } finally {
      setUploadingCover(false);
    }
  };

  // Handle Logo Upload
  const handleLogoFileUpload = async (file: File) => {
    try {
      setUploadingLogo(true);
      const res = await api.uploadImage(file);
      const updated = { ...siteSettingsForm, siteLogoUrl: res.url };
      setSiteSettingsForm(updated);
      await api.updateSettings({ siteLogoUrl: res.url });
      showSuccess("Site Logo එක සාර්ථකව Upload කර වෙබ් අඩවියට යොදන ලදී!");
      onSettingsUpdated();
    } catch (err: any) {
      showError(err.message || "Logo උඩුගත කිරීම අසාර්ථක විය.");
    } finally {
      setUploadingLogo(false);
    }
  };

  // Toggle VIP Status for a Series
  const handleToggleVipStatus = async (series: TVSeries) => {
    const newStatus = !series.isVip;
    try {
      setSeriesList((prev) =>
        prev.map((s) => (s.id === series.id ? { ...s, isVip: newStatus } : s))
      );
      await api.updateTVSeries(series.id, { isVip: newStatus });
      showSuccess(
        newStatus
          ? `👑 "${series.title}" සාර්ථකව VIP Tv Series ලැයිස්තුවට එක්කරන ලදී!`
          : `"${series.title}" සාමාන්‍ය (Standard) Series එකක් ලෙස සකසන ලදී.`
      );
    } catch (err: any) {
      showError(err.message || "VIP තත්ත්වය යාවත්කාලීන කිරීම අසාර්ථක විය.");
      loadAdminData();
    }
  };

  // Open VIP Config Modal
  const handleOpenVipModal = (series: TVSeries) => {
    setEditingVipSeries(series);
    setVipFormData({
      isVip: series.isVip ?? true,
      vipTier: series.vipTier || "all",
      vipDriveLink: series.vipDriveLink || "",
      vipMegaLink: series.vipMegaLink || "",
      vipTelegramCode: series.vipTelegramCode || "",
      vipNotes: series.vipNotes || "",
    });
  };

  // Save VIP Config Form
  const handleSaveVipConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVipSeries) return;
    try {
      setIsSavingVip(true);
      await api.updateTVSeries(editingVipSeries.id, vipFormData);
      setSeriesList((prev) =>
        prev.map((s) => (s.id === editingVipSeries.id ? { ...s, ...vipFormData } : s))
      );
      showSuccess(`👑 "${editingVipSeries.title}" VIP තොරතුරු සහ Links සාර්ථකව සුරැකිණි!`);
      setEditingVipSeries(null);
    } catch (err: any) {
      showError(err.message || "VIP තොරතුරු සුරැකීම අසාර්ථක විය.");
    } finally {
      setIsSavingVip(false);
    }
  };

  // ----------------------------------------------------
  // AI GENERATOR HANDLERS
  // ----------------------------------------------------
  const handleGenerateAiForAddMovie = async () => {
    if (!movieFormData.title) {
      showError("කරුණාකර පළමුව චිත්‍රපටයේ නම (Title) ඇතුළත් කරන්න.");
      return;
    }
    try {
      setIsGeneratingAddMovieAi(true);
      const desc = await api.generateSinhalaDescription({
        title: movieFormData.title,
        year: movieFormData.year,
        genres: movieFormData.genres,
        overview: movieFormData.overview,
        directorOrCreator: movieFormData.director,
        type: "movie",
        cast: movieFormData.cast,
        rating: movieFormData.rating,
        runtimeOrSeasons: movieFormData.runtime,
        customPrompt: addMovieAiPromptNote,
      });
      setMovieFormData((prev: any) => ({ ...prev, sinhalaDescription: desc }));
      showSuccess("✨ Gemini AI මඟින් චිත්‍රපටයේ සිංහල විස්තරය සාර්ථකව සම්පාදනය කරන ලදී!");
    } catch (err: any) {
      showError(err.message || "AI සිංහල විස්තරය සෑදීමට නොහැකි විය.");
    } finally {
      setIsGeneratingAddMovieAi(false);
    }
  };

  const handleGenerateAiForAddSeries = async () => {
    if (!seriesFormData.title) {
      showError("කරුණාකර පළමුව TV Series නම (Title) ඇතුළත් කරන්න.");
      return;
    }
    try {
      setIsGeneratingAddSeriesAi(true);
      const desc = await api.generateSinhalaDescription({
        title: seriesFormData.title,
        year: seriesFormData.year,
        genres: seriesFormData.genres,
        overview: seriesFormData.overview,
        directorOrCreator: seriesFormData.creators?.join(", "),
        type: "series",
        cast: seriesFormData.cast,
        rating: seriesFormData.rating,
        runtimeOrSeasons: `${seriesFormData.seasonsCount} Seasons`,
        customPrompt: addSeriesAiPromptNote,
      });
      setSeriesFormData((prev: any) => ({ ...prev, sinhalaDescription: desc }));
      showSuccess("✨ Gemini AI මඟින් TV Series හි සිංහල විස්තරය සාර්ථකව සම්පාදනය කරන ලදී!");
    } catch (err: any) {
      showError(err.message || "AI සිංහල විස්තරය සෑදීමට නොහැකි විය.");
    } finally {
      setIsGeneratingAddSeriesAi(false);
    }
  };

  // ----------------------------------------------------
  // MOVIE FULL EDIT MODAL HANDLERS
  // ----------------------------------------------------
  const handleOpenEditMovieModal = (movie: Movie) => {
    setEditingMovie(movie);
    setMovieAiPromptNote("");
    setMovieEditForm({
      title: movie.title || "",
      originalTitle: movie.originalTitle || "",
      year: movie.year || 2026,
      rating: movie.rating || 8.0,
      imdbId: movie.imdbId || "",
      overview: movie.overview || "",
      sinhalaDescription: movie.sinhalaDescription || "",
      posterUrl: movie.posterUrl || "",
      backdropUrl: movie.backdropUrl || "",
      trailerUrl: movie.trailerUrl || "",
      streamingUrl: movie.streamingUrl || "",
      downloadUrl: movie.downloadUrl || "",
      videoDownloadUrl: movie.videoDownloadUrl || "",
      downloadUrl1080p: movie.downloadUrl1080p || movie.videoDownloadUrl || "",
      downloadUrl720p: movie.downloadUrl720p || "",
      downloadUrl4k: movie.downloadUrl4k || "",
      megaDownloadUrl: movie.megaDownloadUrl || "",
      gdriveDownloadUrl: movie.gdriveDownloadUrl || "",
      torrentUrl: movie.torrentUrl || "",
      fileSize1080p: movie.fileSize1080p || "2.2 GB",
      fileSize720p: movie.fileSize720p || "980 MB",
      fileSize4k: movie.fileSize4k || "6.5 GB",
      genres: movie.genres || ["Action"],
      director: movie.director || "",
      cast: Array.isArray(movie.cast) ? movie.cast.join(", ") : movie.cast || "",
      runtime: movie.runtime || "2h 10m",
      contentRating: movie.contentRating || "PG-13",
      country: movie.country || "United States",
      language: movie.language || "English",
      collectionName: movie.collectionName || "",
      hasSinhalaSub: movie.hasSinhalaSub ?? true,
      isFeatured: movie.featured ?? movie.isFeatured ?? true,
      isPublished: movie.published ?? movie.isPublished ?? true,
      images: Array.isArray(movie.images)
        ? movie.images.map((img) => (typeof img === "string" ? img : (img as any).imageUrl)).filter(Boolean)
        : [],
      // VIP info
      isVip: movie.isVip ?? false,
      vipTier: movie.vipTier || "all",
      vipDriveLink: movie.vipDriveLink || "",
      vipMegaLink: movie.vipMegaLink || "",
      vipTelegramCode: movie.vipTelegramCode || "",
      vipNotes: movie.vipNotes || "",
    });
  };

  const handleGenerateAiForEditMovie = async () => {
    if (!movieEditForm?.title) {
      showError("කරුණාකර චිත්‍රපටයේ නම ඇතුළත් කරන්න.");
      return;
    }
    try {
      setIsGeneratingMovieAi(true);
      const castArray = typeof movieEditForm.cast === "string"
        ? movieEditForm.cast.split(",").map((s: string) => s.trim()).filter(Boolean)
        : movieEditForm.cast;

      const desc = await api.generateSinhalaDescription({
        title: movieEditForm.title,
        year: movieEditForm.year,
        genres: movieEditForm.genres,
        overview: movieEditForm.overview,
        directorOrCreator: movieEditForm.director,
        type: "movie",
        cast: castArray,
        rating: movieEditForm.rating,
        runtimeOrSeasons: movieEditForm.runtime,
        customPrompt: movieAiPromptNote,
      });
      setMovieEditForm((prev: any) => ({ ...prev, sinhalaDescription: desc }));
      showSuccess("✨ Gemini AI මඟින් සිංහල විස්තරය නැවත සකසන ලදී!");
    } catch (err: any) {
      showError(err.message || "AI සිංහල විස්තරය සෑදීමට නොහැකි විය.");
    } finally {
      setIsGeneratingMovieAi(false);
    }
  };

  const handleSaveEditMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie || !movieEditForm) return;

    try {
      setIsSavingMovie(true);
      const castArray = typeof movieEditForm.cast === "string"
        ? movieEditForm.cast.split(",").map((s: string) => s.trim()).filter(Boolean)
        : movieEditForm.cast;

      const imagesArray = Array.isArray(movieEditForm.images)
        ? movieEditForm.images
        : typeof movieEditForm.images === "string"
        ? movieEditForm.images.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

      const payload: Partial<Movie> = {
        title: movieEditForm.title,
        originalTitle: movieEditForm.originalTitle,
        year: Number(movieEditForm.year) || 2026,
        rating: Number(movieEditForm.rating) || 8.0,
        imdbId: movieEditForm.imdbId,
        overview: movieEditForm.overview,
        sinhalaDescription: movieEditForm.sinhalaDescription,
        posterUrl: movieEditForm.posterUrl,
        backdropUrl: movieEditForm.backdropUrl,
        trailerUrl: movieEditForm.trailerUrl,
        streamingUrl: movieEditForm.streamingUrl,
        videoDownloadUrl: movieEditForm.downloadUrl1080p || movieEditForm.videoDownloadUrl,
        downloadUrl: movieEditForm.downloadUrl1080p || movieEditForm.downloadUrl,
        downloadUrl1080p: movieEditForm.downloadUrl1080p,
        downloadUrl720p: movieEditForm.downloadUrl720p,
        downloadUrl4k: movieEditForm.downloadUrl4k,
        megaDownloadUrl: movieEditForm.megaDownloadUrl,
        gdriveDownloadUrl: movieEditForm.gdriveDownloadUrl,
        torrentUrl: movieEditForm.torrentUrl,
        fileSize1080p: movieEditForm.fileSize1080p,
        fileSize720p: movieEditForm.fileSize720p,
        fileSize4k: movieEditForm.fileSize4k,
        genres: movieEditForm.genres,
        director: movieEditForm.director,
        cast: castArray,
        runtime: movieEditForm.runtime,
        contentRating: movieEditForm.contentRating,
        country: movieEditForm.country,
        language: movieEditForm.language,
        collectionName: movieEditForm.collectionName,
        hasSinhalaSub: Boolean(movieEditForm.hasSinhalaSub),
        published: Boolean(movieEditForm.isPublished),
        isPublished: Boolean(movieEditForm.isPublished),
        featured: Boolean(movieEditForm.isFeatured),
        isFeatured: Boolean(movieEditForm.isFeatured),
        images: imagesArray,
        isVip: Boolean(movieEditForm.isVip),
        vipTier: movieEditForm.vipTier,
        vipDriveLink: movieEditForm.vipDriveLink,
        vipMegaLink: movieEditForm.vipMegaLink,
        vipTelegramCode: movieEditForm.vipTelegramCode,
        vipNotes: movieEditForm.vipNotes,
      };

      const updated = await api.updateMovie(editingMovie.id, payload);
      setMoviesList((prev) =>
        prev.map((m) => (m.id === editingMovie.id ? { ...m, ...payload, ...updated } : m))
      );
      showSuccess(`🎬 "${payload.title}" චිත්‍රපටයේ සියලු විස්තර සහ Links සාර්ථකව යාවත්කාලීන විය!`);
      setEditingMovie(null);
      setMovieEditForm(null);
    } catch (err: any) {
      showError(err.message || "චිත්‍රපටය සංස්කරණය කිරීම අසාර්ථක විය.");
    } finally {
      setIsSavingMovie(false);
    }
  };

  // ----------------------------------------------------
  // TV SERIES FULL EDIT MODAL HANDLERS
  // ----------------------------------------------------
  const handleOpenEditSeriesModal = async (series: TVSeries) => {
    setEditingSeries(series);
    setSeriesAiPromptNote("");
    setSeriesEditForm({
      title: series.title || "",
      originalTitle: series.originalTitle || "",
      year: series.year || 2026,
      rating: series.rating || 9.0,
      imdbId: series.imdbId || "",
      overview: series.overview || "",
      sinhalaDescription: series.sinhalaDescription || "",
      posterUrl: series.posterUrl || "",
      backdropUrl: series.backdropUrl || "",
      trailerUrl: series.trailerUrl || "",
      streamingUrl: series.streamingUrl || "",
      genres: series.genres || ["Drama", "Action"],
      creators: Array.isArray(series.creators) ? series.creators.join(", ") : series.creators || "",
      cast: Array.isArray(series.cast) ? series.cast.join(", ") : series.cast || "",
      seasonsCount: series.seasonsCount || 1,
      episodesCount: series.episodesCount || 0,
      contentRating: series.contentRating || "TV-MA",
      hasSinhalaSub: series.hasSinhalaSub ?? true,
      isFeatured: series.featured ?? series.isFeatured ?? true,
      isPublished: series.published ?? series.isPublished ?? true,
      images: Array.isArray(series.images)
        ? series.images.map((img) => (typeof img === "string" ? img : (img as any).imageUrl)).filter(Boolean)
        : [],
      // VIP info
      isVip: series.isVip ?? false,
      vipTier: series.vipTier || "all",
      vipDriveLink: series.vipDriveLink || "",
      vipMegaLink: series.vipMegaLink || "",
      vipTelegramCode: series.vipTelegramCode || "",
      vipNotes: series.vipNotes || "",
      seasons: [],
    });

    try {
      const full = await api.getTVSeriesById(series.id);
      if (full && Array.isArray(full.seasons)) {
        setSeriesEditForm((prev: any) => (prev ? { ...prev, seasons: full.seasons } : prev));
      }
    } catch (e) {
      console.warn("Could not pre-load seasons for edit modal", e);
    }
  };

  // Dedicated Seasons & Episodes Modal Handlers
  const handleOpenManageSeasonsModal = async (series: TVSeries) => {
    setManageSeasonsSeries(series);
    setIsLoadingSeasons(true);
    try {
      const full = await api.getTVSeriesById(series.id);
      let list = full.seasons || [];
      if (list.length === 0) {
        list = [
          {
            id: `temp-seas-${Date.now()}-1`,
            seriesId: series.id,
            seasonNumber: 1,
            name: "Season 01",
            overview: series.overview || "",
            sinhalaDescription: series.sinhalaDescription || "",
            episodesCount: 1,
            episodes: [
              {
                id: `temp-ep-${Date.now()}-1-1`,
                seasonNumber: 1,
                episodeNumber: 1,
                title: "Episode 01",
                airDate: `${series.year || 2026}`,
                runtime: 45,
                overview: "",
                video720pUrl: "",
                video1080pUrl: "",
                download720pUrl: "",
                download1080pUrl: "",
                download720pSize: "450 MB",
                download1080pSize: "1.1 GB",
                subtitleUrl: "",
                subtitleFileName: "",
                hasSinhalaSub: true,
                published: true,
              },
            ],
          },
        ];
      }
      setManageSeasonsList(list);
    } catch (err: any) {
      showError("Seasons දත්ත ලබාගැනීමට නොහැකි විය.");
      setManageSeasonsList([]);
    } finally {
      setIsLoadingSeasons(false);
    }
  };

  const handleSaveManageSeasons = async () => {
    if (!manageSeasonsSeries) return;
    try {
      setIsSavingSeasons(true);
      await api.syncSeriesSeasons(manageSeasonsSeries.id, manageSeasonsList);
      const totalEpisodes = manageSeasonsList.reduce((acc, s) => acc + (s.episodes?.length || 0), 0);
      const updated = await api.updateTVSeries(manageSeasonsSeries.id, {
        seasonsCount: manageSeasonsList.length,
        episodesCount: totalEpisodes,
      });
      setSeriesList((prev) =>
        prev.map((s) => (s.id === manageSeasonsSeries.id ? { ...s, ...updated } : s))
      );
      showSuccess(`🎬 "${manageSeasonsSeries.title}" හි Seasons, Episodes සහ Subtitles සාර්ථකව සුරැකිණි!`);
      setManageSeasonsSeries(null);
    } catch (err: any) {
      showError(err.message || "Seasons සුරැකීම අසාර්ථක විය.");
    } finally {
      setIsSavingSeasons(false);
    }
  };

  const handleGenerateAiForEditSeries = async () => {
    if (!seriesEditForm?.title) {
      showError("කරුණාකර TV Series නම ඇතුළත් කරන්න.");
      return;
    }
    try {
      setIsGeneratingSeriesAi(true);
      const castArray = typeof seriesEditForm.cast === "string"
        ? seriesEditForm.cast.split(",").map((s: string) => s.trim()).filter(Boolean)
        : seriesEditForm.cast;

      const desc = await api.generateSinhalaDescription({
        title: seriesEditForm.title,
        year: seriesEditForm.year,
        genres: seriesEditForm.genres,
        overview: seriesEditForm.overview,
        directorOrCreator: seriesEditForm.creators,
        type: "series",
        cast: castArray,
        rating: seriesEditForm.rating,
        runtimeOrSeasons: `${seriesEditForm.seasonsCount} Seasons`,
        customPrompt: seriesAiPromptNote,
      });
      setSeriesEditForm((prev: any) => ({ ...prev, sinhalaDescription: desc }));
      showSuccess("✨ Gemini AI මඟින් සිංහල විස්තරය නැවත සකසන ලදී!");
    } catch (err: any) {
      showError(err.message || "AI සිංහල විස්තරය සෑදීමට නොහැකි විය.");
    } finally {
      setIsGeneratingSeriesAi(false);
    }
  };

  const handleSaveEditSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeries || !seriesEditForm) return;

    try {
      setIsSavingSeries(true);
      const creatorsArray = typeof seriesEditForm.creators === "string"
        ? seriesEditForm.creators.split(",").map((s: string) => s.trim()).filter(Boolean)
        : seriesEditForm.creators;

      const castArray = typeof seriesEditForm.cast === "string"
        ? seriesEditForm.cast.split(",").map((s: string) => s.trim()).filter(Boolean)
        : seriesEditForm.cast;

      const imagesArray = Array.isArray(seriesEditForm.images)
        ? seriesEditForm.images
        : typeof seriesEditForm.images === "string"
        ? seriesEditForm.images.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

      const payload: Partial<TVSeries> & { seasons?: any[] } = {
        title: seriesEditForm.title,
        originalTitle: seriesEditForm.originalTitle,
        year: Number(seriesEditForm.year) || 2026,
        rating: Number(seriesEditForm.rating) || 9.0,
        imdbId: seriesEditForm.imdbId,
        overview: seriesEditForm.overview,
        sinhalaDescription: seriesEditForm.sinhalaDescription,
        posterUrl: seriesEditForm.posterUrl,
        backdropUrl: seriesEditForm.backdropUrl,
        trailerUrl: seriesEditForm.trailerUrl,
        streamingUrl: seriesEditForm.streamingUrl,
        genres: seriesEditForm.genres,
        creators: creatorsArray,
        cast: castArray,
        seasonsCount: Number(seriesEditForm.seasonsCount) || (seriesEditForm.seasons?.length || 1),
        episodesCount: Number(seriesEditForm.episodesCount) || 0,
        contentRating: seriesEditForm.contentRating,
        hasSinhalaSub: Boolean(seriesEditForm.hasSinhalaSub),
        published: Boolean(seriesEditForm.isPublished),
        isPublished: Boolean(seriesEditForm.isPublished),
        featured: Boolean(seriesEditForm.isFeatured),
        isFeatured: Boolean(seriesEditForm.isFeatured),
        images: imagesArray,
        isVip: Boolean(seriesEditForm.isVip),
        vipTier: seriesEditForm.vipTier,
        vipDriveLink: seriesEditForm.vipDriveLink,
        vipMegaLink: seriesEditForm.vipMegaLink,
        vipTelegramCode: seriesEditForm.vipTelegramCode,
        vipNotes: seriesEditForm.vipNotes,
        seasons: seriesEditForm.seasons,
      };

      const updated = await api.updateTVSeries(editingSeries.id, payload);
      setSeriesList((prev) =>
        prev.map((s) => (s.id === editingSeries.id ? { ...s, ...payload, ...updated } : s))
      );
      showSuccess(`📺 "${payload.title}" TV Series හි සියලු විස්තර සහ Links සාර්ථකව යාවත්කාලීන විය!`);
      setEditingSeries(null);
      setSeriesEditForm(null);
    } catch (err: any) {
      showError(err.message || "TV Series සංස්කරණය කිරීම අසාර්ථක විය.");
    } finally {
      setIsSavingSeries(false);
    }
  };

  // Image Upload helper for Edit Movie form
  const handleUploadMovieEditImage = async (file: File, field: "posterUrl" | "backdropUrl") => {
    try {
      const res = await api.uploadImage(file);
      setMovieEditForm((prev: any) => ({ ...prev, [field]: res.url }));
      showSuccess(`${field === "posterUrl" ? "Poster" : "Backdrop"} රූපය සාර්ථකව Upload විය!`);
    } catch (err: any) {
      showError(err.message || "රූපය උඩුගත කිරීම අසාර්ථක විය.");
    }
  };

  // Image Upload helper for Edit Series form
  const handleUploadSeriesEditImage = async (file: File, field: "posterUrl" | "backdropUrl") => {
    try {
      const res = await api.uploadImage(file);
      setSeriesEditForm((prev: any) => ({ ...prev, [field]: res.url }));
      showSuccess(`${field === "posterUrl" ? "Poster" : "Backdrop"} රූපය සාර්ථකව Upload විය!`);
    } catch (err: any) {
      showError(err.message || "රූපය උඩුගත කිරීම අසාර්ථක විය.");
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.updateSettings(siteSettingsForm);
      showSuccess("වෙබ් අඩවි සැකසුම් (Site Settings) සාර්ථකව යාවත්කාලීන විය!");
      onSettingsUpdated();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // Render Login View if not Authenticated
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 animate-fadeIn">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-sky-500 rounded-full blur-md opacity-80"></div>
              <div className="relative w-20 h-20 rounded-full bg-neutral-950 p-1 border-2 border-amber-400 flex items-center justify-center mx-auto shadow-2xl overflow-hidden">
                <img
                  src={settings?.siteLogoUrl || "/logo.png"}
                  alt="SeriesHubLk Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center rounded-full scale-122"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/logo.jpg";
                  }}
                />
              </div>
            </div>
            <h1 className="text-2xl font-black text-white">Admin Dashboard Login</h1>
            <p className="text-xs text-neutral-400">SeriesHubLk කළමනාකරණ පද්ධතියට ප්‍රවේශ වන්න</p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/80 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-300">Admin Password</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="මුරපදය ඇතුළත් කරන්න (Default: admin123)"
                className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>ප්‍රවේශ වන්න (Login)</span>
            </button>
          </form>

          <div className="text-center text-[11px] text-neutral-500 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
            පෙරනිමි මුරපදය: <strong className="text-neutral-300">admin123</strong>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Render Authenticated Dashboard
  // ----------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn pb-24">
      {/* Top Banner Alert */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-sm font-semibold flex items-center gap-3 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}
      {errorBanner && (
        <div className="p-4 rounded-xl bg-red-950/90 border border-red-500 text-red-200 text-sm font-semibold flex items-center gap-3 shadow-lg animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-black font-black text-xs">
              ADMIN CONTROL PANEL
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Connected
            </span>
          </div>
          <h1 className="text-3xl font-black text-white">SeriesHubLk කළමනාකරණය</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAdminData}
            className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
            title="Refresh Data"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Nav Tabs - Rendered in Two Distinct Lines so NO tabs are hidden */}
      <div className="space-y-2 border-b border-neutral-800/80 pb-3 text-xs font-semibold">
        {/* Line 1: Main Management & Add Content */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: Shield, isVip: false },
            { id: "add-movie", label: "+ Add Movie (IMDb)", icon: Film, isVip: false },
            { id: "add-series", label: "+ Add TV Series (IMDb)", icon: Tv, isVip: false },
            { id: "movies", label: `Manage Movies (${moviesList.length})`, icon: Film, isVip: false },
            { id: "series", label: `Manage Series (${seriesList.length})`, icon: Tv, isVip: false },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2.5 rounded-xl flex items-center justify-center sm:justify-start gap-2 transition-all cursor-pointer text-center sm:text-left ${
                  active
                    ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20 ring-1 ring-amber-400"
                    : "bg-neutral-900/90 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800"
                }`}
              >
                <tab.icon className={`w-4 h-4 shrink-0 ${active ? "text-black" : "text-amber-400/80"}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Line 2: VIP, Collections, Subtitles, Settings */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            {
              id: "vip-series",
              label: `VIP Tv Series (${seriesList.filter((s) => s.isVip).length})`,
              icon: Crown,
              isVip: true,
            },
            { id: "collections", label: `Collections (${collectionsList.length})`, icon: Layers, isVip: false },
            { id: "subtitles", label: `Subtitles (${subtitlesList.length})`, icon: FileText, isVip: false },
            { id: "settings", label: "Site Settings", icon: Settings, isVip: false },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2.5 rounded-xl flex items-center justify-center sm:justify-start gap-2 transition-all cursor-pointer text-center sm:text-left ${
                  active
                    ? tab.isVip
                      ? "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-black font-black shadow-lg shadow-amber-500/30 border border-amber-300 ring-2 ring-amber-400"
                      : "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20 ring-1 ring-amber-400"
                    : tab.isVip
                    ? "bg-amber-950/60 text-amber-300 hover:bg-amber-900/70 hover:text-amber-200 border border-amber-500/50 shadow-sm"
                    : "bg-neutral-900/90 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800"
                }`}
              >
                <tab.icon className={`w-4 h-4 shrink-0 ${tab.isVip && !active ? "text-amber-400 animate-pulse" : ""}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB: DASHBOARD OVERVIEW */}
      {/* ---------------------------------------------------- */}
      {activeTab === "dashboard" && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
              <span className="text-xs text-neutral-400 font-bold">චිත්‍රපට (Films)</span>
              <div className="text-3xl font-black text-amber-400">{stats?.totalMovies || moviesList.length}</div>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
              <span className="text-xs text-neutral-400 font-bold">ටීවී සීරීස්</span>
              <div className="text-3xl font-black text-sky-400">{stats?.totalSeries || seriesList.length}</div>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
              <span className="text-xs text-neutral-400 font-bold">Seasons & Episodes</span>
              <div className="text-3xl font-black text-purple-400">{stats?.totalEpisodes || 0}</div>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
              <span className="text-xs text-neutral-400 font-bold">චිත්‍රපට එකතු</span>
              <div className="text-3xl font-black text-emerald-400">{stats?.totalCollections || collectionsList.length}</div>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
              <span className="text-xs text-neutral-400 font-bold">උපසිරැසි (Subs)</span>
              <div className="text-3xl font-black text-pink-400">{stats?.totalSubtitles || subtitlesList.length}</div>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
              <span className="text-xs text-neutral-400 font-bold">පණිවිඩ (Messages)</span>
              <div className="text-3xl font-black text-blue-400">{stats?.totalContactMessages || 0}</div>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => setActiveTab("add-movie")}
              className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/40 to-neutral-900 border border-amber-500/40 hover:border-amber-500 cursor-pointer transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <Film className="w-8 h-8 text-amber-400" />
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white">IMDb ID මඟින් චිත්‍රපට එක්කරන්න</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                IMDb ID එක ලබාදී ක්ලික් එකකින් TMDB දත්ත, ඡායාරූප 6ක් සහ Gemini AI සිංහල විස්තරය ස්වයංක්‍රීයව ලබාගන්න.
              </p>
            </div>

            <div
              onClick={() => setActiveTab("add-series")}
              className="p-6 rounded-2xl bg-gradient-to-br from-sky-950/40 to-neutral-900 border border-sky-500/40 hover:border-sky-500 cursor-pointer transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <Tv className="w-8 h-8 text-sky-400" />
                <Sparkles className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-lg font-bold text-white">IMDb ID මඟින් TV Series එක්කරන්න</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                කතා මාලාවේ සියලුම Seasons, Episodes සහ සිංහල විස්තරය TMDB හා Gemini AI මඟින් ලබාගන්න.
              </p>
            </div>

            <div
              onClick={() => setActiveTab("subtitles")}
              className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-neutral-900 border border-emerald-500/40 hover:border-emerald-500 cursor-pointer transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <FileText className="w-8 h-8 text-emerald-400" />
                <Upload className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">සිංහල උපසිරැසි ගොනු (.srt) Upload කරන්න</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                ඕනෑම චිත්‍රපටයක් හෝ කතාංගයක් සඳහා .srt, .vtt, .ass ගොනු උඩුගත කර කළමනාකරණය කරන්න.
              </p>
            </div>
          </div>

          {/* Dedicated Dashboard Quick Brand Assets & Upload Section */}
          <div className="bg-neutral-900/90 rounded-3xl border-2 border-amber-500/40 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-black tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>DASHBOARD QUICK BRANDING</span>
                </div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Images className="w-5 h-5 text-amber-400" />
                  <span>Cover Image & Logo කළමනාකරණය (Manual Uploads)</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  වෙබ් අඩවියේ Hero Banner එක සහ Site Logo එක ඔබගේ පරිගණකයෙන් / දුරකථනයෙන් පහසුවෙන් Upload කරන්න.
                </p>
              </div>

              <button
                onClick={() => setActiveTab("settings")}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-amber-400" />
                <span>සියලු සැකසුම් (All Settings)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cover Image Uploader Card */}
              <div className="bg-neutral-950/80 rounded-2xl border border-neutral-800 p-5 space-y-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Images className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-white">Hero Cover Image (Banner)</h4>
                  </div>
                  {uploadingCover && (
                    <span className="text-xs text-amber-400 animate-pulse font-bold flex items-center gap-1">
                      <RefreshCcw className="w-3 h-3 animate-spin" />
                      <span>Uploading...</span>
                    </span>
                  )}
                </div>

                {/* Preview Box */}
                <div className="relative aspect-[16/6] w-full rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 group shadow-md">
                  <img
                    src={siteSettingsForm.siteCoverUrl || "/cover.jpg"}
                    alt="Hero Cover Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src.endsWith(".jpg")) target.src = "/cover.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center text-xs font-bold text-white">
                    වත්මන් Hero Cover Banner එක
                  </div>
                </div>

                {/* Upload Action */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer">
                      <div className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all">
                        <Upload className="w-4 h-4" />
                        <span>{uploadingCover ? "Uploading Cover..." : "Cover Image එක Upload කරන්න"}</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingCover}
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleCoverFileUpload(e.target.files[0]);
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt("Cover Image URL එක ඇතුළත් කරන්න:", siteSettingsForm.siteCoverUrl || "/cover.jpg");
                        if (url) {
                          setSiteSettingsForm({ ...siteSettingsForm, siteCoverUrl: url });
                          api.updateSettings({ siteCoverUrl: url });
                          showSuccess("Cover Image URL සාර්ථකව යාවත්කාලීන විය!");
                          onSettingsUpdated();
                        }
                      }}
                      className="px-3 py-2.5 rounded-xl bg-neutral-850 hover:bg-neutral-750 text-neutral-300 border border-neutral-750 font-bold text-xs cursor-pointer"
                      title="Set by URL"
                    >
                      URL
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-500 text-center">
                    PNG, JPG, WEBP formats සඳහා සහය දක්වයි (Recommended: 1920x600px හෝ 21:9)
                  </p>
                </div>
              </div>

              {/* Site Logo Uploader Card */}
              <div className="bg-neutral-950/80 rounded-2xl border border-neutral-800 p-5 space-y-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-white">Site Logo (වෙබ් අඩවි ලාංඡනය)</h4>
                  </div>
                  {uploadingLogo && (
                    <span className="text-xs text-amber-400 animate-pulse font-bold flex items-center gap-1">
                      <RefreshCcw className="w-3 h-3 animate-spin" />
                      <span>Uploading...</span>
                    </span>
                  )}
                </div>

                {/* Preview Box */}
                <div className="relative aspect-[16/6] w-full rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center gap-6 p-4 shadow-md">
                  {/* Circular exact fit badge preview */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-14 h-14 rounded-full bg-neutral-950 border-2 border-amber-400 flex items-center justify-center overflow-hidden shadow-lg">
                      <img
                        src={siteSettingsForm.siteLogoUrl || "/logo.png"}
                        alt="Logo Circle Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center rounded-full scale-135"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src.endsWith(".png")) target.src = "/logo.jpg";
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold">Circle View</span>
                  </div>

                  {/* Original Logo Contain preview */}
                  <div className="flex-1 flex flex-col items-center gap-1 border-l border-neutral-800 pl-4">
                    <img
                      src={siteSettingsForm.siteLogoUrl || "/logo.png"}
                      alt="Logo Preview"
                      referrerPolicy="no-referrer"
                      className="max-h-14 max-w-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src.endsWith(".png")) target.src = "/logo.jpg";
                      }}
                    />
                    <span className="text-[10px] text-neutral-400 font-medium">Original Ratio</span>
                  </div>
                </div>

                {/* Upload Action */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer">
                      <div className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all">
                        <Upload className="w-4 h-4" />
                        <span>{uploadingLogo ? "Uploading Logo..." : "Logo Image එක Upload කරන්න"}</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingLogo}
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleLogoFileUpload(e.target.files[0]);
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt("Site Logo URL එක ඇතුළත් කරන්න:", siteSettingsForm.siteLogoUrl || "/logo.png");
                        if (url) {
                          setSiteSettingsForm({ ...siteSettingsForm, siteLogoUrl: url });
                          api.updateSettings({ siteLogoUrl: url });
                          showSuccess("Site Logo URL සාර්ථකව යාවත්කාලීන විය!");
                          onSettingsUpdated();
                        }
                      }}
                      className="px-3 py-2.5 rounded-xl bg-neutral-850 hover:bg-neutral-750 text-neutral-300 border border-neutral-750 font-bold text-xs cursor-pointer"
                      title="Set by URL"
                    >
                      URL
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-500 text-center">
                    Transparent PNG හෝ JPG formats වඩාත් සුදුසුය
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: ADD MOVIE VIA IMDB + TMDB + GEMINI */}
      {/* ---------------------------------------------------- */}
      {activeTab === "add-movie" && (
        <div className="bg-neutral-900/90 rounded-3xl border border-neutral-800 p-6 sm:p-8 space-y-8">
          <div className="border-b border-neutral-800 pb-4 space-y-1">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Film className="w-6 h-6 text-amber-400" />
              <span>IMDb ID මඟින් නව චිත්‍රපටයක් එක්කිරීම</span>
            </h2>
            <p className="text-xs text-neutral-400">
              TMDB API සහ Google Gemini AI ආධාරයෙන් සියලුම විස්තර සහ සිංහල සාරාංශය ස්වයංක්‍රීයව සම්පාදනය වේ.
            </p>
          </div>

          {/* Fetch Bar */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/30 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 font-mono">
                IMDb ID:
              </span>
              <input
                type="text"
                value={movieImdbId}
                onChange={(e) => setMovieImdbId(e.target.value)}
                placeholder="උදා: tt0848228, tt4154796"
                className="w-full pl-22 pr-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="button"
              disabled={fetchingMovie}
              onClick={handleFetchMovieMetadata}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs tracking-wide shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{fetchingMovie ? "දත්ත ගෙනෙමින් පවතී..." : "TMDB & Gemini මඟින් දත්ත ලබාගන්න"}</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleCreateMovieSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">චිත්‍රපට නම (Title)</label>
                <input
                  type="text"
                  required
                  value={movieFormData.title}
                  onChange={(e) => setMovieFormData({ ...movieFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">Original Title</label>
                <input
                  type="text"
                  value={movieFormData.originalTitle}
                  onChange={(e) => setMovieFormData({ ...movieFormData, originalTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">වර්ෂය (Year)</label>
                <input
                  type="number"
                  value={movieFormData.year}
                  onChange={(e) => setMovieFormData({ ...movieFormData, year: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">IMDb Rating</label>
                <input
                  type="number"
                  step="0.1"
                  value={movieFormData.rating}
                  onChange={(e) => setMovieFormData({ ...movieFormData, rating: parseFloat(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">ධාවන කාලය (Runtime)</label>
                <input
                  type="text"
                  value={movieFormData.runtime}
                  onChange={(e) => setMovieFormData({ ...movieFormData, runtime: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">අධ්‍යක්ෂණය (Director)</label>
                <input
                  type="text"
                  value={movieFormData.director}
                  onChange={(e) => setMovieFormData({ ...movieFormData, director: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">Movie Collection Name (Optional)</label>
                <input
                  type="text"
                  value={movieFormData.collectionName}
                  onChange={(e) => setMovieFormData({ ...movieFormData, collectionName: e.target.value })}
                  placeholder="උදා: The Avengers Saga, Marvel MCU"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">YouTube Trailer URL</label>
                <input
                  type="text"
                  value={movieFormData.trailerUrl}
                  onChange={(e) => setMovieFormData({ ...movieFormData, trailerUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">Poster Image URL</label>
                <input
                  type="text"
                  value={movieFormData.posterUrl}
                  onChange={(e) => setMovieFormData({ ...movieFormData, posterUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">Backdrop / Cover Image URL</label>
                <input
                  type="text"
                  value={movieFormData.backdropUrl}
                  onChange={(e) => setMovieFormData({ ...movieFormData, backdropUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">Streaming URL (Direct MP4/Web Stream)</label>
                <input
                  type="text"
                  value={movieFormData.streamingUrl}
                  onChange={(e) => setMovieFormData({ ...movieFormData, streamingUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">1080p Video Download URL</label>
                <input
                  type="text"
                  value={movieFormData.videoDownloadUrl}
                  onChange={(e) => setMovieFormData({ ...movieFormData, videoDownloadUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>
            </div>

            {/* Sinhala Description Field */}
            <div className="space-y-2 p-4 rounded-2xl bg-neutral-950 border border-amber-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>සිංහල විස්තරය (AI Generated Sinhala Synopsis & Review)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={addMovieAiPromptNote}
                    onChange={(e) => setAddMovieAiPromptNote(e.target.value)}
                    placeholder="AI වෙත උපදෙස් (උදා: Action සහ චරිත ගැන වැඩිපුර ලියන්න)..."
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 w-48 sm:w-64"
                  />
                  <button
                    type="button"
                    disabled={isGeneratingAddMovieAi}
                    onClick={handleGenerateAiForAddMovie}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] rounded-lg flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingAddMovieAi ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>සකසමින්...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>AI මඟින් ජනනය කරන්න</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <textarea
                rows={5}
                value={movieFormData.sinhalaDescription}
                onChange={(e) => setMovieFormData({ ...movieFormData, sinhalaDescription: e.target.value })}
                placeholder="චිත්‍රපටයේ සිංහල සාරාංශය සහ විචාරය මෙහි ඇතුළත් වේ..."
                className="w-full p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-amber-100 text-xs leading-relaxed focus:outline-none focus:border-amber-500"
              ></textarea>
            </div>

            {/* English Overview */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-400">English Overview</label>
              <textarea
                rows={3}
                value={movieFormData.overview}
                onChange={(e) => setMovieFormData({ ...movieFormData, overview: e.target.value })}
                className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs leading-relaxed"
              ></textarea>
            </div>

            {/* 6 Unique Sample Images Manager for Movie */}
            <SampleImagesManager
              images={movieFormData.images || []}
              onChange={(imgs) => setMovieFormData({ ...movieFormData, images: imgs })}
              title="චිත්‍රපටයේ Sample Images 6ක් (6 Unique Sample Images)"
              themeColor="amber"
              posterUrl={movieFormData.posterUrl}
              backdropUrl={movieFormData.backdropUrl}
            />

            {/* Checkboxes */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={movieFormData.hasSinhalaSub}
                  onChange={(e) => setMovieFormData({ ...movieFormData, hasSinhalaSub: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="font-semibold">සිංහල උපසිරැසි ඇත (Sinhala Sub Available)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={movieFormData.isFeatured}
                  onChange={(e) => setMovieFormData({ ...movieFormData, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="font-semibold">Featured on Home Page</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={movieFormData.isPublished}
                  onChange={(e) => setMovieFormData({ ...movieFormData, isPublished: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="font-semibold">Published (ප්‍රසිද්ධ කරන්න)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>චිත්‍රපටය ප්‍රකාශයට පත් කරන්න (Publish Movie)</span>
            </button>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: ADD TV SERIES VIA IMDB + TMDB + GEMINI */}
      {/* ---------------------------------------------------- */}
      {activeTab === "add-series" && (
        <div className="bg-neutral-900/90 rounded-3xl border border-neutral-800 p-6 sm:p-8 space-y-8">
          <div className="border-b border-neutral-800 pb-4 space-y-1">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Tv className="w-6 h-6 text-sky-400" />
              <span>IMDb ID මඟින් නව TV Series එක්කිරීම</span>
            </h2>
            <p className="text-xs text-neutral-400">
              TMDB API සහ Google Gemini AI ආධාරයෙන් TV Series Seasons සහ Episodes ස්වයංක්‍රීයව සම්පාදනය වේ.
            </p>
          </div>

          {/* Fetch Bar */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-sky-500/30 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 font-mono">
                IMDb ID:
              </span>
              <input
                type="text"
                value={seriesImdbId}
                onChange={(e) => setSeriesImdbId(e.target.value)}
                placeholder="උදා: tt0944947 (Game of Thrones), tt0903747 (Breaking Bad)"
                className="w-full pl-22 pr-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              type="button"
              disabled={fetchingSeries}
              onClick={handleFetchSeriesMetadata}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs tracking-wide shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{fetchingSeries ? "දත්ත ගෙනෙමින් පවතී..." : "TMDB & Gemini මඟින් දත්ත ලබාගන්න"}</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleCreateSeriesSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">Series Title</label>
                <input
                  type="text"
                  required
                  value={seriesFormData.title}
                  onChange={(e) => setSeriesFormData({ ...seriesFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">Original Title</label>
                <input
                  type="text"
                  value={seriesFormData.originalTitle}
                  onChange={(e) => setSeriesFormData({ ...seriesFormData, originalTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">First Air Year</label>
                <input
                  type="number"
                  value={seriesFormData.year}
                  onChange={(e) => setSeriesFormData({ ...seriesFormData, year: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">IMDb Rating</label>
                <input
                  type="number"
                  step="0.1"
                  value={seriesFormData.rating}
                  onChange={(e) => setSeriesFormData({ ...seriesFormData, rating: parseFloat(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">Seasons Count</label>
                <input
                  type="number"
                  value={seriesFormData.seasonsCount}
                  onChange={(e) => setSeriesFormData({ ...seriesFormData, seasonsCount: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">YouTube Trailer URL</label>
                <input
                  type="text"
                  value={seriesFormData.trailerUrl}
                  onChange={(e) => setSeriesFormData({ ...seriesFormData, trailerUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>
            </div>

            {/* Sinhala Description */}
            <div className="space-y-2 p-4 rounded-2xl bg-neutral-950 border border-sky-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>සිංහල විස්තරය (AI Generated Sinhala Synopsis & Review)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={addSeriesAiPromptNote}
                    onChange={(e) => setAddSeriesAiPromptNote(e.target.value)}
                    placeholder="AI වෙත උපදෙස් (උදා: කතාවේ ප්‍රධාන තේමාවන් ගැන ලියන්න)..."
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 w-48 sm:w-64"
                  />
                  <button
                    type="button"
                    disabled={isGeneratingAddSeriesAi}
                    onClick={handleGenerateAiForAddSeries}
                    className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-black font-bold text-[11px] rounded-lg flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingAddSeriesAi ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>සකසමින්...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>AI මඟින් ජනනය කරන්න</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <textarea
                rows={5}
                value={seriesFormData.sinhalaDescription}
                onChange={(e) => setSeriesFormData({ ...seriesFormData, sinhalaDescription: e.target.value })}
                placeholder="ටීවී සීරීස් හි සිංහල සාරාංශය සහ විචාරය මෙහි ඇතුළත් වේ..."
                className="w-full p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-sky-100 text-xs leading-relaxed focus:outline-none focus:border-sky-500"
              ></textarea>
            </div>

            {/* 6 Unique Sample Images Manager for TV Series */}
            <SampleImagesManager
              images={seriesFormData.images || []}
              onChange={(imgs) => setSeriesFormData({ ...seriesFormData, images: imgs })}
              title="TV Series එකෙහි Sample Images 6ක් (6 Unique Sample Images)"
              themeColor="sky"
              posterUrl={seriesFormData.posterUrl}
              backdropUrl={seriesFormData.backdropUrl}
            />

            {/* Seasons & Episodes Manager (Seasons option buttons, Season-wise descriptions, 720p/1080p uploads & Sinhala subtitles) */}
            <div className="p-4 sm:p-6 rounded-3xl bg-neutral-950/80 border border-neutral-800 shadow-xl">
              <SeasonEpisodeManager
                seriesTitle={seriesFormData.title || "TV Series"}
                seriesOverview={seriesFormData.overview}
                seasons={seriesFormData.seasons || []}
                onChange={(updatedSeasons) => {
                  const epCount = updatedSeasons.reduce(
                    (acc: number, s: Season) => acc + (s.episodes?.length || 0),
                    0
                  );
                  setSeriesFormData({
                    ...seriesFormData,
                    seasons: updatedSeasons,
                    seasonsCount: updatedSeasons.length,
                    episodesCount: epCount,
                  });
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>ටීවී සීරීස් ප්‍රකාශයට පත් කරන්න (Publish TV Series)</span>
            </button>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: MANAGE MOVIES */}
      {/* ---------------------------------------------------- */}
      {activeTab === "movies" && (
        <div className="bg-neutral-900/90 rounded-3xl border border-neutral-800 p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-amber-400" />
                <span>සියලු චිත්‍රපට කළමනාකරණය ({moviesList.length})</span>
              </h3>
              <p className="text-xs text-neutral-400">චිත්‍රපට වල විස්තර, පින්තූර, ඩවුන්ලෝඩ් ලින්ක් සහ උපසිරැසි පහසුවෙන් සංස්කරණය කරන්න.</p>
            </div>
            <button
              onClick={() => setActiveTab("add-movie")}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>නව චිත්‍රපටයක් එක්කරන්න</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={movieSearchQuery}
                onChange={(e) => setMovieSearchQuery(e.target.value)}
                placeholder="චිත්‍රපට නම, IMDb ID, අධ්‍යක්ෂක අනුව සොයන්න..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: `සියල්ල (${moviesList.length})` },
                { id: "sinhala-sub", label: `උපසිරැසි ඇත (${moviesList.filter((m) => m.hasSinhalaSub).length})` },
                { id: "vip", label: `VIP (${moviesList.filter((m) => m.isVip).length})` },
                { id: "featured", label: `Featured (${moviesList.filter((m) => m.featured || m.isFeatured).length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setMovieFilterTab(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    movieFilterTab === f.id
                      ? "bg-amber-500 text-black font-bold"
                      : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Movies Table */}
          <div className="overflow-x-auto rounded-2xl border border-neutral-800/80">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Poster</th>
                  <th className="p-3">Title / Year</th>
                  <th className="p-3">IMDb</th>
                  <th className="p-3">Genre</th>
                  <th className="p-3">Subtitles / VIP</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/30">
                {moviesList
                  .filter((m) => {
                    const q = movieSearchQuery.toLowerCase().trim();
                    const matches =
                      !q ||
                      m.title.toLowerCase().includes(q) ||
                      (m.originalTitle && m.originalTitle.toLowerCase().includes(q)) ||
                      (m.director && m.director.toLowerCase().includes(q)) ||
                      (m.imdbId && m.imdbId.toLowerCase().includes(q)) ||
                      m.genres?.some((g) => g.toLowerCase().includes(q));
                    if (!matches) return false;
                    if (movieFilterTab === "sinhala-sub") return m.hasSinhalaSub;
                    if (movieFilterTab === "vip") return m.isVip;
                    if (movieFilterTab === "featured") return m.featured || m.isFeatured;
                    return true;
                  })
                  .map((m) => (
                    <tr key={m.id} className="hover:bg-neutral-900/60 transition-colors">
                      <td className="p-3">
                        <img
                          src={m.posterUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-10 h-14 object-cover rounded-lg bg-neutral-950 shadow border border-neutral-800"
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{m.title}</div>
                        <div className="text-neutral-400 text-[11px]">
                          {m.year} • {m.runtime || "N/A"} {m.director ? `• Dir: ${m.director}` : ""}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          ★ {m.rating}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {m.genres?.slice(0, 2).map((g) => (
                            <span key={g} className="px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-300 text-[10px] border border-neutral-800">
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          {m.hasSinhalaSub ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                              <Check className="w-3 h-3" /> සිංහල උපසිරැසි ඇත
                            </span>
                          ) : (
                            <span className="text-neutral-500 text-[11px]">නැත</span>
                          )}
                          {m.isVip && (
                            <span className="text-amber-300 font-black flex items-center gap-1 text-[10px] bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40 w-fit">
                              <Crown className="w-3 h-3 text-amber-400" /> VIP
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEditMovieModal(m)}
                            className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-bold rounded-lg border border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
                            title="Edit Movie (සියලු විස්තර සංස්කරණය)"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>සංස්කරණය</span>
                          </button>
                          {/* View Live */}
                          <button
                            onClick={() => onNavigateToMovie(m)}
                            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-200"
                            title="View Live"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={() => requestDeleteMovie(m.id, m.title)}
                            className="p-1.5 bg-red-950 hover:bg-red-900 rounded-lg text-red-300 transition-colors"
                            title="Delete Movie"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: MANAGE TV SERIES */}
      {/* ---------------------------------------------------- */}
      {activeTab === "series" && (
        <div className="bg-neutral-900/90 rounded-3xl border border-neutral-800 p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-sky-400" />
                <span>සියලු ටීවී සීරීස් කළමනාකරණය ({seriesList.length})</span>
              </h3>
              <p className="text-xs text-neutral-400">TV Series වල විස්තර, පින්තූර, සීසන්, ලින්ක් සහ උපසිරැසි පහසුවෙන් සංස්කරණය කරන්න.</p>
            </div>
            <button
              onClick={() => setActiveTab("add-series")}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-black font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 cursor-pointer self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>නව Series එක්කරන්න</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={seriesSearchQuery}
                onChange={(e) => setSeriesSearchQuery(e.target.value)}
                placeholder="සීරීස් නම, IMDb ID, අධ්‍යක්ෂක අනුව සොයන්න..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: `සියල්ල (${seriesList.length})` },
                { id: "sinhala-sub", label: `උපසිරැසි ඇත (${seriesList.filter((s) => s.hasSinhalaSub).length})` },
                { id: "vip", label: `VIP (${seriesList.filter((s) => s.isVip).length})` },
                { id: "featured", label: `Featured (${seriesList.filter((s) => s.featured || s.isFeatured).length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSeriesFilterTab(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    seriesFilterTab === f.id
                      ? "bg-sky-500 text-black font-bold"
                      : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Series Table */}
          <div className="overflow-x-auto rounded-2xl border border-neutral-800/80">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Poster</th>
                  <th className="p-3">Title / Year</th>
                  <th className="p-3">IMDb</th>
                  <th className="p-3">Seasons</th>
                  <th className="p-3">Subtitles / VIP</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/30">
                {seriesList
                  .filter((s) => {
                    const q = seriesSearchQuery.toLowerCase().trim();
                    const matches =
                      !q ||
                      s.title.toLowerCase().includes(q) ||
                      (s.originalTitle && s.originalTitle.toLowerCase().includes(q)) ||
                      (s.imdbId && s.imdbId.toLowerCase().includes(q)) ||
                      s.genres?.some((g) => g.toLowerCase().includes(q));
                    if (!matches) return false;
                    if (seriesFilterTab === "sinhala-sub") return s.hasSinhalaSub;
                    if (seriesFilterTab === "vip") return s.isVip;
                    if (seriesFilterTab === "featured") return s.featured || s.isFeatured;
                    return true;
                  })
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-neutral-900/60 transition-colors">
                      <td className="p-3">
                        <img
                          src={s.posterUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-10 h-14 object-cover rounded-lg bg-neutral-950 shadow border border-neutral-800"
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{s.title}</div>
                        <div className="text-neutral-400 text-[11px]">{s.year}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-black text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                          ★ {s.rating}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-white">{s.seasonsCount} Seasons</span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          {s.hasSinhalaSub ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                              <Check className="w-3 h-3" /> උපසිරැසි ඇත
                            </span>
                          ) : (
                            <span className="text-neutral-500 text-[11px]">නැත</span>
                          )}
                          {s.isVip && (
                            <span className="text-amber-300 font-black flex items-center gap-1 text-[10px] bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40 w-fit">
                              <Crown className="w-3 h-3 text-amber-400" /> VIP
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Seasons & Episodes Manager Button */}
                          <button
                            onClick={() => handleOpenManageSeasonsModal(s)}
                            className="px-2.5 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white font-bold rounded-lg border border-red-500/40 transition-all flex items-center gap-1 cursor-pointer text-xs"
                            title="Seasons & Episodes (720p/1080p Videos, Subtitles සහ Seasons විස්තර)"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Seasons & Episodes ({s.seasonsCount || 1}S)</span>
                          </button>
                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEditSeriesModal(s)}
                            className="px-2.5 py-1.5 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-black font-bold rounded-lg border border-sky-500/30 transition-all flex items-center gap-1 cursor-pointer text-xs"
                            title="Edit Series (සියලු විස්තර සංස්කරණය)"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>සංස්කරණය</span>
                          </button>
                          {/* View Live */}
                          <button
                            onClick={() => onNavigateToSeries(s)}
                            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-200"
                            title="View Live"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={() => requestDeleteSeries(s.id, s.title)}
                            className="p-1.5 bg-red-950 hover:bg-red-900 rounded-lg text-red-300 transition-colors"
                            title="Delete Series"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: VIP TV SERIES MANAGEMENT */}
      {/* ---------------------------------------------------- */}
      {activeTab === "vip-series" && (
        <div className="space-y-6 animate-fadeIn">
          {/* VIP Banner & Stat Cards */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-950/70 via-neutral-900 to-neutral-950 border-2 border-amber-500/50 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/30 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm">
                    <Crown className="w-5 h-5 animate-bounce" />
                  </div>
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    SERIESHUB VIP CLUB & DIRECT CLOUD ACCESS
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>VIP Tv Series කළමනාකරණය</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold">
                    VIP EXCLUSIVES
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
                  VIP සාමාජිකයින් සඳහා වූ Direct Google Drive 1Gbps+ Cloud Links, Mega.nz Direct Mirrors, VIP Telegram Bot Access Code සහ 4K UHD Master පිටපත් මෙතැනින් කළමනාකරණය කරන්න.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("add-series")}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>නව TV Series එකක් එක්කරන්න</span>
                </button>
              </div>
            </div>

            {/* Quick VIP Stats Grid */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-neutral-950/70 border border-amber-500/30 space-y-1">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
                  <span>Active VIP Series</span>
                  <Crown className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400">
                  {seriesList.filter((s) => s.isVip).length}
                </div>
                <div className="text-[11px] text-neutral-500">VIP Exclusive ලෙස සක්‍රියයි</div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
                  <span>Google Drive 1Gbps</span>
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  {seriesList.filter((s) => s.isVip && s.vipDriveLink).length}
                </div>
                <div className="text-[11px] text-neutral-500">Direct Cloud Links සකසා ඇත</div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
                  <span>Mega.nz Mirrors</span>
                  <Zap className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-black text-sky-400">
                  {seriesList.filter((s) => s.isVip && s.vipMegaLink).length}
                </div>
                <div className="text-[11px] text-neutral-500">Direct Fast Links සකසා ඇත</div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
                  <span>Telegram Cloud Bots</span>
                  <Link2 className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-purple-400">
                  {seriesList.filter((s) => s.isVip && s.vipTelegramCode).length}
                </div>
                <div className="text-[11px] text-neutral-500">VIP Bot Codes සකසා ඇත</div>
              </div>
            </div>
          </div>

          {/* Search, Filter Tabs & Main Management Table */}
          <div className="bg-neutral-900/90 rounded-3xl border border-neutral-800 p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setVipFilterTab("all")}
                  className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                    vipFilterTab === "all"
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
                  }`}
                >
                  සියලු TV Series ({seriesList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setVipFilterTab("vip-only")}
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                    vipFilterTab === "vip-only"
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "bg-neutral-950 text-amber-400 hover:text-amber-300 border border-amber-500/30"
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>VIP Series පමණක් ({seriesList.filter((s) => s.isVip).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVipFilterTab("non-vip")}
                  className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                    vipFilterTab === "non-vip"
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
                  }`}
                >
                  සාමාන්‍ය (Standard) Series ({seriesList.filter((s) => !s.isVip).length})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={vipSearchQuery}
                  onChange={(e) => setVipSearchQuery(e.target.value)}
                  placeholder="Series නම හෝ IMDb ID සොයන්න..."
                  className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-950/40">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider text-[10px] border-b border-neutral-800">
                  <tr>
                    <th className="p-3.5">Poster</th>
                    <th className="p-3.5">Title / Year</th>
                    <th className="p-3.5">Rating & Seasons</th>
                    <th className="p-3.5">VIP Status & Switch</th>
                    <th className="p-3.5">VIP Tier Level</th>
                    <th className="p-3.5">Direct Cloud Links</th>
                    <th className="p-3.5">VIP Notes</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {seriesList
                    .filter((s) => {
                      if (vipFilterTab === "vip-only") return s.isVip;
                      if (vipFilterTab === "non-vip") return !s.isVip;
                      return true;
                    })
                    .filter((s) => {
                      if (!vipSearchQuery) return true;
                      const q = vipSearchQuery.toLowerCase();
                      return (
                        s.title.toLowerCase().includes(q) ||
                        (s.imdbId && s.imdbId.toLowerCase().includes(q))
                      );
                    })
                    .map((s) => {
                      const isVip = Boolean(s.isVip);
                      return (
                        <tr
                          key={`vip-row-${s.id}`}
                          className={`hover:bg-neutral-900/60 transition-colors ${
                            isVip ? "bg-amber-950/10" : ""
                          }`}
                        >
                          {/* Poster */}
                          <td className="p-3.5">
                            <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800">
                              <img
                                src={s.posterUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              {isVip && (
                                <div className="absolute top-0 right-0 p-0.5 bg-amber-500 text-black rounded-bl">
                                  <Crown className="w-2.5 h-2.5" />
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Title / Year */}
                          <td className="p-3.5">
                            <div className="font-bold text-white text-sm flex items-center gap-1.5">
                              <span>{s.title}</span>
                              {isVip && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                                  VIP
                                </span>
                              )}
                            </div>
                            <div className="text-neutral-500 text-[11px]">
                              {s.year} • {s.imdbId || "No IMDb ID"}
                            </div>
                          </td>

                          {/* Rating & Seasons */}
                          <td className="p-3.5">
                            <div className="font-bold text-amber-400">★ {s.rating}</div>
                            <div className="text-neutral-400 text-[11px]">{s.seasonsCount} Seasons</div>
                          </td>

                          {/* VIP 1-Click Toggle Switch */}
                          <td className="p-3.5">
                            <button
                              type="button"
                              onClick={() => handleToggleVipStatus(s)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                isVip
                                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/30 hover:bg-amber-400"
                                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                              }`}
                              title={isVip ? "Click to disable VIP" : "Click to mark as VIP"}
                            >
                              <Crown className={`w-3.5 h-3.5 ${isVip ? "text-black" : "text-neutral-500"}`} />
                              <span>{isVip ? "👑 VIP Active" : "Standard"}</span>
                            </button>
                          </td>

                          {/* VIP Tier Required */}
                          <td className="p-3.5">
                            {isVip ? (
                              <span className="px-2 py-1 rounded-lg bg-neutral-900 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                                {s.vipTier === "platinum"
                                  ? "💎 Platinum Only"
                                  : s.vipTier === "gold"
                                  ? "⭐ Gold Pro+"
                                  : s.vipTier === "silver"
                                  ? "🥈 Silver+"
                                  : "👑 All VIP Passes"}
                              </span>
                            ) : (
                              <span className="text-neutral-600 text-[11px]">—</span>
                            )}
                          </td>

                          {/* Cloud Direct Links Status */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {s.vipDriveLink ? (
                                <span
                                  className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-[10px] font-bold flex items-center gap-1"
                                  title={s.vipDriveLink}
                                >
                                  <HardDrive className="w-3 h-3" />
                                  <span>Drive 1Gbps</span>
                                </span>
                              ) : (
                                <span className="text-neutral-600 text-[10px]" title="No Google Drive Link">
                                  -
                                </span>
                              )}

                              {s.vipMegaLink && (
                                <span
                                  className="px-2 py-0.5 rounded-md bg-sky-950 text-sky-400 border border-sky-800/80 text-[10px] font-bold flex items-center gap-1"
                                  title={s.vipMegaLink}
                                >
                                  <Zap className="w-3 h-3" />
                                  <span>Mega Mirror</span>
                                </span>
                              )}

                              {s.vipTelegramCode && (
                                <span
                                  className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-400 border border-purple-800/80 text-[10px] font-bold flex items-center gap-1"
                                  title={s.vipTelegramCode}
                                >
                                  <Link2 className="w-3 h-3" />
                                  <span>Bot Code</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* VIP Notes */}
                          <td className="p-3.5">
                            <div className="max-w-xs truncate text-[11px] text-neutral-400">
                              {s.vipNotes || (isVip ? "Standard VIP 1080p Print" : "—")}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleOpenManageSeasonsModal(s)}
                              className="px-2.5 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                              title="Seasons & Episodes"
                            >
                              <Layers className="w-3.5 h-3.5" />
                              <span>Seasons ({s.seasonsCount || 1}S)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditSeriesModal(s)}
                              className="px-2.5 py-1.5 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-black border border-sky-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                              title="Edit Series"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>සංස්කරණය</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenVipModal(s)}
                              className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              title="Edit VIP Links & Tier"
                            >
                              <span>⚙️ VIP Settings</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onNavigateToSeries(s)}
                              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-200"
                              title="View Live Series"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => requestDeleteSeries(s.id, s.title)}
                              className="p-1.5 bg-red-950 hover:bg-red-900 rounded-lg text-red-300 transition-colors"
                              title="Delete Series"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: SUBTITLE MANAGEMENT */}
      {/* ---------------------------------------------------- */}
      {activeTab === "subtitles" && (
        <div className="space-y-8">
          {/* Uploader Card */}
          <div className="bg-neutral-900/90 rounded-3xl border border-neutral-800 p-6 space-y-6">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                <span>උපසිරැසි ගොනුවක් උඩුගත කරන්න (.srt / .vtt / .ass)</span>
              </h3>
            </div>

            <form onSubmit={handleSubtitleUpload} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">අදාළ මාතෘකාව (Target Title)</label>
                <input
                  type="text"
                  value={subTargetTitle}
                  onChange={(e) => setSubTargetTitle(e.target.value)}
                  placeholder="උදා: Avengers Endgame 1080p Sinhala"
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">උපසිරැසි ගොනුව (.srt, .vtt)</label>
                <input
                  type="file"
                  accept=".srt,.vtt,.ass"
                  onChange={(e) => setSubFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-emerald-600 file:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Subtitle</span>
              </button>
            </form>
          </div>

          {/* Subtitles List */}
          <div className="bg-neutral-900/90 rounded-3xl border border-neutral-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">පවතින උපසිරැසි ගොනු ({subtitlesList.length})</h3>

            <div className="space-y-2">
              {subtitlesList.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white text-xs font-mono">{sub.fileName}</div>
                    <div className="text-[11px] text-neutral-400">
                      භාෂාව: {sub.language} • ප්‍රමාණය: {sub.fileSize}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {sub.fileUrl && (
                      <a
                        href={sub.fileUrl}
                        download={sub.fileName}
                        className="p-1.5 bg-neutral-800 hover:bg-emerald-600 text-white rounded-lg"
                        title="Download File"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => requestDeleteSubtitle(sub.id, sub.fileName)}
                      className="p-1.5 bg-red-950 hover:bg-red-900 text-red-300 rounded-lg transition-colors"
                      title="Delete Subtitle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: SITE SETTINGS & BRANDING */}
      {/* ---------------------------------------------------- */}
      {activeTab === "settings" && (
        <div className="space-y-8">
          {/* Cover & Logo Brand Assets Uploaders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cover Image Manager Card */}
            <div className="bg-neutral-900/90 rounded-3xl border border-neutral-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Images className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-black text-white">Hero Cover Image (Banner)</h4>
                </div>
                {uploadingCover && (
                  <span className="text-xs text-amber-400 animate-pulse font-bold flex items-center gap-1">
                    <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </span>
                )}
              </div>

              {/* Cover Preview */}
              <div className="relative aspect-[16/6] w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 group shadow-inner">
                <img
                  src={siteSettingsForm.siteCoverUrl || "/cover.jpg"}
                  alt="Current Hero Cover"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src.endsWith(".jpg")) target.src = "/cover.png";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center text-xs font-bold text-white">
                  Current Hero Cover Banner
                </div>
              </div>

              {/* Upload Input & Drop Area */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer">
                    <div className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 hover:text-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition-all">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingCover ? "Uploading Cover..." : "Cover Image එකක් තෝරන්න (Upload File)"}</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingCover}
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleCoverFileUpload(e.target.files[0]);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt("Cover Image URL එක ඇතුළත් කරන්න:", siteSettingsForm.siteCoverUrl || "/cover.jpg");
                      if (url) {
                        setSiteSettingsForm({ ...siteSettingsForm, siteCoverUrl: url });
                        api.updateSettings({ siteCoverUrl: url });
                        showSuccess("Cover Image URL යාවත්කාලීන විය!");
                        onSettingsUpdated();
                      }
                    }}
                    className="px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs"
                    title="URL මගින් ලබාදෙන්න"
                  >
                    URL
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-400">Cover Image URL</label>
                  <input
                    type="text"
                    value={siteSettingsForm.siteCoverUrl || ""}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, siteCoverUrl: e.target.value })}
                    placeholder="/cover.jpg හෝ https://..."
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Site Logo Manager Card */}
            <div className="bg-neutral-900/90 rounded-3xl border border-neutral-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-black text-white">Site Logo (වෙබ් අඩවි ලාංඡනය)</h4>
                </div>
                {uploadingLogo && (
                  <span className="text-xs text-amber-400 animate-pulse font-bold flex items-center gap-1">
                    <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </span>
                )}
              </div>

              {/* Logo Preview */}
              <div className="relative aspect-[16/6] w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center p-4 shadow-inner">
                <img
                  src={siteSettingsForm.siteLogoUrl || "/logo.png"}
                  alt="Current Site Logo"
                  referrerPolicy="no-referrer"
                  className="max-h-24 max-w-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src.endsWith(".png")) target.src = "/logo.jpg";
                  }}
                />
              </div>

              {/* Upload Input & Drop Area */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer">
                    <div className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 hover:text-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition-all">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingLogo ? "Uploading Logo..." : "Logo ගොනුවක් තෝරන්න (Upload Logo)"}</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingLogo}
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleLogoFileUpload(e.target.files[0]);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt("Logo Image URL එක ඇතුළත් කරන්න:", siteSettingsForm.siteLogoUrl || "/logo.png");
                      if (url) {
                        setSiteSettingsForm({ ...siteSettingsForm, siteLogoUrl: url });
                        api.updateSettings({ siteLogoUrl: url });
                        showSuccess("Logo URL යාවත්කාලීන විය!");
                        onSettingsUpdated();
                      }
                    }}
                    className="px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs"
                    title="URL මගින් ලබාදෙන්න"
                  >
                    URL
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-400">Logo Image URL</label>
                  <input
                    type="text"
                    value={siteSettingsForm.siteLogoUrl || ""}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, siteLogoUrl: e.target.value })}
                    placeholder="/logo.png හෝ https://..."
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* General Site Settings Form */}
          <div className="bg-neutral-900/90 rounded-3xl border border-neutral-800 p-6 sm:p-8 space-y-6">
            <div className="border-b border-neutral-800 pb-4 space-y-1">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <span>සාමාන්‍ය වෙබ් අඩවි සැකසුම් (General Site Settings)</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Hero Section, Sinhala Taglines, Notice Banner, TMDB API Key සහ Social Links මෙතැනින් වෙනස් කරන්න.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Site Name</label>
                  <input
                    type="text"
                    value={siteSettingsForm.siteName}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, siteName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Contact Email</label>
                  <input
                    type="email"
                    value={siteSettingsForm.contactEmail}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, contactEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Hero Section Heading (Sinhala)</label>
                  <input
                    type="text"
                    value={siteSettingsForm.heroHeading}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, heroHeading: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">TMDB API Key</label>
                  <input
                    type="text"
                    value={siteSettingsForm.tmdbApiKey}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, tmdbApiKey: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Telegram Channel URL</label>
                  <input
                    type="text"
                    value={siteSettingsForm.telegramUrl}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, telegramUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">YouTube Channel URL</label>
                  <input
                    type="text"
                    value={siteSettingsForm.youtubeUrl}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, youtubeUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">Hero Subheading (Sinhala Tagline)</label>
                <textarea
                  rows={2}
                  value={siteSettingsForm.heroSubheading}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, heroSubheading: e.target.value })}
                  className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">Top Notice Banner Text</label>
                <input
                  type="text"
                  value={siteSettingsForm.noticeBanner}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, noticeBanner: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>සියලු සැකසුම් සුරකින්න (Save All Settings)</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* FULL EDIT MOVIE MODAL */}
      {/* ---------------------------------------------------- */}
      {editingMovie && movieEditForm && (
        <div
          id="admin-edit-movie-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSavingMovie) {
              setEditingMovie(null);
              setMovieEditForm(null);
            }
          }}
        >
          <div
            id="admin-edit-movie-modal"
            className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left my-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400">
                  <Film className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">චිත්‍රපටය සංස්කරණය කරන්න (Edit Movie)</h4>
                  <p className="text-xs text-neutral-400">
                    ID: <span className="font-mono text-amber-400">{editingMovie.id}</span> • {editingMovie.title}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isSavingMovie}
                onClick={() => {
                  setEditingMovie(null);
                  setMovieEditForm(null);
                }}
                className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMovie} className="space-y-6">
              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Title (චිත්‍රපටයේ නම) *</label>
                  <input
                    type="text"
                    required
                    value={movieEditForm.title}
                    onChange={(e) => setMovieEditForm({ ...movieEditForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Original Title</label>
                  <input
                    type="text"
                    value={movieEditForm.originalTitle}
                    onChange={(e) => setMovieEditForm({ ...movieEditForm, originalTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Release Year</label>
                  <input
                    type="number"
                    value={movieEditForm.year}
                    onChange={(e) => setMovieEditForm({ ...movieEditForm, year: parseInt(e.target.value, 10) || 2026 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">IMDb Rating (e.g. 8.4)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={movieEditForm.rating}
                    onChange={(e) => setMovieEditForm({ ...movieEditForm, rating: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">IMDb ID (tt...)</label>
                  <input
                    type="text"
                    value={movieEditForm.imdbId}
                    onChange={(e) => setMovieEditForm({ ...movieEditForm, imdbId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Runtime (ධාවන කාලය)</label>
                  <input
                    type="text"
                    value={movieEditForm.runtime}
                    onChange={(e) => setMovieEditForm({ ...movieEditForm, runtime: e.target.value })}
                    placeholder="2h 15m"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Director (අධ්‍යක්ෂක)</label>
                  <input
                    type="text"
                    value={movieEditForm.director}
                    onChange={(e) => setMovieEditForm({ ...movieEditForm, director: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Content Rating</label>
                  <input
                    type="text"
                    value={movieEditForm.contentRating}
                    onChange={(e) => setMovieEditForm({ ...movieEditForm, contentRating: e.target.value })}
                    placeholder="PG-13, R, TV-MA"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Collection Name</label>
                  <input
                    type="text"
                    value={movieEditForm.collectionName}
                    onChange={(e) => setMovieEditForm({ ...movieEditForm, collectionName: e.target.value })}
                    placeholder="Marvel Cinematic Universe, Harry Potter..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Cast & Genres */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Cast (රංගන ශිල්පීන් - කොමා මඟින් වෙන්කරන්න)</label>
                  <input
                    type="text"
                    value={movieEditForm.cast}
                    onChange={(e) => setMovieEditForm({ ...movieEditForm, cast: e.target.value })}
                    placeholder="Leonardo DiCaprio, Cillian Murphy, Tom Hardy"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-300">Genres (වර්ගීකරණය)</label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                    {[
                      "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
                      "Drama", "Family", "Fantasy", "History", "Horror", "Mystery",
                      "Romance", "Sci-Fi", "Thriller", "War", "Western", "Sinhala Cinema"
                    ].map((genre) => {
                      const isSelected = movieEditForm.genres?.includes(genre);
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => {
                            const cur = movieEditForm.genres || [];
                            const updated = isSelected
                              ? cur.filter((g: string) => g !== genre)
                              : [...cur, genre];
                            setMovieEditForm({ ...movieEditForm, genres: updated });
                          }}
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-amber-500 text-black font-bold"
                              : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                          }`}
                        >
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Media Images & Video URLs */}
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-4">
                <h5 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>පින්තූර සහ මාධ්‍ය සබැඳි (Media & Posters)</span>
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Poster */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                      <span>Poster Image URL</span>
                      <label className="text-[11px] text-amber-400 hover:underline cursor-pointer flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Upload File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleUploadMovieEditImage(e.target.files[0], "posterUrl");
                          }}
                        />
                      </label>
                    </label>
                    <div className="flex gap-2">
                      {movieEditForm.posterUrl && (
                        <img
                          src={movieEditForm.posterUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-10 h-14 object-cover rounded bg-neutral-900 border border-neutral-800"
                        />
                      )}
                      <input
                        type="text"
                        value={movieEditForm.posterUrl}
                        onChange={(e) => setMovieEditForm({ ...movieEditForm, posterUrl: e.target.value })}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Backdrop */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                      <span>Backdrop / Cover URL</span>
                      <label className="text-[11px] text-amber-400 hover:underline cursor-pointer flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Upload File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleUploadMovieEditImage(e.target.files[0], "backdropUrl");
                          }}
                        />
                      </label>
                    </label>
                    <div className="flex gap-2">
                      {movieEditForm.backdropUrl && (
                        <img
                          src={movieEditForm.backdropUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-16 h-10 object-cover rounded bg-neutral-900 border border-neutral-800"
                        />
                      )}
                      <input
                        type="text"
                        value={movieEditForm.backdropUrl}
                        onChange={(e) => setMovieEditForm({ ...movieEditForm, backdropUrl: e.target.value })}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Trailer */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-neutral-300">YouTube Trailer URL</label>
                    <input
                      type="text"
                      value={movieEditForm.trailerUrl}
                      onChange={(e) => setMovieEditForm({ ...movieEditForm, trailerUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs"
                    />
                  </div>
                </div>

                {/* 6 Unique Sample Images Manager for Movie Edit Modal */}
                <div className="pt-2">
                  <SampleImagesManager
                    images={Array.isArray(movieEditForm.images) ? movieEditForm.images : []}
                    onChange={(imgs) => setMovieEditForm({ ...movieEditForm, images: imgs })}
                    title="චිත්‍රපටයේ Sample Images 6ක් (6 Unique Sample Images Gallery)"
                    themeColor="amber"
                    posterUrl={movieEditForm.posterUrl}
                    backdropUrl={movieEditForm.backdropUrl}
                  />
                </div>
              </div>

              {/* Streaming & Download Links */}
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-4">
                <h5 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>ඩවුන්ලෝඩ් සහ ස්ට්‍රීමිං සබැඳි (Streaming & Download Links)</span>
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">Streaming URL (Direct MP4/Web Stream)</label>
                    <input
                      type="text"
                      value={movieEditForm.streamingUrl}
                      onChange={(e) => setMovieEditForm({ ...movieEditForm, streamingUrl: e.target.value })}
                      placeholder="https://example.com/video.mp4"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">1080p Download URL</label>
                    <input
                      type="text"
                      value={movieEditForm.downloadUrl1080p}
                      onChange={(e) => setMovieEditForm({ ...movieEditForm, downloadUrl1080p: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">720p Download URL</label>
                    <input
                      type="text"
                      value={movieEditForm.downloadUrl720p}
                      onChange={(e) => setMovieEditForm({ ...movieEditForm, downloadUrl720p: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">4K UHD Download URL</label>
                    <input
                      type="text"
                      value={movieEditForm.downloadUrl4k}
                      onChange={(e) => setMovieEditForm({ ...movieEditForm, downloadUrl4k: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">Google Drive Direct Cloud URL</label>
                    <input
                      type="text"
                      value={movieEditForm.gdriveDownloadUrl}
                      onChange={(e) => setMovieEditForm({ ...movieEditForm, gdriveDownloadUrl: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">Mega.nz Direct Mirror URL</label>
                    <input
                      type="text"
                      value={movieEditForm.megaDownloadUrl}
                      onChange={(e) => setMovieEditForm({ ...movieEditForm, megaDownloadUrl: e.target.value })}
                      placeholder="https://mega.nz/file/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-neutral-300">Torrent Link / Magnet URI</label>
                    <input
                      type="text"
                      value={movieEditForm.torrentUrl}
                      onChange={(e) => setMovieEditForm({ ...movieEditForm, torrentUrl: e.target.value })}
                      placeholder="magnet:?xt=urn:btih:... or .torrent URL"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* VIP Membership Config for Movie */}
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">VIP සාමාජික ප්‍රවේශය (VIP Membership Access)</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={movieEditForm.isVip}
                      onChange={(e) => setMovieEditForm({ ...movieEditForm, isVip: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span className="text-xs font-bold text-amber-300">මෙම චිත්‍රපටය VIP කරන්න</span>
                  </label>
                </div>

                {movieEditForm.isVip && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-300">අවශ්‍ය VIP Tier</label>
                      <select
                        value={movieEditForm.vipTier}
                        onChange={(e) => setMovieEditForm({ ...movieEditForm, vipTier: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-amber-500/40 text-amber-100 text-xs"
                      >
                        <option value="all">සියලු VIP සාමාජිකයින් (All VIPs)</option>
                        <option value="silver">Silver Tier & ඉහළ</option>
                        <option value="gold">Gold Tier & ඉහළ</option>
                        <option value="diamond">Diamond Exclusive පමණි</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-300">VIP Telegram Bot Code</label>
                      <input
                        type="text"
                        value={movieEditForm.vipTelegramCode}
                        onChange={(e) => setMovieEditForm({ ...movieEditForm, vipTelegramCode: e.target.value })}
                        placeholder="උදා: VIP-MOV-9823"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-amber-500/40 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sinhala Synopsis with AI Regeneration */}
              <div className="space-y-2 p-4 rounded-2xl bg-neutral-950 border border-amber-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>සිංහල විස්තරය (AI Generated Sinhala Synopsis & Review)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={movieAiPromptNote}
                      onChange={(e) => setMovieAiPromptNote(e.target.value)}
                      placeholder="AI වෙත විශේෂ උපදෙස් (උදා: වැඩිපුර විස්තර එකතු කරන්න)..."
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 w-48 sm:w-64"
                    />
                    <button
                      type="button"
                      disabled={isGeneratingMovieAi}
                      onClick={handleGenerateAiForEditMovie}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] rounded-lg flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingMovieAi ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>සකසමින්...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>AI මඟින් නැවත සකසන්න</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <textarea
                  rows={5}
                  value={movieEditForm.sinhalaDescription}
                  onChange={(e) => setMovieEditForm({ ...movieEditForm, sinhalaDescription: e.target.value })}
                  placeholder="චිත්‍රපටයේ සිංහල සාරාංශය සහ විචාරය..."
                  className="w-full p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-amber-100 text-xs leading-relaxed focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              {/* English Overview */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400">English Overview</label>
                <textarea
                  rows={3}
                  value={movieEditForm.overview}
                  onChange={(e) => setMovieEditForm({ ...movieEditForm, overview: e.target.value })}
                  className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs leading-relaxed"
                ></textarea>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-300 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={movieEditForm.hasSinhalaSub}
                    onChange={(e) => setMovieEditForm({ ...movieEditForm, hasSinhalaSub: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span className="font-semibold text-emerald-400">සිංහල උපසිරැසි ඇත (Sinhala Sub Available)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={movieEditForm.isFeatured}
                    onChange={(e) => setMovieEditForm({ ...movieEditForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span className="font-semibold text-amber-300">Featured on Home Page</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={movieEditForm.isPublished}
                    onChange={(e) => setMovieEditForm({ ...movieEditForm, isPublished: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span className="font-semibold text-white">Published (ප්‍රසිද්ධ කරන්න)</span>
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  disabled={isSavingMovie}
                  onClick={() => {
                    setEditingMovie(null);
                    setMovieEditForm(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  අවලංගු කරන්න (Cancel)
                </button>

                <button
                  type="submit"
                  disabled={isSavingMovie}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingMovie ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>සුරකිමින් පවතී...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>වෙනස්කම් සුරකින්න (Save Changes)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* FULL EDIT TV SERIES MODAL */}
      {/* ---------------------------------------------------- */}
      {editingSeries && seriesEditForm && (
        <div
          id="admin-edit-series-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSavingSeries) {
              setEditingSeries(null);
              setSeriesEditForm(null);
            }
          }}
        >
          <div
            id="admin-edit-series-modal"
            className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left my-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-500/20 border border-sky-500/40 rounded-2xl text-sky-400">
                  <Tv className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">TV Series සංස්කරණය කරන්න (Edit TV Series)</h4>
                  <p className="text-xs text-neutral-400">
                    ID: <span className="font-mono text-sky-400">{editingSeries.id}</span> • {editingSeries.title}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isSavingSeries}
                onClick={() => {
                  setEditingSeries(null);
                  setSeriesEditForm(null);
                }}
                className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSeries} className="space-y-6">
              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Series Title (නම) *</label>
                  <input
                    type="text"
                    required
                    value={seriesEditForm.title}
                    onChange={(e) => setSeriesEditForm({ ...seriesEditForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Original Title</label>
                  <input
                    type="text"
                    value={seriesEditForm.originalTitle}
                    onChange={(e) => setSeriesEditForm({ ...seriesEditForm, originalTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">First Air Year</label>
                  <input
                    type="number"
                    value={seriesEditForm.year}
                    onChange={(e) => setSeriesEditForm({ ...seriesEditForm, year: parseInt(e.target.value, 10) || 2026 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">IMDb Rating (e.g. 9.1)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={seriesEditForm.rating}
                    onChange={(e) => setSeriesEditForm({ ...seriesEditForm, rating: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">IMDb ID (tt...)</label>
                  <input
                    type="text"
                    value={seriesEditForm.imdbId}
                    onChange={(e) => setSeriesEditForm({ ...seriesEditForm, imdbId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Seasons Count (සීසන් ගණන)</label>
                  <input
                    type="number"
                    value={seriesEditForm.seasonsCount}
                    onChange={(e) => setSeriesEditForm({ ...seriesEditForm, seasonsCount: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Total Episodes Count</label>
                  <input
                    type="number"
                    value={seriesEditForm.episodesCount}
                    onChange={(e) => setSeriesEditForm({ ...seriesEditForm, episodesCount: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Content Rating</label>
                  <input
                    type="text"
                    value={seriesEditForm.contentRating}
                    onChange={(e) => setSeriesEditForm({ ...seriesEditForm, contentRating: e.target.value })}
                    placeholder="TV-MA, TV-14"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Creators / Directors</label>
                  <input
                    type="text"
                    value={seriesEditForm.creators}
                    onChange={(e) => setSeriesEditForm({ ...seriesEditForm, creators: e.target.value })}
                    placeholder="David Benioff, D.B. Weiss"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Cast & Genres */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Cast (රංගන ශිල්පීන් - කොමා මඟින් වෙන්කරන්න)</label>
                  <input
                    type="text"
                    value={seriesEditForm.cast}
                    onChange={(e) => setSeriesEditForm({ ...seriesEditForm, cast: e.target.value })}
                    placeholder="Bryan Cranston, Aaron Paul, Bob Odenkirk"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-300">Genres (වර්ගීකරණය)</label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                    {[
                      "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
                      "Drama", "Family", "Fantasy", "History", "Horror", "Mystery",
                      "Romance", "Sci-Fi", "Thriller", "War", "Western", "Mini-Series"
                    ].map((genre) => {
                      const isSelected = seriesEditForm.genres?.includes(genre);
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => {
                            const cur = seriesEditForm.genres || [];
                            const updated = isSelected
                              ? cur.filter((g: string) => g !== genre)
                              : [...cur, genre];
                            setSeriesEditForm({ ...seriesEditForm, genres: updated });
                          }}
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-sky-500 text-black font-bold"
                              : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                          }`}
                        >
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Media Images & Video URLs */}
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-4">
                <h5 className="text-xs font-black text-sky-400 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>පින්තූර සහ මාධ්‍ය සබැඳි (Media & Posters)</span>
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Poster */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                      <span>Poster Image URL</span>
                      <label className="text-[11px] text-sky-400 hover:underline cursor-pointer flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Upload File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleUploadSeriesEditImage(e.target.files[0], "posterUrl");
                          }}
                        />
                      </label>
                    </label>
                    <div className="flex gap-2">
                      {seriesEditForm.posterUrl && (
                        <img
                          src={seriesEditForm.posterUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-10 h-14 object-cover rounded bg-neutral-900 border border-neutral-800"
                        />
                      )}
                      <input
                        type="text"
                        value={seriesEditForm.posterUrl}
                        onChange={(e) => setSeriesEditForm({ ...seriesEditForm, posterUrl: e.target.value })}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Backdrop */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                      <span>Backdrop / Cover URL</span>
                      <label className="text-[11px] text-sky-400 hover:underline cursor-pointer flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Upload File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleUploadSeriesEditImage(e.target.files[0], "backdropUrl");
                          }}
                        />
                      </label>
                    </label>
                    <div className="flex gap-2">
                      {seriesEditForm.backdropUrl && (
                        <img
                          src={seriesEditForm.backdropUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-16 h-10 object-cover rounded bg-neutral-900 border border-neutral-800"
                        />
                      )}
                      <input
                        type="text"
                        value={seriesEditForm.backdropUrl}
                        onChange={(e) => setSeriesEditForm({ ...seriesEditForm, backdropUrl: e.target.value })}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Trailer */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-neutral-300">YouTube Trailer URL</label>
                    <input
                      type="text"
                      value={seriesEditForm.trailerUrl}
                      onChange={(e) => setSeriesEditForm({ ...seriesEditForm, trailerUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs"
                    />
                  </div>
                </div>

                {/* 6 Unique Sample Images Manager for TV Series Edit Modal */}
                <div className="pt-2">
                  <SampleImagesManager
                    images={Array.isArray(seriesEditForm.images) ? seriesEditForm.images : []}
                    onChange={(imgs) => setSeriesEditForm({ ...seriesEditForm, images: imgs })}
                    title="TV Series එකෙහි Sample Images 6ක් (6 Unique Sample Images Gallery)"
                    themeColor="sky"
                    posterUrl={seriesEditForm.posterUrl}
                    backdropUrl={seriesEditForm.backdropUrl}
                  />
                </div>
              </div>

              {/* VIP Membership Config for Series */}
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">VIP සාමාජික ප්‍රවේශය (VIP Membership Access)</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={seriesEditForm.isVip}
                      onChange={(e) => setSeriesEditForm({ ...seriesEditForm, isVip: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span className="text-xs font-bold text-amber-300">මෙම TV Series VIP කරන්න</span>
                  </label>
                </div>

                {seriesEditForm.isVip && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-300">අවශ්‍ය VIP Tier</label>
                      <select
                        value={seriesEditForm.vipTier}
                        onChange={(e) => setSeriesEditForm({ ...seriesEditForm, vipTier: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-amber-500/40 text-amber-100 text-xs"
                      >
                        <option value="all">සියලු VIP සාමාජිකයින් (All VIPs)</option>
                        <option value="silver">Silver Tier & ඉහළ</option>
                        <option value="gold">Gold Tier & ඉහළ</option>
                        <option value="diamond">Diamond Exclusive පමණි</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-300">VIP Telegram Bot Code</label>
                      <input
                        type="text"
                        value={seriesEditForm.vipTelegramCode}
                        onChange={(e) => setSeriesEditForm({ ...seriesEditForm, vipTelegramCode: e.target.value })}
                        placeholder="උදා: VIP-TV-4912"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-amber-500/40 text-white text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-300">VIP Direct Drive Cloud Link</label>
                      <input
                        type="text"
                        value={seriesEditForm.vipDriveLink}
                        onChange={(e) => setSeriesEditForm({ ...seriesEditForm, vipDriveLink: e.target.value })}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-amber-500/40 text-white text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-300">VIP Mega Mirror Link</label>
                      <input
                        type="text"
                        value={seriesEditForm.vipMegaLink}
                        onChange={(e) => setSeriesEditForm({ ...seriesEditForm, vipMegaLink: e.target.value })}
                        placeholder="https://mega.nz/folder/..."
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-amber-500/40 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sinhala Synopsis with AI Regeneration */}
              <div className="space-y-2 p-4 rounded-2xl bg-neutral-950 border border-sky-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>සිංහල විස්තරය (AI Generated Sinhala Synopsis & Review)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={seriesAiPromptNote}
                      onChange={(e) => setSeriesAiPromptNote(e.target.value)}
                      placeholder="AI වෙත විශේෂ උපදෙස් (උදා: Seasons සහ චරිත ගැන ලියන්න)..."
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 w-48 sm:w-64"
                    />
                    <button
                      type="button"
                      disabled={isGeneratingSeriesAi}
                      onClick={handleGenerateAiForEditSeries}
                      className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-black font-bold text-[11px] rounded-lg flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingSeriesAi ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>සකසමින්...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>AI මඟින් නැවත සකසන්න</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <textarea
                  rows={5}
                  value={seriesEditForm.sinhalaDescription}
                  onChange={(e) => setSeriesEditForm({ ...seriesEditForm, sinhalaDescription: e.target.value })}
                  placeholder="TV Series හි සිංහල සාරාංශය සහ විචාරය..."
                  className="w-full p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-sky-100 text-xs leading-relaxed focus:outline-none focus:border-sky-500"
                ></textarea>
              </div>

              {/* English Overview */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400">English Overview</label>
                <textarea
                  rows={3}
                  value={seriesEditForm.overview}
                  onChange={(e) => setSeriesEditForm({ ...seriesEditForm, overview: e.target.value })}
                  className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs leading-relaxed"
                ></textarea>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-300 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={seriesEditForm.hasSinhalaSub}
                    onChange={(e) => setSeriesEditForm({ ...seriesEditForm, hasSinhalaSub: e.target.checked })}
                    className="w-4 h-4 accent-sky-500 rounded"
                  />
                  <span className="font-semibold text-emerald-400">සිංහල උපසිරැසි ඇත (Sinhala Sub Available)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={seriesEditForm.isFeatured}
                    onChange={(e) => setSeriesEditForm({ ...seriesEditForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-sky-500 rounded"
                  />
                  <span className="font-semibold text-sky-300">Featured on Home Page</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={seriesEditForm.isPublished}
                    onChange={(e) => setSeriesEditForm({ ...seriesEditForm, isPublished: e.target.checked })}
                    className="w-4 h-4 accent-sky-500 rounded"
                  />
                  <span className="font-semibold text-white">Published (ප්‍රසිද්ධ කරන්න)</span>
                </label>
              </div>

              {/* Seasons & Episodes Manager in Edit Modal */}
              <div className="p-4 sm:p-6 rounded-2xl bg-neutral-950/90 border border-sky-500/30 space-y-4">
                <SeasonEpisodeManager
                  seriesTitle={seriesEditForm.title || editingSeries.title}
                  seriesOverview={seriesEditForm.overview}
                  seasons={seriesEditForm.seasons || []}
                  onChange={(updatedSeasons) => {
                    const epCount = updatedSeasons.reduce(
                      (acc: number, s: Season) => acc + (s.episodes?.length || 0),
                      0
                    );
                    setSeriesEditForm({
                      ...seriesEditForm,
                      seasons: updatedSeasons,
                      seasonsCount: updatedSeasons.length,
                      episodesCount: epCount,
                    });
                  }}
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  disabled={isSavingSeries}
                  onClick={() => {
                    setEditingSeries(null);
                    setSeriesEditForm(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  අවලංගු කරන්න (Cancel)
                </button>

                <button
                  type="submit"
                  disabled={isSavingSeries}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingSeries ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>සුරකිමින් පවතී...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>වෙනස්කම් සුරකින්න (Save Changes)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STANDALONE DEDICATED SEASONS & EPISODES MODAL */}
      {/* ---------------------------------------------------- */}
      {manageSeasonsSeries && (
        <div
          id="admin-manage-seasons-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSavingSeasons) {
              setManageSeasonsSeries(null);
            }
          }}
        >
          <div
            id="admin-manage-seasons-modal"
            className="relative w-full max-w-5xl bg-neutral-900 border border-neutral-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-red-400 uppercase tracking-wider">
                      TV SERIES SEASONS & EPISODES MANAGER
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
                      {manageSeasonsSeries.year || 2026}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {manageSeasonsSeries.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                disabled={isSavingSeasons}
                onClick={() => setManageSeasonsSeries(null)}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {isLoadingSeasons ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-neutral-400">Seasons සහ Episodes පූරණය වෙමින් පවතී...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <SeasonEpisodeManager
                  seriesTitle={manageSeasonsSeries.title}
                  seriesOverview={manageSeasonsSeries.overview}
                  seasons={manageSeasonsList}
                  onChange={(updated) => setManageSeasonsList(updated)}
                  disabled={isSavingSeasons}
                />

                {/* Footer Save / Cancel Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                  <div className="text-xs text-neutral-400">
                    <span className="font-bold text-white">{manageSeasonsList.length}</span> Seasons සහ{" "}
                    <span className="font-bold text-white">
                      {manageSeasonsList.reduce((acc, s) => acc + (s.episodes?.length || 0), 0)}
                    </span> Episodes සුරැකීමට සූදානම්.
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isSavingSeasons}
                      onClick={() => setManageSeasonsSeries(null)}
                      className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      අවලංගු කරන්න (Cancel)
                    </button>

                    <button
                      type="button"
                      disabled={isSavingSeasons}
                      onClick={handleSaveManageSeasons}
                      className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSavingSeasons ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>සුරකිමින් පවතී...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Seasons & Episodes සුරකින්න (Save All)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* IN-APP DELETE CONFIRMATION MODAL */}
      {/* ---------------------------------------------------- */}
      {deleteTarget && (
        <div
          id="admin-delete-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              setDeleteTarget(null);
            }
          }}
        >
          <div
            id="admin-delete-modal"
            className="relative w-full max-w-md bg-neutral-900 border border-neutral-700/80 rounded-3xl p-6 shadow-2xl space-y-5 text-left animate-in fade-in zoom-in duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-950/80 border border-red-800/60 rounded-2xl text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">මකා දැමීම තහවුරු කරන්න</h4>
                  <p className="text-xs text-neutral-400">Confirm Deletion</p>
                </div>
              </div>

              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-2 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
              <p>
                ඔබට{" "}
                <span className="font-bold text-red-400">"{deleteTarget.title}"</span>{" "}
                {deleteTarget.type === "movie"
                  ? "චිත්‍රපටය සහ ඊට අදාළ විස්තර"
                  : deleteTarget.type === "series"
                  ? "ටීවී සීරීස් සහ සියලුම Seasons / Episodes"
                  : "උපසිරැසි ගොනුව"}{" "}
                ස්ථිරවම මකා දැමීමට අවශ්‍ය බව සහතිකද?
              </p>
              <p className="text-[11px] text-neutral-500">
                ⚠️ මෙම ක්‍රියාව ආපසු හැරවිය නොහැක (This action cannot be undone).
              </p>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                අවලංගු කරන්න (Cancel)
              </button>
              <button
                id="admin-confirm-delete-btn"
                type="button"
                disabled={isDeleting}
                onClick={executeDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>මකමින් පවතී...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>ඔව්, මකන්න (Delete)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
