import { Movie, TVSeries, MovieCollection, SubtitleFile, SiteSettings, AdminStats, TMDBMovieData, TMDBSeriesData } from "./types";

const API_BASE = "";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("serieshub_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Settings
  async getSettings(): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/api/settings`);
    if (!res.ok) throw new Error("Failed to load settings");
    return res.json();
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error("Failed to update settings");
    return res.json();
  },

  // Admin Auth
  async login(password: string, email?: string): Promise<{ success: boolean; token: string; user: any }> {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    localStorage.setItem("serieshub_admin_token", data.token);
    return data;
  },

  async checkAuth(): Promise<boolean> {
    const token = localStorage.getItem("serieshub_admin_token");
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/api/admin/me`, {
        headers: getAuthHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  logout() {
    localStorage.removeItem("serieshub_admin_token");
  },

  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/api/admin/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch admin stats");
    return res.json();
  },

  // Movies
  async getMovies(params?: {
    publishedOnly?: boolean;
    featured?: boolean;
    search?: string;
    genre?: string;
    year?: number;
    collection?: string;
    limit?: number;
    page?: number;
    sort?: string;
  }): Promise<{ movies: Movie[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.publishedOnly !== undefined) query.set("publishedOnly", String(params.publishedOnly));
    if (params?.featured !== undefined) query.set("featured", String(params.featured));
    if (params?.search) query.set("search", params.search);
    if (params?.genre) query.set("genre", params.genre);
    if (params?.year) query.set("year", String(params.year));
    if (params?.collection) query.set("collection", params.collection);
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.page) query.set("page", String(params.page));
    if (params?.sort) query.set("sort", params.sort);

    const res = await fetch(`${API_BASE}/api/movies?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch movies");
    return res.json();
  },

  async getMovie(idOrSlug: string): Promise<Movie & { images: any[]; subtitles: SubtitleFile[] }> {
    const res = await fetch(`${API_BASE}/api/movies/${encodeURIComponent(idOrSlug)}`);
    if (!res.ok) throw new Error("චිත්‍රපටය සොයාගත නොහැක.");
    return res.json();
  },

  async createMovie(movieData: any): Promise<Movie> {
    const res = await fetch(`${API_BASE}/api/movies`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(movieData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create movie");
    return data;
  },

  async updateMovie(id: string, movieData: any): Promise<Movie> {
    const res = await fetch(`${API_BASE}/api/movies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(movieData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update movie");
    return data;
  },

  async deleteMovie(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/movies/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete movie");
  },

  // TV Series
  async getTVSeries(params?: {
    publishedOnly?: boolean;
    featured?: boolean;
    search?: string;
    genre?: string;
    year?: number;
    limit?: number;
    page?: number;
  }): Promise<{ series: TVSeries[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.publishedOnly !== undefined) query.set("publishedOnly", String(params.publishedOnly));
    if (params?.featured !== undefined) query.set("featured", String(params.featured));
    if (params?.search) query.set("search", params.search);
    if (params?.genre) query.set("genre", params.genre);
    if (params?.year) query.set("year", String(params.year));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.page) query.set("page", String(params.page));

    const res = await fetch(`${API_BASE}/api/series?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch series");
    return res.json();
  },

  async getSeries(idOrSlug: string): Promise<TVSeries & { seasons: any[] }> {
    const res = await fetch(`${API_BASE}/api/series/${encodeURIComponent(idOrSlug)}`);
    if (!res.ok) throw new Error("ටීවී සීරීස් සොයාගත නොහැක.");
    return res.json();
  },

  async getTVSeriesById(id: string): Promise<TVSeries & { seasons: any[] }> {
    return this.getSeries(id);
  },

  async createTVSeries(seriesData: any): Promise<TVSeries> {
    const res = await fetch(`${API_BASE}/api/series`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(seriesData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create series");
    return data;
  },

  async updateTVSeries(id: string, seriesData: any): Promise<TVSeries> {
    const res = await fetch(`${API_BASE}/api/series/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(seriesData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update series");
    return data;
  },

  async deleteTVSeries(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/series/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete series");
  },

  async addSeason(seriesId: string, seasonData: any): Promise<any> {
    const res = await fetch(`${API_BASE}/api/series/${seriesId}/seasons`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(seasonData),
    });
    return res.json();
  },

  async updateSeason(id: string, seasonData: any): Promise<any> {
    const res = await fetch(`${API_BASE}/api/seasons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(seasonData),
    });
    return res.json();
  },

  async deleteSeason(id: string): Promise<void> {
    await fetch(`${API_BASE}/api/seasons/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  },

  async syncSeriesSeasons(seriesId: string, seasons: any[]): Promise<any> {
    const res = await fetch(`${API_BASE}/api/series/${seriesId}/seasons-sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ seasons }),
    });
    return res.json();
  },

  async uploadMediaFile(file: File): Promise<{ url: string; fileName: string; fileSize: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const headers = getAuthHeaders();
    delete (headers as any)["Content-Type"];

    const res = await fetch(`${API_BASE}/api/media/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "File upload failed");
    return data;
  },

  async addEpisode(seasonId: string, episodeData: any): Promise<any> {
    const res = await fetch(`${API_BASE}/api/seasons/${seasonId}/episodes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(episodeData),
    });
    return res.json();
  },

  async updateEpisode(id: string, episodeData: any): Promise<any> {
    const res = await fetch(`${API_BASE}/api/episodes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(episodeData),
    });
    return res.json();
  },

  async deleteEpisode(id: string): Promise<void> {
    await fetch(`${API_BASE}/api/episodes/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  },

  // Collections
  async getCollections(): Promise<MovieCollection[]> {
    const res = await fetch(`${API_BASE}/api/collections`);
    if (!res.ok) throw new Error("Failed to fetch collections");
    return res.json();
  },

  async getCollection(slug: string): Promise<MovieCollection & { movies: Movie[] }> {
    const res = await fetch(`${API_BASE}/api/collections/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error("එකතුව සොයාගත නොහැක.");
    return res.json();
  },

  async createCollection(data: any): Promise<MovieCollection> {
    const res = await fetch(`${API_BASE}/api/collections`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateCollection(id: string, data: any): Promise<MovieCollection> {
    const res = await fetch(`${API_BASE}/api/collections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteCollection(id: string): Promise<void> {
    await fetch(`${API_BASE}/api/collections/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  },

  // Subtitles
  async getSubtitles(): Promise<SubtitleFile[]> {
    const res = await fetch(`${API_BASE}/api/subtitles`);
    return res.json();
  },

  async uploadSubtitle(formData: FormData): Promise<SubtitleFile> {
    const res = await fetch(`${API_BASE}/api/subtitles/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to upload subtitle");
    return data;
  },

  async deleteSubtitle(id: string): Promise<void> {
    await fetch(`${API_BASE}/api/subtitles/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  },

  // Image Upload
  async uploadImage(file: File): Promise<{ success: boolean; url: string }> {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${API_BASE}/api/upload/image`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to upload image");
    return data;
  },

  // TMDB
  async fetchTmdbMovie(imdbId: string): Promise<TMDBMovieData & { sinhalaDescription: string }> {
    const res = await fetch(`${API_BASE}/api/tmdb/movie/${imdbId.trim()}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "TMDB movie lookup failed");
    return data;
  },

  async fetchTmdbSeries(imdbId: string): Promise<TMDBSeriesData & { sinhalaDescription: string }> {
    const res = await fetch(`${API_BASE}/api/tmdb/series/${imdbId.trim()}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "TMDB series lookup failed");
    return data;
  },

  // Gemini Sinhala Description
  async generateSinhalaDescription(payload: {
    title: string;
    year?: number | string;
    genres?: string[];
    overview?: string;
    directorOrCreator?: string;
    type?: "movie" | "series";
    cast?: string[];
    rating?: number | string;
    runtimeOrSeasons?: string;
    customPrompt?: string;
  }): Promise<string> {
    const res = await fetch(`${API_BASE}/api/gemini/sinhala-description`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to generate description");
    return data.sinhalaDescription;
  },

  async generateSeasonSinhalaDescription(payload: {
    seriesTitle: string;
    seasonNumber: number;
    seasonName?: string;
    seasonOverview?: string;
    seriesOverview?: string;
    customPrompt?: string;
  }): Promise<string> {
    const res = await fetch(`${API_BASE}/api/gemini/season-description`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to generate season description");
    return data.sinhalaDescription;
  },

  // Contact
  async sendContactMessage(payload: { name: string; email: string; subject: string; message: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send message");
    return data;
  },
};
