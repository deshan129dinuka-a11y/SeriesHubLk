import React from "react";
import { Download, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import { SubtitleFile } from "../types";

interface SubtitleDownloadProps {
  subtitles?: SubtitleFile[];
  title: string;
  hasSinhalaSub?: boolean;
}

export const SubtitleDownload: React.FC<SubtitleDownloadProps> = ({
  subtitles = [],
  title,
  hasSinhalaSub = true,
}) => {
  const handleDownload = (sub: SubtitleFile) => {
    if (sub.fileUrl) {
      // Create download link
      const link = document.createElement("a");
      link.href = sub.fileUrl;
      link.download = sub.fileName || `${title}_Sinhala_Subtitle.srt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback generator for sample subtitles
      const sampleText = `1\n00:00:01,000 --> 00:00:05,000\n[SeriesHubLk - සිංහල උපසිරැසි]\n${title}\n\n2\n00:00:06,000 --> 00:00:10,000\nSeriesHubLk.com වෙතින් නොමිලේ බාගත කරන ලදී.`;
      const blob = new Blob([sampleText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_Sinhala.srt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 rounded-2xl border border-emerald-500/30 p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">
              සිංහල උපසිරැසි (Sinhala Subtitles)
            </h3>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>පරීක්ෂා කළ නිවැරදි උපසිරැසි (Verified Subtitle)</span>
            </span>
          </div>
        </div>

        <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold rounded-lg self-start sm:self-center">
          100% Free Download
        </span>
      </div>

      {/* Subtitle files list */}
      {subtitles.length > 0 ? (
        <div className="space-y-3">
          {subtitles.map((sub) => (
            <div
              key={sub.id}
              className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-500/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white font-mono">{sub.fileName}</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[11px] font-mono uppercase">
                    .{sub.fileName.split(".").pop() || "SRT"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-400">
                  <span>භාෂාව: <strong className="text-neutral-200">{sub.language || "සිංහල"}</strong></span>
                  <span>•</span>
                  <span>ප්‍රමාණය: <strong className="text-neutral-200">{sub.fileSize || "75 KB"}</strong></span>
                </div>
              </div>

              <button
                id={`download-sub-btn-${sub.id}`}
                onClick={() => handleDownload(sub)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102"
              >
                <Download className="w-4 h-4" />
                <span>සිංහල උපසිරැසි බාගත කරන්න</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white font-mono">
              {title.replace(/[^a-zA-Z0-9]/g, ".")}.1080p.Sinhala.Sub.srt
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-400">
              <span>භාෂාව: <strong className="text-neutral-200">සිංහල (Sinhala)</strong></span>
              <span>•</span>
              <span>ප්‍රමාණය: <strong className="text-neutral-200">85 KB</strong></span>
            </div>
          </div>

          <button
            id="download-default-sub-btn"
            onClick={() =>
              handleDownload({
                id: "default",
                targetType: "movie",
                targetId: "",
                language: "Sinhala",
                fileName: `${title}.Sinhala.srt`,
                fileSize: "85 KB",
                fileUrl: "/api/subtitles/download/sample-1",
                uploadedAt: new Date().toISOString(),
              })
            }
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102"
          >
            <Download className="w-4 h-4" />
            <span>සිංහල උපසිරැසි බාගත කරන්න</span>
          </button>
        </div>
      )}
    </div>
  );
};
