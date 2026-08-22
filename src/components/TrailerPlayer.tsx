import React, { useMemo } from "react";
import { Film, AlertCircle } from "lucide-react";

interface TrailerPlayerProps {
  trailerUrl?: string;
  title: string;
}

export const TrailerPlayer: React.FC<TrailerPlayerProps> = ({ trailerUrl, title }) => {
  const embedUrl = useMemo(() => {
    if (!trailerUrl) return null;

    // Extract YouTube ID from various formats
    let videoId = "";
    if (trailerUrl.includes("v=")) {
      videoId = trailerUrl.split("v=")[1]?.split("&")[0];
    } else if (trailerUrl.includes("youtu.be/")) {
      videoId = trailerUrl.split("youtu.be/")[1]?.split("?")[0];
    } else if (trailerUrl.includes("embed/")) {
      videoId = trailerUrl.split("embed/")[1]?.split("?")[0];
    } else if (trailerUrl.length === 11) {
      videoId = trailerUrl;
    }

    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&autoplay=0`;
    }
    return null;
  }, [trailerUrl]);

  return (
    <div className="w-full bg-neutral-900/90 rounded-2xl border border-neutral-800/80 p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Film className="w-5 h-5 text-amber-400" />
          <span>නිල ට්‍රේලරය (Official Trailer)</span>
        </h3>
        <span className="text-xs text-neutral-400 font-medium">HD 1080p Official Stream</span>
      </div>

      {embedUrl ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner border border-neutral-800">
          <iframe
            src={embedUrl}
            title={`${title} Official Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          ></iframe>
        </div>
      ) : (
        <div className="aspect-video rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center text-neutral-400 p-6 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-neutral-500" />
          <p className="text-sm font-medium">ට්‍රේලරය දැනට ලබා ගත නොහැක.</p>
          <p className="text-xs text-neutral-600">Admin මඟින් ට්‍රේලර් සබැඳිය ඇතුළත් කළ හැක.</p>
        </div>
      )}
    </div>
  );
};
