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
          getResolution: (level) =>
            level.height <= 240
              ? "240P"
              : level.height <= 360
              ? "360P"
              : level.height <= 480
              ? "480P"
              : level.height <= 720
              ? "720P"
              : level.height <= 1080
              ? "1080P"
              : level.height + "P",
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

    art.controls.remove("playAndPause");

    // Custom Play/Pause Button with Backward and Forward
    art.controls.add({
      name: "customCenter",
      position: "center",
      html: `
        <div class="custom-controls">
          <button class="art-backward">
            <svg width="40" height="40" viewBox="0 0 24 24">
              <path fill="white" d="M13 18v-2H7v2H5v-2H3V8h2V6h2v2h6V6h2v2h2v8h-2v2h-2Zm-2-4h8V10h-8Zm-6 0h4V10H5Z"/>
            </svg>
          </button>
          <button class="art-play">
            <svg width="50" height="50" viewBox="0 0 24 24">
              <path fill="white" d="M8 5v14l11-7z"/>
            </svg>
          </button>
          <button class="art-forward">
            <svg width="40" height="40" viewBox="0 0 24 24">
              <path fill="white" d="M11 18v-2h6v2h2v-2h2V8h-2V6h-2v2h-6V6h-2v2H5v8h2v2h2Zm2-4h-8V10h8Zm6 0h-4V10h4Z"/>
            </svg>
          </button>
        </div>
      `,
      style: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "15px",
      },
      mounted: ($control) => {
        const playButton = $control.querySelector(".art-play");
        const backwardButton = $control.querySelector(".art-backward");
        const forwardButton = $control.querySelector(".art-forward");

        playButton.addEventListener("click", () => {
          art.playing ? art.pause() : art.play();
        });

        backwardButton.addEventListener("click", () => {
          art.currentTime = Math.max(0, art.currentTime - 15);
        });

        forwardButton.addEventListener("click", () => {
          art.currentTime = Math.min(art.duration, art.currentTime + 15);
        });
      },
    });

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
        art?.hls?.destroy();
      }
    };
  }, []);

  return <div ref={artRef} {...rest}></div>;
}
