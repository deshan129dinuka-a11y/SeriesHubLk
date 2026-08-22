import React, { useState } from "react";
import { Images, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { MovieImage } from "../types";

interface ImageGalleryProps {
  images?: MovieImage[] | string[];
  title: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images = [], title }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Normalize image URLs and deduplicate
  const formattedImages: string[] = React.useMemo(() => {
    const urls: string[] = [];
    images.forEach((item) => {
      const url = typeof item === "string" ? item : item.imageUrl;
      if (url && !urls.includes(url)) {
        urls.push(url);
      }
    });
    return urls.slice(0, 6);
  }, [images]);

  if (formattedImages.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const prevImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + formattedImages.length) % formattedImages.length);
  };

  const nextImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % formattedImages.length);
  };

  return (
    <div className="w-full bg-neutral-900/90 rounded-2xl border border-neutral-800/80 p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Images className="w-5 h-5 text-amber-400" />
          <span>චිත්‍රපට ඡායාරූප (Movie Image Gallery)</span>
        </h3>
        <span className="text-xs text-neutral-400 font-medium bg-neutral-800 px-2.5 py-1 rounded-lg">
          {formattedImages.length} HD Photos
        </span>
      </div>

      {/* 6-Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {formattedImages.map((url, idx) => (
          <div
            key={idx}
            onClick={() => openLightbox(idx)}
            className="group relative aspect-video rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 hover:border-amber-500/60 cursor-pointer shadow-md transition-all duration-300 transform hover:scale-102"
          >
            <img
              src={url}
              alt={`${title} Shot ${idx + 1}`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg";
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="p-2 rounded-full bg-amber-500/90 text-black shadow-lg">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>
            <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white font-mono">
              #{idx + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-fadeIn select-none"
          onClick={closeLightbox}
        >
          {/* Header */}
          <div
            className="absolute top-4 inset-x-4 max-w-5xl mx-auto flex items-center justify-between text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-neutral-200">{title}</span>
              <span className="text-xs bg-neutral-800 text-amber-400 px-2 py-0.5 rounded-full font-mono">
                {selectedIndex + 1} / {formattedImages.length}
              </span>
            </div>
            <button
              onClick={closeLightbox}
              className="p-2 rounded-full bg-neutral-800 hover:bg-red-600 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Image View */}
          <div
            className="relative max-w-5xl max-h-[75vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={formattedImages[selectedIndex]}
              alt={`${title} Preview`}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-neutral-800"
            />

            {/* Left Nav Arrow */}
            {formattedImages.length > 1 && (
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 hover:bg-amber-500 text-white hover:text-black border border-neutral-700 shadow-xl transition-all cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Right Nav Arrow */}
            {formattedImages.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 hover:bg-amber-500 text-white hover:text-black border border-neutral-700 shadow-xl transition-all cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails */}
          <div
            className="mt-4 flex items-center gap-2 overflow-x-auto max-w-2xl py-2 px-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {formattedImages.map((imgUrl, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`w-16 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                  selectedIndex === i ? "border-amber-400 scale-105" : "border-neutral-700 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
