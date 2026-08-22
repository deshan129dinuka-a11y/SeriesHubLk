export interface Movie {
  id: string;
  slug: string;
  imdbId: string;
  tmdbId?: number;
  title: string;
  originalTitle?: string;
  year: number;
  releaseDate?: string;
  runtime?: number | string; // in minutes or string like '2h 23m'
  genres: string[];
  rating: number; // 0 - 10
  overview: string;
  sinhalaDescription?: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl?: string; // YouTube embed / watch URL
  director?: string;
  cast?: string[];
  country?: string;
  language?: string;
  contentRating?: string;
  streamingUrl?: string;
  downloadUrl?: string;
  videoDownloadUrl?: string;
  downloadUrl1080p?: string;
  downloadUrl720p?: string;
  downloadUrl4k?: string;
  megaDownloadUrl?: string;
  gdriveDownloadUrl?: string;
  torrentUrl?: string;
  fileSize1080p?: string;
  fileSize720p?: string;
  fileSize4k?: string;
  isVip?: boolean;
  vipTier?: "all" | "silver" | "gold" | "platinum";
  vipDriveLink?: string;
  vipMegaLink?: string;
  vipTelegramCode?: string;
  vipNotes?: string;
  hasSinhalaSub: boolean;
  published?: boolean;
  isPublished?: boolean;
  featured?: boolean;
  isFeatured?: boolean;
  collectionName?: string;
  collections?: string[]; // collection IDs or slugs
  createdAt?: string;
  updatedAt?: string;
  images?: (MovieImage | string)[];
  subtitles?: SubtitleFile[];
}

export interface MovieImage {
  id?: string;
  movieId?: string;
  imageUrl: string;
  imageType?: "backdrop" | "still" | "poster";
  displayOrder?: number;
}

export interface TVSeries {
  id: string;
  slug: string;
  imdbId: string;
  tmdbId?: number;
  title: string;
  originalTitle?: string;
  firstAirDate?: string;
  year: number;
  rating: number;
  genres: string[];
  overview: string;
  sinhalaDescription?: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl?: string;
  streamingUrl?: string;
  creators?: string[];
  cast?: string[];
  contentRating?: string;
  seasonsCount: number;
  episodesCount?: number;
  hasSinhalaSub: boolean;
  published?: boolean;
  isPublished?: boolean;
  featured?: boolean;
  isFeatured?: boolean;
  isVip?: boolean;
  vipTier?: "all" | "silver" | "gold" | "platinum";
  vipDriveLink?: string;
  vipMegaLink?: string;
  vipTelegramCode?: string;
  vipNotes?: string;
  createdAt?: string;
  updatedAt?: string;
  images?: (MovieImage | string)[];
  seasons?: Season[];
}

export interface Season {
  id: string;
  seriesId?: string;
  seasonNumber: number;
  name: string;
  overview?: string;
  sinhalaDescription?: string;
  posterUrl?: string;
  episodeCount?: number;
  episodesCount?: number;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  seriesId?: string;
  seasonId?: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  airDate?: string;
  runtime?: number | string;
  overview?: string;
  thumbnailUrl?: string;
  stillUrl?: string;
  streamingUrl?: string;
  videoUrl?: string;
  video720pUrl?: string;
  video1080pUrl?: string;
  downloadUrl?: string;
  download720pUrl?: string;
  download1080pUrl?: string;
  download720pSize?: string;
  download1080pSize?: string;
  subtitleUrl?: string;
  subtitleFileName?: string;
  hasSinhalaSub?: boolean;
  published?: boolean;
}

export interface MovieCollection {
  id: string;
  slug: string;
  title?: string;
  name?: string;
  sinhalaTitle?: string;
  nameSi?: string;
  description: string;
  coverImage?: string;
  posterUrl?: string;
  backdropUrl?: string;
  movieIds?: string[];
  moviesCount?: number;
  isFeatured?: boolean;
  movies?: Movie[];
}

export interface SubtitleFile {
  id: string;
  targetType: "movie" | "episode" | "series";
  targetId?: string;
  targetTitle?: string;
  language: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  uploadedAt?: string;
}

export interface SiteSettings {
  siteName: string;
  siteLogoUrl?: string;
  siteCoverUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  telegramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  tmdbApiKey?: string;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  heroHeading: string;
  heroSubheading: string;
  noticeBanner?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read?: boolean;
}

export interface AdminStats {
  totalMovies?: number;
  totalFilms?: number;
  totalTVSeries?: number;
  totalSeries?: number;
  totalSeasons?: number;
  totalEpisodes?: number;
  totalCollections?: number;
  totalSubtitles?: number;
  totalMessages?: number;
  totalContactMessages?: number;
}

export interface TMDBMovieData {
  imdbId: string;
  tmdbId?: number;
  title: string;
  originalTitle?: string;
  year?: number;
  releaseDate?: string;
  runtime?: string | number;
  genres?: string[];
  rating?: number;
  overview?: string;
  director?: string;
  cast?: string[];
  country?: string;
  language?: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  collectionName?: string;
  images?: string[];
}

export interface TMDBSeriesData {
  imdbId: string;
  tmdbId?: number;
  title: string;
  originalTitle?: string;
  firstAirDate?: string;
  year?: number;
  rating?: number;
  genres?: string[];
  overview?: string;
  creators?: string[];
  cast?: string[];
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  seasonsCount?: number;
  seasons?: {
    seasonNumber: number;
    name: string;
    overview?: string;
    posterUrl?: string;
    episodeCount?: number;
    episodes?: {
      episodeNumber: number;
      title: string;
      airDate?: string;
      runtime?: string | number;
      overview?: string;
      thumbnailUrl?: string;
      stillUrl?: string;
    }[];
  }[];
  images?: string[];
}
