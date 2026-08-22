import { TMDBMovieData, TMDBSeriesData } from "../src/types";

const DEFAULT_TMDB_KEY = "4a1a05db269fb2395c9b055504a95439";

export function getTmdbApiKey(): string {
  return process.env.TMDB_API_KEY || DEFAULT_TMDB_KEY;
}

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/original";
const TMDB_POSTER_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

export async function fetchMovieByImdbId(imdbId: string): Promise<TMDBMovieData | null> {
  const apiKey = getTmdbApiKey();
  const cleanImdb = imdbId.trim();

  try {
    // 1. Find TMDB ID using IMDb ID
    const findUrl = `https://api.themoviedb.org/3/find/${cleanImdb}?api_key=${apiKey}&external_source=imdb_id`;
    const findRes = await fetch(findUrl);
    if (!findRes.ok) {
      throw new Error(`TMDB find failed: ${findRes.statusText}`);
    }
    const findData = await findRes.json();

    const movieResult = findData.movie_results?.[0];
    if (!movieResult) {
      return null;
    }

    const tmdbId = movieResult.id;

    // 2. Fetch full movie details with videos, credits, and images
    const detailsUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&append_to_response=videos,credits,images`;
    const detailsRes = await fetch(detailsUrl);
    if (!detailsRes.ok) {
      throw new Error(`TMDB movie details failed: ${detailsRes.statusText}`);
    }
    const data = await detailsRes.json();

    // Director & Cast
    let director = "Unknown Director";
    const crew = data.credits?.crew || [];
    const dirObj = crew.find((c: any) => c.job === "Director" || c.department === "Directing");
    if (dirObj) director = dirObj.name;

    const cast = (data.credits?.cast || []).slice(0, 8).map((c: any) => c.name);

    // Official Trailer from YouTube
    let trailerUrl = "";
    const videos = data.videos?.results || [];
    const officialTrailer = videos.find(
      (v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser") && v.official
    ) || videos.find((v: any) => v.site === "YouTube" && v.type === "Trailer") || videos.find((v: any) => v.site === "YouTube");

    if (officialTrailer?.key) {
      trailerUrl = `https://www.youtube.com/watch?v=${officialTrailer.key}`;
    }

    // 6 Unique Images (backdrops & production stills, strictly removing duplicates and posters)
    const uniqueImages = new Set<string>();
    const seenPaths = new Set<string>();

    // Priority 1: Backdrops from images endpoint
    const backdrops = data.images?.backdrops || [];
    for (const b of backdrops) {
      if (b.file_path && !seenPaths.has(b.file_path) && uniqueImages.size < 6) {
        seenPaths.add(b.file_path);
        uniqueImages.add(`${TMDB_BACKDROP_BASE}${b.file_path}`);
      }
    }

    // Priority 2: If fewer than 6, fetch extra backdrops with all languages
    if (uniqueImages.size < 6) {
      try {
        const imgRes = await fetch(
          `https://api.themoviedb.org/3/movie/${tmdbId}/images?api_key=${apiKey}&include_image_language=en,null,ja,ko,es,fr,de`
        );
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          for (const b of (imgData.backdrops || [])) {
            if (b.file_path && !seenPaths.has(b.file_path) && uniqueImages.size < 6) {
              seenPaths.add(b.file_path);
              uniqueImages.add(`${TMDB_BACKDROP_BASE}${b.file_path}`);
            }
          }
        }
      } catch (e) {
        console.warn("Could not fetch extra movie stills:", e);
      }
    }

    // Fallback backdrop if still fewer than 6
    if (uniqueImages.size < 6 && data.backdrop_path && !seenPaths.has(data.backdrop_path)) {
      seenPaths.add(data.backdrop_path);
      uniqueImages.add(`${TMDB_BACKDROP_BASE}${data.backdrop_path}`);
    }

    const imagesArray = Array.from(uniqueImages);

    const year = data.release_date ? parseInt(data.release_date.split("-")[0], 10) : 0;
    const country = data.production_countries?.[0]?.name || "United States";
    const language = data.spoken_languages?.[0]?.english_name || data.original_language || "English";

    return {
      imdbId: cleanImdb,
      tmdbId,
      title: data.title || movieResult.title,
      originalTitle: data.original_title || data.title,
      year,
      releaseDate: data.release_date || "",
      runtime: data.runtime || 120,
      genres: (data.genres || []).map((g: any) => g.name),
      rating: parseFloat(Number(data.vote_average || 0).toFixed(1)),
      overview: data.overview || "",
      director,
      cast,
      country,
      language,
      posterUrl: data.poster_path ? `${TMDB_POSTER_BASE}${data.poster_path}` : "",
      backdropUrl: data.backdrop_path ? `${TMDB_BACKDROP_BASE}${data.backdrop_path}` : "",
      trailerUrl,
      images: imagesArray,
    };
  } catch (error) {
    console.error(`Error fetching movie for IMDb ID ${cleanImdb}:`, error);
    return null;
  }
}

export async function fetchSeriesByImdbId(imdbId: string): Promise<TMDBSeriesData | null> {
  const apiKey = getTmdbApiKey();
  const cleanImdb = imdbId.trim();

  try {
    // 1. Find TMDB ID using IMDb ID
    const findUrl = `https://api.themoviedb.org/3/find/${cleanImdb}?api_key=${apiKey}&external_source=imdb_id`;
    const findRes = await fetch(findUrl);
    if (!findRes.ok) {
      throw new Error(`TMDB find failed: ${findRes.statusText}`);
    }
    const findData = await findRes.json();

    const tvResult = findData.tv_results?.[0];
    if (!tvResult) {
      return null;
    }

    const tmdbId = tvResult.id;

    // 2. Fetch full series details
    const detailsUrl = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${apiKey}&append_to_response=videos,credits,images`;
    const detailsRes = await fetch(detailsUrl);
    if (!detailsRes.ok) {
      throw new Error(`TMDB TV details failed: ${detailsRes.statusText}`);
    }
    const data = await detailsRes.json();

    // Creators and Cast
    const creators = (data.created_by || []).map((c: any) => c.name);
    const cast = (data.credits?.cast || []).slice(0, 8).map((c: any) => c.name);

    // Official Trailer
    let trailerUrl = "";
    const videos = data.videos?.results || [];
    const officialTrailer = videos.find(
      (v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
    ) || videos.find((v: any) => v.site === "YouTube");

    if (officialTrailer?.key) {
      trailerUrl = `https://www.youtube.com/watch?v=${officialTrailer.key}`;
    }

    // Fetch season 1..5 episodes if available
    const seasonsData: any[] = [];
    const validSeasons = (data.seasons || []).filter((s: any) => s.season_number > 0);
    const episodeStills: string[] = [];

    for (const s of validSeasons.slice(0, 5)) {
      try {
        const sRes = await fetch(
          `https://api.themoviedb.org/3/tv/${tmdbId}/season/${s.season_number}?api_key=${apiKey}`
        );
        if (sRes.ok) {
          const sJson = await sRes.json();
          const epList = (sJson.episodes || []).slice(0, 24);
          for (const ep of epList) {
            if (ep.still_path) {
              episodeStills.push(`${TMDB_BACKDROP_BASE}${ep.still_path}`);
            }
          }
          seasonsData.push({
            seasonNumber: s.season_number,
            name: s.name || `Season ${s.season_number}`,
            overview: s.overview || "",
            posterUrl: s.poster_path ? `${TMDB_POSTER_BASE}${s.poster_path}` : "",
            episodeCount: sJson.episodes?.length || s.episode_count || 0,
            episodes: epList.map((ep: any) => ({
              episodeNumber: ep.episode_number,
              title: ep.name || `Episode ${ep.episode_number}`,
              airDate: ep.air_date || "",
              runtime: ep.runtime || 45,
              overview: ep.overview || "",
              thumbnailUrl: ep.still_path ? `${TMDB_BACKDROP_BASE}${ep.still_path}` : "",
            })),
          });
        }
      } catch (err) {
        console.error(`Error fetching season ${s.season_number}:`, err);
      }
    }

    // 6 unique, completely different images from backdrops + episode scene stills
    const uniqueImages = new Set<string>();
    const seenPaths = new Set<string>();

    const backdrops = data.images?.backdrops || [];
    for (const b of backdrops) {
      if (b.file_path && !seenPaths.has(b.file_path) && uniqueImages.size < 3) {
        seenPaths.add(b.file_path);
        uniqueImages.add(`${TMDB_BACKDROP_BASE}${b.file_path}`);
      }
    }

    // Add unique episode stills to ensure completely distinct scenes
    for (const still of episodeStills) {
      if (!uniqueImages.has(still) && uniqueImages.size < 6) {
        uniqueImages.add(still);
      }
    }

    // If still under 6, add remaining backdrops
    for (const b of backdrops) {
      if (b.file_path && !seenPaths.has(b.file_path) && uniqueImages.size < 6) {
        seenPaths.add(b.file_path);
        uniqueImages.add(`${TMDB_BACKDROP_BASE}${b.file_path}`);
      }
    }

    if (uniqueImages.size < 6 && data.backdrop_path && !seenPaths.has(data.backdrop_path)) {
      seenPaths.add(data.backdrop_path);
      uniqueImages.add(`${TMDB_BACKDROP_BASE}${data.backdrop_path}`);
    }

    const imagesArray = Array.from(uniqueImages);

    const year = data.first_air_date ? parseInt(data.first_air_date.split("-")[0], 10) : 0;

    return {
      imdbId: cleanImdb,
      tmdbId,
      title: data.name || tvResult.name,
      originalTitle: data.original_name || data.name,
      firstAirDate: data.first_air_date || "",
      year,
      rating: parseFloat(Number(data.vote_average || 0).toFixed(1)),
      genres: (data.genres || []).map((g: any) => g.name),
      overview: data.overview || "",
      creators: creators.length > 0 ? creators : ["Various Creators"],
      cast,
      posterUrl: data.poster_path ? `${TMDB_POSTER_BASE}${data.poster_path}` : "",
      backdropUrl: data.backdrop_path ? `${TMDB_BACKDROP_BASE}${data.backdrop_path}` : "",
      trailerUrl,
      seasons: seasonsData,
      images: Array.from(uniqueImages),
    };
  } catch (error) {
    console.error(`Error fetching TV series for IMDb ID ${cleanImdb}:`, error);
    return null;
  }
}
