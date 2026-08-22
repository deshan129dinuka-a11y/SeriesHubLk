import React, { useState } from "react";
import {
  Layers,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  Loader2,
  Film,
  Video,
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Play,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Season, Episode } from "../types";
import { api } from "../api";

interface SeasonEpisodeManagerProps {
  seriesTitle: string;
  seriesOverview?: string;
  seasons: Season[];
  onChange: (seasons: Season[]) => void;
  disabled?: boolean;
}

export const SeasonEpisodeManager: React.FC<SeasonEpisodeManagerProps> = ({
  seriesTitle,
  seriesOverview,
  seasons,
  onChange,
  disabled = false,
}) => {
  const [activeSeasonIdx, setActiveSeasonIdx] = useState<number>(0);
  const [generatingSeasonAiIdx, setGeneratingSeasonAiIdx] = useState<number | null>(null);
  const [seasonAiNotes, setSeasonAiNotes] = useState<{ [key: number]: string }>({});
  const [uploadingState, setUploadingState] = useState<{ [key: string]: boolean }>({});
  const [expandedEpisodeIds, setExpandedEpisodeIds] = useState<{ [key: string]: boolean }>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fallback if empty seasons
  const currentSeasons = seasons.length > 0 ? seasons : [];
  const currentSeason = currentSeasons[activeSeasonIdx] || currentSeasons[0] || null;

  // Add new Season
  const handleAddSeason = () => {
    const nextSeasonNum = currentSeasons.length + 1;
    const newSeason: Season = {
      id: `temp-seas-${Date.now()}`,
      seasonNumber: nextSeasonNum,
      name: `Season ${nextSeasonNum < 10 ? `0${nextSeasonNum}` : nextSeasonNum}`,
      overview: "",
      sinhalaDescription: "",
      episodesCount: 1,
      episodes: [
        {
          id: `temp-ep-${Date.now()}-1`,
          seasonNumber: nextSeasonNum,
          episodeNumber: 1,
          title: `Episode 01`,
          airDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
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
    };

    const updated = [...currentSeasons, newSeason];
    onChange(updated);
    setActiveSeasonIdx(updated.length - 1);
    setMessage({ type: "success", text: `නව Season ${nextSeasonNum} එකතු කරන ලදී.` });
    setTimeout(() => setMessage(null), 3000);
  };

  // Remove Season
  const handleRemoveSeason = (idxToRemove: number) => {
    if (currentSeasons.length <= 1) {
      if (!confirm("මෙම Season එක ඉවත් කිරීමට අවශ්‍ය බව තහවුරු කරන්නද?")) return;
    }
    const updated = currentSeasons.filter((_, i) => i !== idxToRemove);
    onChange(updated);
    setActiveSeasonIdx(Math.max(0, idxToRemove - 1));
  };

  // Update Season field
  const handleUpdateSeason = (field: keyof Season, val: any) => {
    if (!currentSeason) return;
    const updated = [...currentSeasons];
    updated[activeSeasonIdx] = {
      ...currentSeason,
      [field]: val,
    };
    onChange(updated);
  };

  // AI Season Description Generation
  const handleGenerateSeasonAi = async (sIdx: number) => {
    const s = currentSeasons[sIdx];
    if (!s) return;
    setGeneratingSeasonAiIdx(sIdx);
    try {
      const note = seasonAiNotes[sIdx] || "";
      const text = await api.generateSeasonSinhalaDescription({
        seriesTitle: seriesTitle || "TV Series",
        seasonNumber: s.seasonNumber || sIdx + 1,
        seasonName: s.name,
        seasonOverview: s.overview,
        seriesOverview: seriesOverview,
        customPrompt: note,
      });

      const updated = [...currentSeasons];
      updated[sIdx] = {
        ...s,
        sinhalaDescription: text,
      };
      onChange(updated);
      setMessage({ type: "success", text: `Season ${s.seasonNumber} සඳහා සිංහල විස්තරය AI මඟින් සකසන ලදී!` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "AI විස්තරය සෑදීමේදී දෝෂයක් ඇතිවිය." });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setGeneratingSeasonAiIdx(null);
    }
  };

  // Add Episode to current season
  const handleAddEpisode = () => {
    if (!currentSeason) return;
    const existingEps = currentSeason.episodes || [];
    const nextEpNum = existingEps.length + 1;
    const newEp: Episode = {
      id: `temp-ep-${Date.now()}-${nextEpNum}`,
      seasonNumber: currentSeason.seasonNumber,
      episodeNumber: nextEpNum,
      title: `Episode ${nextEpNum < 10 ? `0${nextEpNum}` : nextEpNum}`,
      airDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
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
    };

    const updatedEps = [...existingEps, newEp];
    handleUpdateSeason("episodes", updatedEps);
    setExpandedEpisodeIds((prev) => ({ ...prev, [newEp.id]: true }));
  };

  // Remove Episode
  const handleRemoveEpisode = (epIdxToRemove: number) => {
    if (!currentSeason || !currentSeason.episodes) return;
    const updatedEps = currentSeason.episodes.filter((_, i) => i !== epIdxToRemove);
    handleUpdateSeason("episodes", updatedEps);
  };

  // Update Episode field
  const handleUpdateEpisode = (epIdx: number, field: keyof Episode, val: any) => {
    if (!currentSeason || !currentSeason.episodes) return;
    const updatedEps = [...currentSeason.episodes];
    updatedEps[epIdx] = {
      ...updatedEps[epIdx],
      [field]: val,
    };
    handleUpdateSeason("episodes", updatedEps);
  };

  // Upload file for Episode (720p video, 1080p video, Sinhala subtitle, thumbnail)
  const handleUploadEpisodeFile = async (
    epIdx: number,
    field: "video720pUrl" | "video1080pUrl" | "subtitleUrl" | "thumbnailUrl",
    file: File
  ) => {
    const uploadKey = `${activeSeasonIdx}-${epIdx}-${field}`;
    setUploadingState((prev) => ({ ...prev, [uploadKey]: true }));
    try {
      const res = await api.uploadMediaFile(file);
      if (!currentSeason || !currentSeason.episodes) return;
      const updatedEps = [...currentSeason.episodes];
      const ep = { ...updatedEps[epIdx] };

      if (field === "video720pUrl") {
        ep.video720pUrl = res.url;
        ep.download720pUrl = res.url;
        ep.download720pSize = res.fileSize;
        if (!ep.streamingUrl) ep.streamingUrl = res.url;
      } else if (field === "video1080pUrl") {
        ep.video1080pUrl = res.url;
        ep.download1080pUrl = res.url;
        ep.download1080pSize = res.fileSize;
        if (!ep.streamingUrl) ep.streamingUrl = res.url;
      } else if (field === "subtitleUrl") {
        ep.subtitleUrl = res.url;
        ep.subtitleFileName = res.fileName;
        ep.hasSinhalaSub = true;
      } else if (field === "thumbnailUrl") {
        ep.thumbnailUrl = res.url;
        ep.stillUrl = res.url;
      }

      updatedEps[epIdx] = ep;
      handleUpdateSeason("episodes", updatedEps);
      setMessage({ type: "success", text: `${res.fileName} සාර්ථකව අප්ලෝඩ් කරන ලදී!` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "ගොනුව අප්ලෝඩ් කිරීමේදී දෝෂයක් ඇතිවිය." });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setUploadingState((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  const toggleEpisodeExpand = (epId: string) => {
    setExpandedEpisodeIds((prev) => ({
      ...prev,
      [epId]: !prev[epId],
    }));
  };

  return (
    <div id="season-episode-manager-root" className="space-y-6">
      {message && (
        <div
          id="season-manager-toast"
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
            message.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
              : "bg-red-950/80 border-red-500/50 text-red-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-800">
        <div>
          <h4 className="text-sm font-black text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-500" />
            <span>Seasons & Episodes කළමනාකරණය (Seasons, Episodes & Subtitles)</span>
          </h4>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            වෙනම Seasons Option Buttons, Season-wise විස්තර, 720p & 1080p Episode Uploading සහ සිංහල උපසිරැසි
          </p>
        </div>

        <button
          id="btn-add-new-season"
          type="button"
          disabled={disabled}
          onClick={handleAddSeason}
          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-red-900/30 transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>නව Season එකක් එකතු කරන්න (+ New Season)</span>
        </button>
      </div>

      {/* 1. SEASONS OPTION BUTTONS (Pills like in screenshot) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>තෝරාගත් Season එක (Select Season):</span>
          </span>
          <span className="text-[11px] text-neutral-500 font-mono">
            {currentSeasons.length} Seasons ඇත
          </span>
        </label>

        {currentSeasons.length === 0 ? (
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-dashed border-neutral-800 text-center space-y-2">
            <p className="text-xs text-neutral-400">කිසිදු Season එකක් තවමත් එකතු කර නොමැත.</p>
            <button
              type="button"
              onClick={handleAddSeason}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Season 01 සාදන්න
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 p-2 bg-neutral-950/80 rounded-2xl border border-neutral-800">
            {currentSeasons.map((season, idx) => {
              const isSelected = idx === activeSeasonIdx;
              const sNum = season.seasonNumber || idx + 1;
              const label = season.name || `Season ${sNum < 10 ? `0${sNum}` : sNum}`;

              return (
                <button
                  key={season.id || idx}
                  id={`season-option-btn-${idx}`}
                  type="button"
                  onClick={() => setActiveSeasonIdx(idx)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? "bg-red-600 text-white shadow-lg shadow-red-900/40 ring-2 ring-red-400/40 scale-105"
                      : "bg-neutral-800/90 text-neutral-300 hover:text-white hover:bg-neutral-700/80 border border-neutral-700/50"
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${
                      isSelected ? "bg-black/30 text-white" : "bg-neutral-900 text-neutral-400"
                    }`}
                  >
                    {season.episodes?.length || 0} eps
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleAddSeason}
              className="px-3 py-2 rounded-full text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-red-400 hover:text-red-300 border border-red-900/50 hover:border-red-500 flex items-center gap-1 transition-all cursor-pointer ml-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Season</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. CURRENT SEASON DETAILS & SEASON-WISE SINHALA DESCRIPTION */}
      {currentSeason && (
        <div
          id={`season-panel-${activeSeasonIdx}`}
          className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-red-500/30 space-y-5 shadow-xl"
        >
          {/* Season Header & Quick Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-red-600/20 border border-red-500/40 text-red-400 rounded-lg font-mono font-black text-xs">
                SEASON #{currentSeason.seasonNumber}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentSeason.name}
                  onChange={(e) => handleUpdateSeason("name", e.target.value)}
                  placeholder="Season නම (උදා: Season 01)"
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-bold w-36 sm:w-48"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => handleRemoveSeason(activeSeasonIdx)}
                className="px-2.5 py-1.5 bg-neutral-900 hover:bg-red-950 text-neutral-400 hover:text-red-400 rounded-xl border border-neutral-800 hover:border-red-800 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Season ඉවත් කරන්න</span>
              </button>
            </div>
          </div>

          {/* Season-wise Sinhala Synopsis with Dedicated Gemini AI Generator */}
          <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {currentSeason.name} සිංහල විස්තරය (Season-wise Sinhala Synopsis & Review)
                </span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={seasonAiNotes[activeSeasonIdx] || ""}
                  onChange={(e) =>
                    setSeasonAiNotes({ ...seasonAiNotes, [activeSeasonIdx]: e.target.value })
                  }
                  placeholder={`AI වෙත උපදෙස් (උදා: ${currentSeason.name} හි ප්‍රධාන සටන් ගැන)...`}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-500 w-44 sm:w-56"
                />
                <button
                  type="button"
                  disabled={generatingSeasonAiIdx === activeSeasonIdx}
                  onClick={() => handleGenerateSeasonAi(activeSeasonIdx)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] rounded-lg flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-50"
                >
                  {generatingSeasonAiIdx === activeSeasonIdx ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>සකසමින්...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>AI Season විස්තරය</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={currentSeason.sinhalaDescription || ""}
              onChange={(e) => handleUpdateSeason("sinhalaDescription", e.target.value)}
              placeholder={`${currentSeason.name} හි සිංහල විස්තරය, කතාවේ හැරවුම් ලක්ෂ්‍ය සහ සාරාංශය මෙහි ඇතුළත් කරන්න...`}
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs leading-relaxed focus:outline-none focus:border-red-500"
            ></textarea>

            {/* English Overview for Season */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-bold text-neutral-400">
                {currentSeason.name} English Overview (කෙටි ඉංග්‍රීසි හැඳින්වීම)
              </label>
              <textarea
                rows={2}
                value={currentSeason.overview || ""}
                onChange={(e) => handleUpdateSeason("overview", e.target.value)}
                placeholder="Season overview in English..."
                className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs leading-relaxed"
              ></textarea>
            </div>
          </div>

          {/* 3. EPISODES LIST UNDER THIS SEASON */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Film className="w-4 h-4 text-red-500" />
                <span>
                  {currentSeason.name} හි Episodes ලැයිස්තුව ({currentSeason.episodes?.length || 0})
                </span>
              </h5>

              <button
                type="button"
                onClick={handleAddEpisode}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-red-400 hover:text-white border border-red-900/60 hover:border-red-500 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>නව Episode එකක් එකතු කරන්න (+ Episode)</span>
              </button>
            </div>

            {/* List of episodes */}
            {(!currentSeason.episodes || currentSeason.episodes.length === 0) ? (
              <div className="p-8 rounded-2xl bg-neutral-900/40 border border-dashed border-neutral-800 text-center space-y-3">
                <p className="text-xs text-neutral-400">
                  මෙම Season එකෙහි කිසිදු Episode එකක් නොමැත.
                </p>
                <button
                  type="button"
                  onClick={handleAddEpisode}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> පළමු Episode එක සාදන්න
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {currentSeason.episodes.map((ep, epIdx) => {
                  const isExpanded = expandedEpisodeIds[ep.id] !== false; // default expanded
                  const uploadKey720 = `${activeSeasonIdx}-${epIdx}-video720pUrl`;
                  const uploadKey1080 = `${activeSeasonIdx}-${epIdx}-video1080pUrl`;
                  const uploadKeySub = `${activeSeasonIdx}-${epIdx}-subtitleUrl`;
                  const uploadKeyThumb = `${activeSeasonIdx}-${epIdx}-thumbnailUrl`;

                  return (
                    <div
                      key={ep.id || epIdx}
                      id={`episode-card-${ep.episodeNumber || epIdx + 1}`}
                      className="rounded-2xl bg-neutral-900/90 border border-neutral-800 overflow-hidden transition-all hover:border-neutral-700"
                    >
                      {/* Episode Header Bar (Crisp summary matching screenshot style) */}
                      <div
                        onClick={() => toggleEpisodeExpand(ep.id)}
                        className="p-3.5 bg-neutral-950/80 flex items-center justify-between gap-3 cursor-pointer hover:bg-neutral-900/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Large bold number badge */}
                          <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-mono font-black text-sm shrink-0">
                            {ep.episodeNumber || epIdx + 1}
                          </div>

                          {/* Thumbnail preview */}
                          {ep.thumbnailUrl || ep.stillUrl ? (
                            <img
                              src={ep.thumbnailUrl || ep.stillUrl}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-14 h-9 object-cover rounded-lg bg-neutral-900 border border-neutral-800 shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600 shrink-0">
                              <Film className="w-4 h-4" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <h6 className="text-xs font-bold text-white truncate">
                              {ep.title || `Episode ${ep.episodeNumber || epIdx + 1}`}
                            </h6>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mt-0.5">
                              {ep.airDate && <span>{ep.airDate}</span>}
                              {ep.runtime && <span>• {ep.runtime} min</span>}
                              {ep.hasSinhalaSub && (
                                <span className="text-emerald-400 font-semibold">• සිංහල උපසිරැසි ඇත</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Badges & Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {ep.video720pUrl && (
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800">
                              720p HD
                            </span>
                          )}
                          {ep.video1080pUrl && (
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800">
                              1080p FHD
                            </span>
                          )}
                          {ep.subtitleUrl && (
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                              Sinhala Sub
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveEpisode(epIdx);
                            }}
                            className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                            title="Episode එක ඉවත් කරන්න"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="text-neutral-400 p-1">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Episode Edit Form (Expanded Body) */}
                      {isExpanded && (
                        <div className="p-4 border-t border-neutral-800 space-y-4 bg-neutral-950/40">
                          {/* Row 1: Number, Title, Air Date, Runtime */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-[11px] font-bold text-neutral-400">Ep #</label>
                              <input
                                type="number"
                                value={ep.episodeNumber}
                                onChange={(e) =>
                                  handleUpdateEpisode(epIdx, "episodeNumber", Number(e.target.value))
                                }
                                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono font-bold"
                              />
                            </div>

                            <div className="sm:col-span-5 space-y-1">
                              <label className="text-[11px] font-bold text-neutral-400">
                                Episode Title (කොටසේ නම)
                              </label>
                              <input
                                type="text"
                                value={ep.title}
                                onChange={(e) => handleUpdateEpisode(epIdx, "title", e.target.value)}
                                placeholder="උදා: Strange Love"
                                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-semibold"
                              />
                            </div>

                            <div className="sm:col-span-3 space-y-1">
                              <label className="text-[11px] font-bold text-neutral-400">
                                Air Date (විකාශය වූ දිනය)
                              </label>
                              <input
                                type="text"
                                value={ep.airDate || ""}
                                onChange={(e) => handleUpdateEpisode(epIdx, "airDate", e.target.value)}
                                placeholder="උදා: Sep. 07, 2008"
                                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs"
                              />
                            </div>

                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-[11px] font-bold text-neutral-400">
                                Runtime (Min)
                              </label>
                              <input
                                type="number"
                                value={ep.runtime || 45}
                                onChange={(e) =>
                                  handleUpdateEpisode(epIdx, "runtime", Number(e.target.value))
                                }
                                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                              />
                            </div>
                          </div>

                          {/* Row 2: Thumbnail & Overview */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            <div className="sm:col-span-5 space-y-1.5">
                              <label className="text-[11px] font-bold text-neutral-400 flex items-center justify-between">
                                <span>Thumbnail / Still Image URL</span>
                                <label className="text-[10px] text-red-400 hover:underline cursor-pointer flex items-center gap-1">
                                  <Upload className="w-3 h-3" /> Upload File
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files?.[0])
                                        handleUploadEpisodeFile(epIdx, "thumbnailUrl", e.target.files[0]);
                                    }}
                                  />
                                </label>
                              </label>
                              <div className="flex gap-2">
                                {(ep.thumbnailUrl || ep.stillUrl) && (
                                  <img
                                    src={ep.thumbnailUrl || ep.stillUrl}
                                    alt=""
                                    referrerPolicy="no-referrer"
                                    className="w-12 h-8 object-cover rounded bg-neutral-900 border border-neutral-800"
                                  />
                                )}
                                <input
                                  type="text"
                                  value={ep.thumbnailUrl || ep.stillUrl || ""}
                                  onChange={(e) => {
                                    handleUpdateEpisode(epIdx, "thumbnailUrl", e.target.value);
                                    handleUpdateEpisode(epIdx, "stillUrl", e.target.value);
                                  }}
                                  placeholder="https://image.tmdb.org/..."
                                  className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-7 space-y-1.5">
                              <label className="text-[11px] font-bold text-neutral-400">
                                Episode Overview (කෙටි විස්තරය)
                              </label>
                              <input
                                type="text"
                                value={ep.overview || ""}
                                onChange={(e) => handleUpdateEpisode(epIdx, "overview", e.target.value)}
                                placeholder="Episode overview details..."
                                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs"
                              />
                            </div>
                          </div>

                          {/* Row 3: SEPARATE UPLOAD BUTTONS FOR 720P, 1080P VIDEOS AND SINHALA SUBTITLE */}
                          <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
                            <div className="text-[11px] font-black text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Video className="w-3.5 h-3.5 text-red-500" />
                                <span>
                                  වීඩියෝ සහ උපසිරැසි Uploading (720p HD, 1080p FHD & Sinhala Subtitle)
                                </span>
                              </span>
                              <span className="text-[10px] text-amber-400 font-semibold lowercase">
                                (video quality: 720p & 1080p only)
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* 1. 720p Video Upload & Link */}
                              <div className="p-3 rounded-xl bg-neutral-950 border border-sky-900/50 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                                    <Video className="w-3 h-3" />
                                    <span>720p HD Video</span>
                                  </span>

                                  <label className="px-2 py-1 bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-colors">
                                    {uploadingState[uploadKey720] ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Upload className="w-3 h-3" />
                                    )}
                                    <span>{uploadingState[uploadKey720] ? "Uploading..." : "Upload 720p"}</span>
                                    <input
                                      type="file"
                                      accept="video/*"
                                      disabled={uploadingState[uploadKey720]}
                                      className="hidden"
                                      onChange={(e) => {
                                        if (e.target.files?.[0])
                                          handleUploadEpisodeFile(epIdx, "video720pUrl", e.target.files[0]);
                                      }}
                                    />
                                  </label>
                                </div>

                                <input
                                  type="text"
                                  value={ep.video720pUrl || ep.download720pUrl || ""}
                                  onChange={(e) => {
                                    handleUpdateEpisode(epIdx, "video720pUrl", e.target.value);
                                    handleUpdateEpisode(epIdx, "download720pUrl", e.target.value);
                                  }}
                                  placeholder="720p Download / Stream URL"
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-[11px] font-mono"
                                />

                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-neutral-400">ගොනුවේ ප්‍රමාණය:</span>
                                  <input
                                    type="text"
                                    value={ep.download720pSize || "450 MB"}
                                    onChange={(e) =>
                                      handleUpdateEpisode(epIdx, "download720pSize", e.target.value)
                                    }
                                    placeholder="උදා: 450 MB"
                                    className="w-20 px-1.5 py-0.5 text-right rounded bg-neutral-900 border border-neutral-800 text-sky-300 font-mono"
                                  />
                                </div>
                              </div>

                              {/* 2. 1080p Video Upload & Link */}
                              <div className="p-3 rounded-xl bg-neutral-950 border border-amber-900/50 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                                    <Video className="w-3 h-3" />
                                    <span>1080p FHD Video</span>
                                  </span>

                                  <label className="px-2 py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-colors">
                                    {uploadingState[uploadKey1080] ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Upload className="w-3 h-3" />
                                    )}
                                    <span>{uploadingState[uploadKey1080] ? "Uploading..." : "Upload 1080p"}</span>
                                    <input
                                      type="file"
                                      accept="video/*"
                                      disabled={uploadingState[uploadKey1080]}
                                      className="hidden"
                                      onChange={(e) => {
                                        if (e.target.files?.[0])
                                          handleUploadEpisodeFile(epIdx, "video1080pUrl", e.target.files[0]);
                                      }}
                                    />
                                  </label>
                                </div>

                                <input
                                  type="text"
                                  value={ep.video1080pUrl || ep.download1080pUrl || ""}
                                  onChange={(e) => {
                                    handleUpdateEpisode(epIdx, "video1080pUrl", e.target.value);
                                    handleUpdateEpisode(epIdx, "download1080pUrl", e.target.value);
                                  }}
                                  placeholder="1080p Download / Stream URL"
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-[11px] font-mono"
                                />

                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-neutral-400">ගොනුවේ ප්‍රමාණය:</span>
                                  <input
                                    type="text"
                                    value={ep.download1080pSize || "1.1 GB"}
                                    onChange={(e) =>
                                      handleUpdateEpisode(epIdx, "download1080pSize", e.target.value)
                                    }
                                    placeholder="උදා: 1.1 GB"
                                    className="w-20 px-1.5 py-0.5 text-right rounded bg-neutral-900 border border-neutral-800 text-amber-300 font-mono"
                                  />
                                </div>
                              </div>

                              {/* 3. Sinhala Subtitle Upload & Link */}
                              <div className="p-3 rounded-xl bg-neutral-950 border border-emerald-900/50 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    <span>සිංහල උපසිරැසි (.srt / .zip)</span>
                                  </span>

                                  <label className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-colors">
                                    {uploadingState[uploadKeySub] ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Upload className="w-3 h-3" />
                                    )}
                                    <span>{uploadingState[uploadKeySub] ? "Uploading..." : "Upload Sub"}</span>
                                    <input
                                      type="file"
                                      accept=".srt,.vtt,.ass,.sub,.zip,.rar"
                                      disabled={uploadingState[uploadKeySub]}
                                      className="hidden"
                                      onChange={(e) => {
                                        if (e.target.files?.[0])
                                          handleUploadEpisodeFile(epIdx, "subtitleUrl", e.target.files[0]);
                                      }}
                                    />
                                  </label>
                                </div>

                                <input
                                  type="text"
                                  value={ep.subtitleUrl || ""}
                                  onChange={(e) => {
                                    handleUpdateEpisode(epIdx, "subtitleUrl", e.target.value);
                                    if (e.target.value) handleUpdateEpisode(epIdx, "hasSinhalaSub", true);
                                  }}
                                  placeholder="Subtitle URL / Download Link"
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-[11px] font-mono"
                                />

                                <div className="flex items-center justify-between pt-0.5">
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={ep.hasSinhalaSub !== false}
                                      onChange={(e) =>
                                        handleUpdateEpisode(epIdx, "hasSinhalaSub", e.target.checked)
                                      }
                                      className="w-3.5 h-3.5 accent-emerald-500 rounded"
                                    />
                                    <span className="text-[10px] font-bold text-emerald-300">
                                      සිංහල උපසිරැසි ඇත
                                    </span>
                                  </label>

                                  {ep.subtitleFileName && (
                                    <span className="text-[9px] text-neutral-400 truncate max-w-[100px]">
                                      {ep.subtitleFileName}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default SeasonEpisodeManager;
