import { useEffect } from "react";
import Artplayer from "artplayer";
import { type Option } from "artplayer/types/option";
import artplayerPluginHlsQuality from "artplayer-plugin-hls-quality";
import Hls from "hls.js";

export default function Player({
  option,
  getInstance,
  artRef,
  sub,
  ...rest
}: {
  option: Option;
  getInstance?: (art: Artplayer) => void;
  artRef: any;
  sub?: any;
  [key: string]: any;
}) {
  useEffect(() => {
    const art = new Artplayer({
      ...option,
      container: artRef.current!,
      plugins: [
        artplayerPluginHlsQuality({
          control: true,
          getResolution: (level) => {
            if (level.height <= 240) return "240P";
            if (level.height <= 360) return "360P";
            if (level.height <= 480) return "480P";
            if (level.height <= 720) return "720P";
            if (level.height <= 1080) return "1080P";
            return level.height + "P";
          },
        }),
      ],
      customType: {
        m3u8: function playM3u8(video, url, art) {
          if (Hls.isSupported()) {
            if (art.hls) art.hls.destroy();
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            art.hls = hls;
            art.on("destroy", () => hls.destroy());
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else {
            art.notice.show = "Unsupported playback format: m3u8";
          }
        },
      },
    });

    art.on("ready", () => {
      art.play();
    });

    if (getInstance && typeof getInstance === "function") {
      getInstance(art);
    }

    // Keyboard shortcuts
    art.events.proxy(document, "keypress", (event: any) => {
      const isInputFocused =
        document?.activeElement?.tagName === "INPUT" ||
        document?.activeElement?.tagName === "TEXTAREA";

      if (!isInputFocused) {
        if (event?.code === "Space") {
          event.preventDefault();
          art.playing ? art.pause() : art.play();
        } else if (event?.code === "KeyF") {
          event.preventDefault();
          art.fullscreen = !art.fullscreen;
        } else if (event?.code === "ArrowLeft") {
          event.preventDefault();
          art.currentTime = Math.max(0, art.currentTime - 10);
        } else if (event?.code === "ArrowRight") {
          event.preventDefault();
          art.currentTime = Math.min(art.duration, art.currentTime + 10);
        }
      }
    });

    // Remove default play/pause control
    art.controls.remove("playAndPause");

    // Add Backward (10s) button on left
    art.controls.add({
      name: "backward",
      position: "left",
      html: `<svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="white" d="M13 18v-2H7v2H5v-2H3V8h2V6h2v2h6V6h2v2h2v8h-2v2h-2Zm-2-4h8V10h-8Zm-6 0h4V10H5Z"/>
      </svg>`,
      click: () => {
        art.currentTime = Math.max(0, art.currentTime - 10);
      },
      style: {
        padding: "5px",
      },
    });

    // Add Play/Pause button in the center
    art.controls.add({
      name: "play",
      position: "center",
      html: `<svg width="24" height="24" viewBox="0 0 24 24">
        <path fill="white" d="M8 5v14l11-7z"/>
      </svg>`,
      click: () => {
        art.playing ? art.pause() : art.play();
      },
      style: {
        padding: "5px",
      },
    });

    // Add Forward (10s) button on right
    art.controls.add({
      name: "forward",
      position: "right",
      html: `<svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="white" d="M11 18v-2h6v2h2v-2h2V8h-2V6h-2v2h-6V6h-2v2H5v8h2v2h2Zm2-4h-8V10h8Zm6 0h-4V10h4Z"/>
      </svg>`,
      click: () => {
        art.currentTime = Math.min(art.duration, art.currentTime + 10);
      },
      style: {
        padding: "5px",
      },
    });

    console.log("controls", art.controls);

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
        art?.hls?.destroy();
      }
    };
  }, []);

  return <div ref={artRef} {...rest}></div>;
}
