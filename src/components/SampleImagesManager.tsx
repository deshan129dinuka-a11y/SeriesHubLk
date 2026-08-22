import React, { useState, useRef } from "react";
import {
  Images,
  Upload,
  Trash2,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Plus,
  ExternalLink,
  Eye,
  X
} from "lucide-react";
import { api } from "../api";

interface SampleImagesManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  title?: string;
  themeColor?: "amber" | "sky";
  posterUrl?: string;
  backdropUrl?: string;
}

export const SampleImagesManager: React.FC<SampleImagesManagerProps> = ({
  images = [],
  onChange,
  title = "Sample Images Gallery",
  themeColor = "amber",
  posterUrl = "",
  backdropUrl = "",
}) => {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [isUploadingBatch, setIsUploadingBatch] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [slotUploading, setSlotUploading] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const batchInputRef = useRef<HTMLInputElement>(null);
  const slotInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Ensure exactly 6 slots
  const slots: string[] = [
    images[0] || "",
    images[1] || "",
    images[2] || "",
    images[3] || "",
    images[4] || "",
    images[5] || "",
  ];

  const filledCount = slots.filter((s) => s.trim() !== "").length;

  // Check for duplicate URLs across slots and against poster/backdrop
  const duplicateIndices = new Set<number>();
  slots.forEach((url, i) => {
    if (!url.trim()) return;
    const isSameAsPoster = posterUrl && url.trim() === posterUrl.trim();
    const isSameAsBackdrop = backdropUrl && url.trim() === backdropUrl.trim();
    const isDuplicateSlot = slots.some((otherUrl, j) => i !== j && otherUrl.trim() === url.trim());
    if (isSameAsPoster || isSameAsBackdrop || isDuplicateSlot) {
      duplicateIndices.add(i);
    }
  });

  const updateSlot = (index: number, newUrl: string) => {
    setErrorMsg(null);
    const cleanUrl = newUrl.trim();
    
    // Check if duplicate already exists in another slot
    if (cleanUrl && slots.some((url, i) => i !== index && url.trim() === cleanUrl)) {
      setErrorMsg(`⚠️ මෙම පින්තූරය දැනටමත් වෙනත් Slot එකක පවතී! කරුණාකර වෙනස්ම පින්තූරයක් ඇතුළත් කරන්න.`);
    }

    const newSlots = [...slots];
    newSlots[index] = cleanUrl;
    // Filter trailing empties or pass full 6
    onChange(newSlots.filter(Boolean));
  };

  const handleClearSlot = (index: number) => {
    setErrorMsg(null);
    const newSlots = [...slots];
    newSlots[index] = "";
    onChange(newSlots.filter(Boolean));
  };

  const handleClearAll = () => {
    setErrorMsg(null);
    onChange([]);
  };

  // Upload single file for a specific slot
  const handleSingleFileUpload = async (index: number, file: File) => {
    if (!file) return;
    try {
      setSlotUploading(index);
      setErrorMsg(null);
      const res = await api.uploadImage(file);
      if (res.url) {
        updateSlot(index, res.url);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "පින්තූරය Upload කිරීම අසාර්ථක විය.");
    } finally {
      setSlotUploading(null);
    }
  };

  // Upload multiple files at once (Batch upload up to 6 different images)
  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsUploadingBatch(true);
      setErrorMsg(null);
      const maxFiles = Math.min(files.length, 6);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < maxFiles; i++) {
        setUploadProgress(`පින්තූරය ${i + 1}/${maxFiles} Upload වෙමින් පවතී...`);
        const res = await api.uploadImage(files[i]);
        if (res.url && !uploadedUrls.includes(res.url)) {
          uploadedUrls.push(res.url);
        }
      }

      // Merge into slots preserving non-empty if fewer uploaded, or replace from slot 0
      const newSlots = [...slots];
      uploadedUrls.forEach((url, i) => {
        if (i < 6) newSlots[i] = url;
      });

      onChange(newSlots.filter(Boolean));
      setUploadProgress(`පින්තූර ${uploadedUrls.length}ක් සාර්ථකව Upload විය!`);
      setTimeout(() => setUploadProgress(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Batch Image Upload කිරීමේදී දෝෂයක් සිදු විය.");
    } finally {
      setIsUploadingBatch(false);
      if (batchInputRef.current) batchInputRef.current.value = "";
    }
  };

  const isAmber = themeColor === "amber";

  return (
    <div className="space-y-4 rounded-2xl bg-neutral-950/80 border border-neutral-800/90 p-5 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Images className={`w-5 h-5 ${isAmber ? "text-amber-400" : "text-sky-400"}`} />
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <span>{title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                filledCount === 6 
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-700" 
                  : isAmber ? "bg-amber-950 text-amber-300 border border-amber-800" : "bg-sky-950 text-sky-300 border border-sky-800"
              }`}>
                {filledCount} / 6 Images
              </span>
            </h4>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            චිත්‍රපටයේ / TV Series හි එකිනෙකට සම්පූර්ණයෙන්ම වෙනස් (Unique) HD Sample පින්තූර 6ක් මෙහි ඇතුළත් කරන්න.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Hidden Batch Input */}
          <input
            ref={batchInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleBatchUpload}
          />

          <button
            type="button"
            onClick={() => batchInputRef.current?.click()}
            disabled={isUploadingBatch}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              isAmber
                ? "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20"
                : "bg-sky-500 hover:bg-sky-400 text-black shadow-sky-500/20"
            }`}
          >
            {isUploadingBatch ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>{isUploadingBatch ? "Uploading..." : "පින්තූර 6ම එකවර Upload කරන්න"}</span>
          </button>

          {filledCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-red-950/80 text-neutral-400 hover:text-red-300 border border-neutral-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Progress or Notifications */}
      {uploadProgress && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{uploadProgress}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/80 border border-red-800/90 text-red-200 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Duplicate Warning Indicator */}
      {duplicateIndices.size > 0 && (
        <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/70 text-amber-200 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">⚠️ එක සමාන පින්තූර හඳුනාගැනිණි (Duplicate Images Detected):</p>
            <p className="text-[11px] text-amber-300/80 mt-0.5">
              Slot {Array.from(duplicateIndices).map((i) => `#${i + 1}`).join(", ")} හි ඇති පින්තූර සමාන වේ. කරුණාකර සම්පූර්ණයෙන්ම වෙනස් (Completely Different) පින්තූර 6ක් භාවිතා කරන්න.
            </p>
          </div>
        </div>
      )}

      {/* 6 Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
        {slots.map((url, idx) => {
          const isSlotDuplicate = duplicateIndices.has(idx);
          const isCurrentUploading = slotUploading === idx;
          const hasImage = Boolean(url.trim());

          return (
            <div
              key={idx}
              className={`relative rounded-xl border p-3 flex flex-col justify-between gap-2.5 transition-all duration-200 ${
                isSlotDuplicate
                  ? "bg-amber-950/20 border-amber-500/80 shadow-md shadow-amber-950/30"
                  : hasImage
                  ? isAmber
                    ? "bg-neutral-900/90 border-neutral-700/80 hover:border-amber-500/50"
                    : "bg-neutral-900/90 border-neutral-700/80 hover:border-sky-500/50"
                  : "bg-neutral-950/60 border-neutral-800/80 border-dashed hover:border-neutral-700"
              }`}
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    hasImage
                      ? isAmber ? "bg-amber-500 text-black" : "bg-sky-500 text-black"
                      : "bg-neutral-800 text-neutral-400"
                  }`}>
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-neutral-300">
                    Sample Image {idx + 1}
                  </span>
                </div>

                {isSlotDuplicate && (
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800">
                    Duplicate
                  </span>
                )}
                {hasImage && !isSlotDuplicate && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Unique</span>
                  </span>
                )}
              </div>

              {/* Slot Image Preview or Upload Zone */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800 group flex items-center justify-center">
                {hasImage ? (
                  <>
                    <img
                      src={url}
                      alt={`Slot ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg";
                      }}
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewModalUrl(url)}
                        title="View Fullsize"
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => slotInputRefs.current[idx]?.click()}
                        title="Replace Image File"
                        className={`p-1.5 rounded-lg text-black font-bold cursor-pointer ${
                          isAmber ? "bg-amber-400 hover:bg-amber-300" : "bg-sky-400 hover:bg-sky-300"
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleClearSlot(idx)}
                        title="Remove Image"
                        className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    onClick={() => slotInputRefs.current[idx]?.click()}
                    className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/50 cursor-pointer p-2 text-center transition-all"
                  >
                    {isCurrentUploading ? (
                      <RefreshCw className={`w-5 h-5 animate-spin ${isAmber ? "text-amber-400" : "text-sky-400"}`} />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                    <span className="text-[11px] font-medium">
                      {isCurrentUploading ? "Uploading..." : "Click to Upload File"}
                    </span>
                  </div>
                )}
              </div>

              {/* Hidden File Input for this slot */}
              <input
                ref={(el) => (slotInputRefs.current[idx] = el)}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleSingleFileUpload(idx, file);
                }}
              />

              {/* Direct URL input */}
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="https://image.tmdb.org/... or /uploads/..."
                  value={url}
                  onChange={(e) => updateSlot(idx, e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-[11px] text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox / Preview Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-950/80 hover:bg-red-600 text-white transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewModalUrl}
              alt="Sample Preview"
              className="max-w-full max-h-[75vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
