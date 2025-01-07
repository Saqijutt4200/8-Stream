import { useEffect, useRef } from "react";
import Plyr from "plyr";
import Hls from "hls.js"
import "plyr/dist/plyr.css";


interface PlyrPlayerProps {
  option: {
    url: string;
    subtitle?: {
      type?: string;
      style?: any;
    };
  };
  getInstance?: (player: Plyr) => void;
  sub?: Array<{ lang: string; url: string }>;
  [key: string]: any;
}

export default function PlyrPlayer({
  option,
  getInstance,
  sub = [],
  ...rest
}: PlyrPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize Plyr
    const player = new Plyr(videoRef.current, {
      captions: { active: true, update: true },
      quality: {
        default: 1080,
        options: [360, 480, 720, 1080]
      },
      controls: [
        'play-large',
        'play',
        'progress',
        'duration',
        'mute',
        'volume',
        'captions',
        'settings',
        'pip',
        'airplay',
        'fullscreen'
      ],
      settings: ['quality', 'speed', 'captions'],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      keyboard: { focused: true, global: true }
    });

    // Setup HLS
    if (option.url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls();

        // Event listener for HLS errors
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('HLS error:', data);
            // You could display a user-friendly message or fallback option here
          }
        });

        hls.loadSource(option.url);
        hls.attachMedia(videoRef.current);

        // Handle quality levels
        hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
          const levels = hls.levels;
          const qualityOptions = levels.map(level => level.height);
          player.config.quality = {
            default: qualityOptions[qualityOptions.length - 1],
            options: qualityOptions,
            forced: true,
            onChange: (quality: number) => {
              levels.forEach((level, levelIndex) => {
                if (level.height === quality) {
                  hls.currentLevel = levelIndex;
                }
              });
            }
          };
        });

        player.on('ready', () => {
          player.play();
        });

        // Cleanup
        player.on('destroy', () => {
          hls.destroy();
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = option.url;
      } else {
        console.error('HLS is not supported in this browser.');
      }
    } else {
      // Fallback if it's not an HLS stream
      videoRef.current.src = option.url;
    }

    // Handle subtitles
    if (sub.length > 0) {
      sub.forEach(subtitle => {
        player.source = {
          type: 'video',
          sources: [{ src: option.url }],
          tracks: [
            {
              kind: 'captions',
              label: subtitle.lang,
              srclang: subtitle.lang.toLowerCase(),
              src: subtitle.url,
              default: false,
            },
          ],
        };
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keypress', (event) => {
      const isInputFocused = 
        document?.activeElement?.tagName === "INPUT" ||
        document?.activeElement?.tagName === "TEXTAREA";

      if (!isInputFocused) {
        if (event.code === "Space") {
          event.preventDefault();
          player.togglePlay();
        } else if (event.code === "KeyF") {
          event.preventDefault();
          player.fullscreen.toggle();
        }
      }
    });

    // Expose player instance
    if (getInstance && typeof getInstance === "function") {
      getInstance(player);
    }

    playerRef.current = player;

    // Cleanup
    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [option.url, sub]);

  return (
    <div {...rest}>
      <video ref={videoRef} className="plyr-react plyr">
        {sub.map((track, index) => (
          <track
            key={index}
            kind="captions"
            label={track.lang}
            srcLang={track.lang.toLowerCase()}
            src={track.url}
          />
        ))}
      </video>
    </div>
  );
}
