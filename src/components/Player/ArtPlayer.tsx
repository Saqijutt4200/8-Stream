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
        m3u8(video, url, art) {
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

    // Automatically play the video when ready
    art.on("ready", () => {
      art.play();
    });

    // Add custom controls for back and forward 10s
    art.controls.add({
      name: "backward",
      position: "left",
      html: "⏪ 10s",
      onClick: () => {
        art.seek(art.currentTime - 10); // Seek back 10 seconds
      },
    });

    art.controls.add({
      name: "forward",
      position: "right",
      html: "10s ⏩",
      onClick: () => {
        art.seek(art.currentTime + 10); // Seek forward 10 seconds
      },
    });

    // Keyboard shortcuts for back and forward 10s
    art.events.proxy(document, "keydown", (event) => {
      const isInputFocused =
        document?.activeElement?.tagName === "INPUT" ||
        document?.activeElement?.tagName === "TEXTAREA";

      if (!isInputFocused) {
        if (event.code === "ArrowLeft") {
          event.preventDefault();
          art.seek(art.currentTime - 10); // Backward
        } else if (event.code === "ArrowRight") {
          event.preventDefault();
          art.seek(art.currentTime + 10); // Forward
        }
      }
    });

    // Pass the instance back to the parent if needed
    if (getInstance) {
      getInstance(art);
    }

    // Clean up when the component is unmounted
    return () => {
      if (art && art.destroy) {
        art.destroy(false);
        art?.hls?.destroy();
      }
    };
  }, [option, getInstance, artRef, sub]);

  return <div ref={artRef} {...rest}></div>;
}
