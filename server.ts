import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db";
import { fetchMovieByImdbId, fetchSeriesByImdbId } from "./server/tmdb";
import { generateSinhalaDescription, generateSeasonSynopsis } from "./server/gemini";
import { generateAdminToken, requireAdminAuth, verifyAdminCredentials, AuthRequest } from "./server/auth";

const PORT = 3000;
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage for subtitles, images, and videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit for media / subtitles
  fileFilter: (req, file, cb) => {
    const allowed = [
      ".srt", ".vtt", ".ass", ".sub", ".zip", ".rar", ".7z",
      ".png", ".jpg", ".jpeg", ".webp", ".svg",
      ".mp4", ".mkv", ".webm"
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("සහාය නොදක්වන ගොනු ආකෘතියකි. (.srt, .zip, .mp4, .mkv හෝ පින්තූර භාවිතා කරන්න)"));
    }
  },
});

async function startServer() {
  const app = express();

  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

  // Static uploads directory
  app.use("/uploads", express.static(UPLOADS_DIR));
  app.use("/assets", express.static(path.join(process.cwd(), "assets")));

  // ----------------------------------------------------
  // API Routes
  // ----------------------------------------------------

  // Health
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", service: "SeriesHubLk API", timestamp: new Date().toISOString() });
  });

  // Settings
  app.get("/api/settings", (req: Request, res: Response) => {
    const settings = db.getSettings();
    res.json(settings);
  });

  app.put("/api/settings", requireAdminAuth, (req: AuthRequest, res: Response) => {
    const updated = db.updateSettings(req.body);
    res.json(updated);
  });

  // Admin Auth
  app.post("/api/admin/login", (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!verifyAdminCredentials(password)) {
      return res.status(401).json({ error: "මුරපදය වැරදියි. කරුණාකර නැවත උත්සාහ කරන්න." });
    }
    const token = generateAdminToken(email || "admin@serieshub.lk");
    res.json({
      success: true,
      token,
      user: { email: email || "admin@serieshub.lk", role: "admin" },
    });
  });

  app.get("/api/admin/me", requireAdminAuth, (req: AuthRequest, res: Response) => {
    res.json({ authenticated: true, user: req.user });
  });

  // Admin Stats
  app.get("/api/admin/stats", requireAdminAuth, (req: AuthRequest, res: Response) => {
    const stats = db.getStats();
    res.json(stats);
  });

  // Movies
  app.get("/api/movies", (req: Request, res: Response) => {
    const { publishedOnly, featured, search, genre, year, collection, limit, page, sort } = req.query;
    const result = db.getMovies({
      publishedOnly: publishedOnly === "true",
      featured: featured === "true",
      search: search ? String(search) : undefined,
      genre: genre ? String(genre) : undefined,
      year: year ? parseInt(String(year), 10) : undefined,
      collection: collection ? String(collection) : undefined,
      limit: limit ? parseInt(String(limit), 10) : undefined,
      page: page ? parseInt(String(page), 10) : undefined,
      sort: sort ? String(sort) : undefined,
    });
    res.json(result);
  });

  app.get("/api/movies/:idOrSlug", (req: Request, res: Response) => {
    const movie = db.getMovieByIdOrSlug(req.params.idOrSlug);
    if (!movie) {
      return res.status(404).json({ error: "චිත්‍රපටය සොයාගත නොහැක." });
    }
    res.json(movie);
  });

  app.post("/api/movies", requireAdminAuth, (req: AuthRequest, res: Response) => {
    try {
      const movie = db.createMovie(req.body);
      res.status(201).json(movie);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "චිත්‍රපටය එක්කිරීම අසාර්ථක විය." });
    }
  });

  app.put("/api/movies/:id", requireAdminAuth, (req: AuthRequest, res: Response) => {
    const updated = db.updateMovie(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "චිත්‍රපටය හමු නොවීය." });
    }
    res.json(updated);
  });

  app.delete("/api/movies/:id", requireAdminAuth, (req: AuthRequest, res: Response) => {
    const ok = db.deleteMovie(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: "චිත්‍රපටය හමු නොවීය." });
    }
    res.json({ success: true });
  });

  // TV Series
  app.get("/api/series", (req: Request, res: Response) => {
    const { publishedOnly, featured, search, genre, year, limit, page } = req.query;
    const result = db.getTVSeries({
      publishedOnly: publishedOnly === "true",
      featured: featured === "true",
      search: search ? String(search) : undefined,
      genre: genre ? String(genre) : undefined,
      year: year ? parseInt(String(year), 10) : undefined,
      limit: limit ? parseInt(String(limit), 10) : undefined,
      page: page ? parseInt(String(page), 10) : undefined,
    });
    res.json(result);
  });

  app.get("/api/series/:idOrSlug", (req: Request, res: Response) => {
    const series = db.getSeriesByIdOrSlug(req.params.idOrSlug);
    if (!series) {
      return res.status(404).json({ error: "ටීවී සීරීස් සොයාගත නොහැක." });
    }
    res.json(series);
  });

  app.post("/api/series", requireAdminAuth, (req: AuthRequest, res: Response) => {
    try {
      const series = db.createTVSeries(req.body);
      res.status(201).json(series);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "ටීවී සීරීස් එක්කිරීම අසාර්ථක විය." });
    }
  });

  app.put("/api/series/:id", requireAdminAuth, (req: AuthRequest, res: Response) => {
    const updated = db.updateTVSeries(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "ටීවී සීරීස් හමු නොවීය." });
    }
    res.json(updated);
  });

  app.delete("/api/series/:id", requireAdminAuth, (req: AuthRequest, res: Response) => {
    const ok = db.deleteTVSeries(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: "ටීවී සීරීස් හමු නොවීය." });
    }
    res.json({ success: true });
  });

  // Seasons & Episodes
  app.post("/api/series/:seriesId/seasons", requireAdminAuth, (req: AuthRequest, res: Response) => {
    const season = db.createSeason({ ...req.body, seriesId: req.params.seriesId });
    res.status(201).json(season);
  });

  app.put("/api/seasons/:id", requireAdminAuth, (req: AuthRequest, res: Response) => {
    const updated = db.updateSeason(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Season එක හමු නොවීය." });
    res.json(updated);
  });

  app.delete("/api/seasons/:id", requireAdminAuth, (req: AuthRequest, res: Response) => {
    const ok = db.deleteSeason(req.params.id);
    if (!ok) return res.status(404).json({ error: "Season එක හමු නොවීය." });
    res.json({ success: true });
  });

  app.post("/api/series/:seriesId/seasons-sync", requireAdminAuth, (req: AuthRequest, res: Response) => {
    const { seasons } = req.body;
    if (!Array.isArray(seasons)) {
      return res.status(400).json({ error: "Invalid seasons data" });
    }
    const saved = db.setSeriesSeasonsAndEpisodes(req.params.seriesId, seasons);
    res.json({ success: true, seasons: saved });
  });

  app.post("/api/seasons/:seasonId/episodes", requireAdminAuth, (req: AuthRequest, res: Response) => {
    const episode = db.createEpisode({ ...req.body, seasonId: req.params.seasonId });
    res.status(201).json(episode);
  });

  app.put("/api/episodes/:id", requireAdminAuth, (req: AuthRequest, res: Response) => {
    const updated = db.updateEpisode(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "කොටස හමු නොවීය." });
    res.json(updated);
  });

  app.delete("/api/episodes/:id", requireAdminAuth, (req: AuthRequest, res: Response) => {
    const ok = db.deleteEpisode(req.params.id);
    if (!ok) return res.status(404).json({ error: "කොටස හමු නොවීය." });
    res.json({ success: true });
  });

  // General Media & Subtitle file uploader for episodes
  app.post("/api/media/upload", requireAdminAuth, upload.single("file"), (req: AuthRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "කරුණාකර ගොනුවක් තෝරන්න." });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    const sizeInMB = (req.file.size / (1024 * 1024)).toFixed(1);
    const sizeFormatted = req.file.size > 1024 * 1024 ? `${sizeInMB} MB` : `${(req.file.size / 1024).toFixed(0)} KB`;
    
    res.status(201).json({
      url: fileUrl,
      fileName: req.file.originalname,
      fileSize: sizeFormatted,
      mimetype: req.file.mimetype,
    });
  });

  // Collections
  app.get("/api/collections", (req: Request, res: Response) => {
    const collections = db.getCollections();
    res.json(collections);
  });

  app.get("/api/collections/:slug", (req: Request, res: Response) => {
    const collection = db.getCollectionBySlug(req.params.slug);
    if (!collection) {
      return res.status(404).json({ error: "එකතුව සොයාගත නොහැක." });
    }
    res.json(collection);
  });

  app.post("/api/collections", requireAdminAuth, (req: AuthRequest, res: Response) => {
    const col = db.createCollection(req.body);
    res.status(201).json(col);
  });

  app.put("/api/collections/:id", requireAdminAuth, (req: AuthRequest, res: Response) => {
    const updated = db.updateCollection(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "එකතුව හමු නොවීය." });
    res.json(updated);
  });

  app.delete("/api/collections/:id", requireAdminAuth, (req: AuthRequest, res: Response) => {
    const ok = db.deleteCollection(req.params.id);
    if (!ok) return res.status(404).json({ error: "එකතුව හමු නොවීය." });
    res.json({ success: true });
  });

  // Subtitle management
  app.get("/api/subtitles", (req: Request, res: Response) => {
    const list = db.getSubtitles();
    res.json(list);
  });

  app.post("/api/subtitles/upload", upload.single("subtitleFile"), (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "කරුණාකර උපසිරැසි ගොනුවක් තෝරන්න." });
    }

    const { targetType, targetId, targetTitle, language } = req.body;
    const sizeInKB = (req.file.size / 1024).toFixed(1) + " KB";
    const fileUrl = `/uploads/${req.file.filename}`;

    const subRecord = db.addSubtitle({
      targetType: targetType || "movie",
      targetId: targetId || "",
      targetTitle: targetTitle || req.file.originalname,
      language: language || "Sinhala",
      fileName: req.file.originalname,
      fileSize: sizeInKB,
      fileUrl,
    });

    res.status(201).json(subRecord);
  });

  // Sample download handler (sends real text for sample subtitles or actual uploaded file)
  app.get("/api/subtitles/download/:id", (req: Request, res: Response) => {
    const sampleId = req.params.id;
    const subContent = `1\n00:00:01,000 --> 00:00:04,500\n[SeriesHubLk - සිංහල උපසිරැසි]\n\n2\n00:00:05,000 --> 00:00:09,000\nනැරඹීමට එක්වූ ඔබ සැමට ස්තූතියි!\n\n3\n00:00:10,000 --> 00:00:15,000\nSeriesHubLk.com වෙතින් නොමිලේ බාගත කරන්න.`;

    res.setHeader("Content-Disposition", `attachment; filename="SeriesHubLk_Sinhala_Subtitle_${sampleId}.srt"`);
    res.setHeader("Content-Type", "application/x-subrip; charset=utf-8");
    res.send(subContent);
  });

  app.delete("/api/subtitles/:id", requireAdminAuth, (req: AuthRequest, res: Response) => {
    const ok = db.deleteSubtitle(req.params.id);
    if (!ok) return res.status(404).json({ error: "උපසිරැසිය හමු නොවීය." });
    res.json({ success: true });
  });

  // Image Upload (Logo / Cover / Stills)
  app.post("/api/upload/image", upload.single("image"), (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "පින්තූරයක් තෝරන්න." });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, url: fileUrl });
  });

  // TMDB Metadata Integration
  app.get("/api/tmdb/movie/:imdbId", requireAdminAuth, async (req: AuthRequest, res: Response) => {
    const { imdbId } = req.params;
    if (!imdbId || !imdbId.startsWith("tt")) {
      return res.status(400).json({ error: "වලංගු IMDb ID එකක් ලබා දෙන්න. (උදා: tt0848228)" });
    }

    try {
      const data = await fetchMovieByImdbId(imdbId);
      if (!data) {
        return res.status(404).json({ error: "චිත්‍රපටය සොයාගත නොහැක. කරුණාකර IMDb ID එක පරීක්ෂා කරන්න." });
      }

      // Generate Sinhala Description automatically
      const sinhalaDescription = await generateSinhalaDescription(
        data.title,
        data.year,
        data.genres,
        data.overview,
        data.director,
        "movie"
      );

      res.json({
        ...data,
        sinhalaDescription,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "TMDB දත්ත ලබාගැනීමේදී දෝෂයක් ඇතිවිය." });
    }
  });

  app.get("/api/tmdb/series/:imdbId", requireAdminAuth, async (req: AuthRequest, res: Response) => {
    const { imdbId } = req.params;
    if (!imdbId || !imdbId.startsWith("tt")) {
      return res.status(400).json({ error: "වලංගු IMDb ID එකක් ලබා දෙන්න. (උදා: tt0944947)" });
    }

    try {
      const data = await fetchSeriesByImdbId(imdbId);
      if (!data) {
        return res.status(404).json({ error: "ටීවී සීරීස් සොයාගත නොහැක. කරුණාකර IMDb ID එක පරීක්ෂා කරන්න." });
      }

      const sinhalaDescription = await generateSinhalaDescription(
        data.title,
        data.year,
        data.genres,
        data.overview,
        data.creators.join(", "),
        "series"
      );

      res.json({
        ...data,
        sinhalaDescription,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "TMDB දත්ත ලබාගැනීමේදී දෝෂයක් ඇතිවිය." });
    }
  });

  // AI Sinhala Description generator
  app.post("/api/gemini/sinhala-description", requireAdminAuth, async (req: AuthRequest, res: Response) => {
    const { title, year, genres, overview, directorOrCreator, type, cast, rating, runtimeOrSeasons, customPrompt } = req.body;
    if (!title) {
      return res.status(400).json({ error: "මාතෘකාව අවශ්‍යයි." });
    }

    try {
      const text = await generateSinhalaDescription(
        title,
        year || 2026,
        genres || ["Action"],
        overview || "",
        directorOrCreator || "Director",
        type || "movie",
        {
          cast: Array.isArray(cast) ? cast : typeof cast === "string" ? cast.split(",").map((s) => s.trim()) : undefined,
          rating,
          runtimeOrSeasons,
          customPrompt,
        }
      );
      res.json({ sinhalaDescription: text });
    } catch (err: any) {
      res.status(500).json({ error: "සිංහල විස්තරය සෑදීමේදී දෝෂයක් ඇතිවිය." });
    }
  });

  // AI Season-wise Sinhala Synopsis generator
  app.post("/api/gemini/season-description", requireAdminAuth, async (req: AuthRequest, res: Response) => {
    const { seriesTitle, seasonNumber, seasonName, seasonOverview, seriesOverview, customPrompt } = req.body;
    if (!seriesTitle || seasonNumber === undefined) {
      return res.status(400).json({ error: "TV Series මාතෘකාව සහ Season අංකය අවශ්‍යයි." });
    }

    try {
      const text = await generateSeasonSynopsis({
        seriesTitle,
        seasonNumber: Number(seasonNumber),
        seasonName,
        seasonOverview,
        seriesOverview,
        customPrompt,
      });
      res.json({ sinhalaDescription: text });
    } catch (err: any) {
      res.status(500).json({ error: "Season විස්තරය සෑදීමේදී දෝෂයක් ඇතිවිය." });
    }
  });

  // Contact messages
  app.post("/api/contact", (req: Request, res: Response) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "කරුණාකර සියලු තොරතුරු සම්පූර්ණ කරන්න." });
    }

    const msg = db.addContactMessage({ name, email, subject: subject || "No Subject", message });
    res.status(201).json({ success: true, message: "ඔබගේ පණිවිඩය සාර්ථකව ලැබිණි. අප ඉක්මනින් සම්බන්ධ වන්නෙමු.", msg });
  });

  app.get("/api/admin/contact-messages", requireAdminAuth, (req: AuthRequest, res: Response) => {
    const messages = db.getContactMessages();
    res.json(messages);
  });

  // Vite middleware or Production static files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🎬 SeriesHubLk Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
