import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Settings,
  Subtitles,
  AlertTriangle,
  PictureInPicture,
} from "lucide-react";

interface VideoPlayerProps {
  src?: string;
  title: string;
  posterUrl?: string;
  subtitleUrl?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  posterUrl,
  subtitleUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => setHasError(true));
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setHasError(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMute = !isMuted;
    videoRef.current.muted = newMute;
    setIsMuted(newMute);
    if (!newMute && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettings(false);
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(Math.max(0, videoRef.current.currentTime + seconds), duration);
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.warn("PiP not supported or failed", e);
    }
  };

  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setControlsVisible(false);
    }, 3500);
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-neutral-800/90 shadow-2xl group select-none flex items-center justify-center"
    >
      {/* Video Element */}
      {src ? (
        <video
          ref={videoRef}
          src={src}
          poster={posterUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onError={() => setHasError(true)}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
          playsInline
        >
          {subtitleUrl && subtitlesEnabled && (
            <track label="Sinhala" kind="subtitles" srcLang="si" src={subtitleUrl} default />
          )}
        </video>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center text-neutral-400 space-y-3">
          <AlertTriangle className="w-10 h-10 text-amber-500" />
          <div>
            <h4 className="text-base font-bold text-white">වීඩියෝ ප්‍රවාහ සබැඳියක් (Streaming URL) සකසා නැත</h4>
            <p className="text-xs text-neutral-500 mt-1">Admin මඟින් මෙම සිනමාපටය සඳහා Direct Stream URL එකක් ඇතුළත් කළ හැක.</p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {hasError && (
        <div className="absolute inset-0 bg-neutral-950/90 flex flex-col items-center justify-center text-center p-6 space-y-3 z-30">
          <AlertTriangle className="w-12 h-12 text-amber-500 animate-bounce" />
          <h4 className="text-lg font-bold text-white">වීඩියෝව ධාවනය කිරීමේදී ගැටලුවක් ඇතිවිය.</h4>
          <p className="text-xs text-neutral-400 max-w-md">
            සපයන ලද Video URL එක සෘජුවම බ්‍රවුසරයෙන් ධාවනය කිරීමට නොහැකි විය හැක (CORS හෝ Format සහාය නොදැක්වීම). කරුණාකර පහත &ldquo;වීඩියෝව බාගත කරන්න&rdquo; බොත්තම භාවිත කරන්න.
          </p>
          <button
            onClick={() => {
              setHasError(false);
              if (videoRef.current) {
                videoRef.current.load();
                videoRef.current.play();
              }
            }}
            className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400"
          >
            නැවත උත්සාහ කරන්න (Retry)
          </button>
        </div>
      )}

      {/* Big Center Play/Pause button on hover when paused */}
      {src && !isPlaying && !hasError && (
        <button
          onClick={togglePlay}
          className="absolute z-20 w-16 h-16 rounded-full bg-amber-500/90 text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
        >
          <Play className="w-8 h-8 fill-black ml-1" />
        </button>
      )}

      {/* Title Bar in Fullscreen / Hover */}
      <div
        className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white text-sm font-semibold transition-opacity duration-300 z-20 ${
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <span className="truncate max-w-md">{title}</span>
        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs border border-amber-500/40">
          1080p FHD
        </span>
      </div>

      {/* Bottom Control Bar */}
      {src && !hasError && (
        <div
          className={`absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-col gap-2 transition-opacity duration-300 z-20 ${
            controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Progress Slider */}
          <div className="relative flex items-center group/slider">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:h-2.5 transition-all"
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between text-neutral-200 text-xs font-medium">
            {/* Left group */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 rounded-lg hover:bg-neutral-800 text-white cursor-pointer"
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
              </button>

              <button
                onClick={() => skipTime(-10)}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white"
                title="10s Back"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => skipTime(10)}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white"
                title="10s Forward"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1 group/vol">
                <button onClick={toggleMute} className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-300 hover:text-white">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-neutral-700 rounded appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Time display */}
              <span className="text-neutral-400 ml-1 font-mono text-[11px]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right group */}
            <div className="flex items-center gap-2 relative">
              {/* Subtitle toggle */}
              <button
                onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                  subtitlesEnabled
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    : "bg-neutral-900 text-neutral-400 border-neutral-800"
                }`}
                title="Subtitles Toggle"
              >
                <Subtitles className="w-4 h-4" />
                <span className="hidden sm:inline">CC</span>
              </button>

              {/* Settings / Speed Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white"
                  title="Playback Speed"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {showSettings && (
                  <div className="absolute bottom-10 right-0 w-36 bg-neutral-900 border border-neutral-700 rounded-xl p-2 shadow-2xl space-y-1 z-30">
                    <div className="text-[10px] text-neutral-400 uppercase tracking-wider px-2 py-1 font-bold">
                      Playback Speed
                    </div>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => changeSpeed(s)}
                        className={`w-full text-left px-2.5 py-1 text-xs rounded-md transition-colors ${
                          playbackSpeed === s ? "bg-amber-500 text-black font-bold" : "text-neutral-200 hover:bg-neutral-800"
                        }`}
                      >
                        {s === 1 ? "1x (Normal)" : `${s}x`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Picture in Picture */}
              <button
                onClick={togglePiP}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white hidden sm:block"
                title="Picture in Picture"
              >
                <PictureInPicture className="w-4 h-4" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
