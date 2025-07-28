import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Settings, X, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { DialogTitle } from '@radix-ui/react-dialog';
import { toast } from 'sonner';

interface VideoPlayerProps {
    videoUrl: string;
    subsUrl: string,
    title: string;
    isOpen: boolean;
    onClose: () => void;
}

const VideoPlayer = ({ videoUrl, subsUrl, title, isOpen, onClose }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const SEEK = 10;

    let controlsTimeout: NodeJS.Timeout;

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleDurationChange = () => setDuration(video.duration);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('durationchange', handleDurationChange);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('durationchange', handleDurationChange);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    skipTime(SEEK);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    skipTime(-SEEK);
                    break;
                default:
                    return;
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen]);

    const togglePlay = () => {
        const v = videoRef.current;
        if (!v) return;
        if (isPlaying) {
            v.pause();
            setIsPlaying(false);
        } else {
            v.play().catch(console.error);
            setIsPlaying(true);
        }
    };

    const toggleSubtitles = () => {
        const video = videoRef.current;
        if (!video) return;

        console.log(subsUrl);

        const textTracks = video.textTracks;
        if (textTracks && textTracks.length > 0) {
            const track = textTracks[0];
            track.mode = track.mode === "showing" ? "hidden" : "showing";
        }
    };

    const handleSeek = (value: number[]) => {
        const video = videoRef.current;
        if (!video) return;

        video.currentTime = value[0];
        setCurrentTime(value[0]);
    };

    const handleVolumeChange = (value: number[]) => {
        const video = videoRef.current;
        if (!video) return;

        const newVolume = value[0];
        video.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isMuted) {
            video.volume = volume;
            setIsMuted(false);
        } else {
            video.volume = 0;
            setIsMuted(true);
        }
    };

    const skipTime = (seconds: number) => {
        const video = videoRef.current;
        if (!video) return;

        video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    };

    const toggleFullscreen = () => {
        const video = videoRef.current;
        if (!video) return;

        if (!isFullscreen) {
            videoContainerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleMouseMove = () => {
        setShowControls(true);
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl p-0 bg-black border-none">
                <DialogTitle asChild />
                <div
                    ref={videoContainerRef}
                    className={`relative bg-black ${!showControls ? 'cursor-none' : 'cursor-default'}`}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => isPlaying && setShowControls(false)}
                >
                    {/* Close Button */}
                    {showControls && <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 z-50 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white"
                        onClick={onClose}
                    >
                        <X className="h-5 w-5" />
                    </Button>}

                    {/* Video Element */}
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className={`w-full ${isFullscreen ? "h-full" : "h-auto max-h-[80vh]"}`}
                        onClick={togglePlay}
                        autoPlay
                        muted
                        onLoadedMetadata={() => {
                            const video = videoRef.current;
                            if (video) {
                                setDuration(video.duration);
                                video.muted = false;
                                togglePlay();
                            }
                        }}
                        onTimeUpdate={() => {
                            const v = videoRef.current;
                            if (v) setCurrentTime(v.currentTime);
                        }}
                        onError={(e) => console.error('Video failed to load:', e)}
                        crossOrigin='anonymous'
                    >
                        {subsUrl.length > 0 && <track
                            label="English"
                            kind="subtitles"
                            srcLang="en"
                            src={subsUrl}
                            default
                        />}
                    </video>

                    {/* Video Controls */}
                    <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                        {/* Progress Bar */}
                        <div className="mb-4">
                            <Slider
                                key={Math.floor(currentTime)} // force re-render per second
                                value={[currentTime]}
                                max={duration}
                                step={1}
                                onValueChange={handleSeek}
                                className="w-full"
                            />
                            <div className="flex justify-between text-sm text-white/70 mt-1">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {/* Play/Pause */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={togglePlay}
                                    className="text-white hover:bg-white/20"
                                >
                                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                                </Button>

                                {/* Skip Buttons */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => skipTime(-SEEK)}
                                    className="text-white hover:bg-white/20"
                                >
                                    <SkipBack className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => skipTime(SEEK)}
                                    className="text-white hover:bg-white/20"
                                >
                                    <SkipForward className="h-5 w-5" />
                                </Button>

                                {/* Volume Controls */}
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={toggleMute}
                                        className="text-white hover:bg-white/20"
                                    >
                                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                    </Button>
                                    <div className="w-20">
                                        <Slider
                                            value={[isMuted ? 0 : volume]}
                                            max={1}
                                            step={0.1}
                                            onValueChange={handleVolumeChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                {/* Movie Title */}
                                <span className="text-white font-medium">{title}</span>

                                {/* Settings */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/20"
                                >
                                    <Settings className="h-5 w-5" />
                                </Button>

                                {/* Subtitles */}
                                {subsUrl.length > 0 && <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleSubtitles}
                                    className="text-white hover:bg-white/20"
                                >
                                    <span className="text-sm">CC</span>
                                </Button>}

                                {/* Fullscreen */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleFullscreen}
                                    className="text-white hover:bg-white/20"
                                >
                                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Loading Overlay */}
                    {!duration && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default VideoPlayer;