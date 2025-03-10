import { useEffect } from "react";
import Artplayer from "artplayer";
import { type Option } from "artplayer/types/option";
import Hls from "hls.js";

// Define the level type
interface HLSLevel {
  height: number;
  width: number;
  bitrate: number;
  url: string;
  index?: number;
}

interface QualityLevel {
  height: number;
  html: string;
}

// Define types for sandbox detection results
interface SandboxDetails {
  sandboxed: boolean;
  reasons?: string[];
  environments?: string[];
  securityLevel?: number;
}

// Add type declaration for sandbox detection
declare global {
  interface Document {
    sandbox?: DOMTokenList;
  }
  interface Window {
    controlsTimeout?: NodeJS.Timeout;
    sandblaster?: {
      detect: () => SandboxDetails;
    };
  }
}

// Extend Window interface to support custom property
declare global {
  interface Window {
    controlsTimeout?: NodeJS.Timeout;
  }
}

export default function Player({
  option,
  getInstance,
  artRef,
  sub,
  posterUrl,
  availableLang = [],
  onLanguageChange,
  ...rest
}: {
  option: Option;
  getInstance?: (art: Artplayer) => void;
  artRef: any;
  sub?: any;
  posterUrl?: string;
  availableLang?: string[];
  onLanguageChange?: (lang: string) => void;
  [key: string]: any;
}) {
  useEffect(() => {
    // Add custom styles
    const style = document.createElement("style");
    style.textContent = `
      .art-controls {
        background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
        padding: 10px;
        border-radius: 10px;
      }
      .art-progress {
        height: 5px;
        background: rgba(255, 255, 255, 0.2);
      }
      .art-progress .art-progress-bar {
        height: 5px;
        background: #ff4757;
      }
      .art-progress .art-progress-loaded {
        height: 5px;
        background: rgba(255, 255, 255, 0.4);
      }
      .art-progress .art-progress-indicator {
        width: 12px;
        height: 12px;
        background: #ff4757;
        border-radius: 50%;
        top: -3.5px;
      }
      .art-control-button {
        color: #fff;
        transition: all 0.3s ease;
      }
      .art-control-button:hover {
        color: #ff4757;
        transform: scale(1.2);
      }
      .art-control-quality, .art-control-subtitle {
        background: rgba(0, 0, 0, 0.5);
        border-radius: 5px;
        padding: 5px 10px;
        margin: 0 5px;
      }
      .art-control-quality:hover, .art-control-subtitle:hover {
        background: rgba(0, 0, 0, 0.7);
      }
      .art-control-fullscreen, .art-control-pip {
        background: rgba(0, 0, 0, 0.5);
        border-radius: 5px;
        padding: 5px 10px;
        margin: 0 5px;
      }
      .art-control-fullscreen:hover, .art-control-pip:hover {
        background: rgba(0, 0, 0, 0.7);
      }
      .art-control-playback-speed {
        background: rgba(0, 0, 0, 0.5);
        border-radius: 5px;
        padding: 5px 10px;
        margin: 0 5px;
      }
      .art-control-playback-speed:hover {
        background: rgba(0, 0, 0, 0.7);
      }
      .art-control-playback-speed .art-selector {
        background: rgba(0, 0, 0, 0.7);
        border-radius: 5px;
        padding: 5px;
      }
      .art-control-playback-speed .art-selector-item {
        padding: 5px 10px;
        border-radius: 5px;
      }
      .art-control-playback-speed .art-selector-item:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    `;
    document.head.appendChild(style);

    // Initialize Artplayer
    const art = new Artplayer({
      ...option,
      container: artRef.current!,
      layers: [
        {
          name: "poster",
          html: posterUrl
            ? `<img style="object-fit: cover; height: 100%; width: 100%; pointer-events: none; user-select: none; -webkit-user-select: none;" src="${posterUrl}">`
            : "",
          tooltip: "Poster Tip",
          style: {
            position: "absolute",
            top: "0",
            right: "0",
            height: "100%",
            width: "100%",
            overflow: "hidden",
            userSelect: "none",
            webkitUserSelect: "none",
            webkitTouchCallout: "none",
          } as Partial<CSSStyleDeclaration>,
        },
      ],
      customType: {
        m3u8: function playM3u8(video, url, art) {
          if (Hls.isSupported()) {
            if (art.hls) art.hls.destroy();
            const hls = new Hls({
              debug: true,
            });

            hls.on(Hls.Events.ERROR, function (event, data) {
              if (data.fatal) {
                console.error("HLS error:", data);
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.log("Network error - attempting to recover...");
                    hls.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.log("Media error - attempting to recover...");
                    hls.recoverMediaError();
                    break;
                  default:
                    hls.destroy();
                    art.notice.show = `Playback error: ${data.type}`;
                    break;
                }
              }
            });

            hls.on(Hls.Events.MANIFEST_LOADING, () => {
              console.log("Loading manifest from URL:", url);
            });

            hls.on(Hls.Events.MANIFEST_LOADED, () => {
              console.log("Manifest loaded successfully");
            });

            try {
              hls.loadSource(url);
              hls.attachMedia(video);
              art.hls = hls;

              hls.on(Hls.Events.MANIFEST_PARSED, function (_, data) {
                console.log("Available levels:", hls.levels);

                if (hls.levels.length > 0) {
                  const standardQualities: QualityLevel[] = [
                    { height: 1080, html: "1080P" },
                    { height: 720, html: "720P" },
                    { height: 480, html: "480P" },
                    { height: 360, html: "360P" },
                    { height: 240, html: "240P" },
                  ];
                  const availableQualities = standardQualities
                    .filter((sq) => {
                      return hls.levels.some(
                        (level) => Math.abs(level.height - sq.height) < 100
                      );
                    })
                    .map((sq) => ({
                      html: sq.html,
                      value: sq.height,
                      default: sq.height === 1080,
                    }));

                  if (!availableQualities.some((q) => q.default)) {
                    availableQualities[0].default = true;
                  }

                  art.setting.update({
                    name: "quality",
                    selector: availableQualities,
                  });
                }
              });

              art.on("destroy", () => {
                console.log("Destroying HLS instance");
                hls.destroy();
              });
            } catch (error) {
              console.error("Error setting up HLS:", error);
              art.notice.show = "Failed to load video source";
            }
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else {
            art.notice.show = "Unsupported playback format: m3u8";
          }
        },
      },
    });

    // Add keyboard shortcuts
    art.events.proxy(document, "keypress", (event: any) => {
      const isInputFocused =
        document?.activeElement?.tagName === "INPUT" ||
        document?.activeElement?.tagName === "TEXTAREA";

      if (!isInputFocused && event?.code === "Space") {
        event.preventDefault();
        art.playing ? art.pause() : art.play();
      } else if (!isInputFocused && event?.code === "KeyF") {
        event.preventDefault();
        art.fullscreen = !art.fullscreen;
      } else if (!isInputFocused && event?.code === "KeyM") {
        event.preventDefault();
        art.muted = !art.muted;
      } else if (!isInputFocused && event?.code === "ArrowLeft") {
        event.preventDefault();
        art.currentTime = Math.max(0, art.currentTime - 5);
      } else if (!isInputFocused && event?.code === "ArrowRight") {
        event.preventDefault();
        art.currentTime = Math.min(art.duration, art.currentTime + 5);
      }
    });

    // Add playback speed control
    art.controls.add({
      name: "playback-speed",
      position: "right",
      html: `Speed`,
      selector: [
        { html: "0.5x", value: 0.5 },
        { html: "1x", value: 1, default: true },
        { html: "1.5x", value: 1.5 },
        { html: "2x", value: 2 },
      ],
      onSelect: function (item) {
        art.playbackRate = item.value;
        return item.html;
      },
    });

    // Add picture-in-picture control
    art.controls.add({
      name: "pip",
      position: "right",
      html: `PIP`,
      click: function () {
        art.pip = !art.pip;
      },
    });

    // Handle play/pause events
    art.on("play", () => {
      art.layers.update({
        name: "poster",
        html: posterUrl
          ? `<img style="object-fit: cover; height: 100%; width: 100%; pointer-events: none; user-select: none; -webkit-user-select: none;" src="${posterUrl}">`
          : "",
        tooltip: "Poster Tip",
        style: {
          position: "absolute",
          display: "none",
          top: "0",
          right: "0",
          height: "100%",
          width: "100%",
          overflow: "hidden",
          userSelect: "none",
          webkitUserSelect: "none",
          webkitTouchCallout: "none",
        } as Partial<CSSStyleDeclaration>,
      });
    });

    art.on("pause", () => {
      art.layers.update({
        name: "poster",
        html: posterUrl
          ? `<img style="object-fit: cover; height: 100%; width: 100%; pointer-events: none; user-select: none; -webkit-user-select: none;" src="${posterUrl}">`
          : "",
        tooltip: "Poster Tip",
        style: {
          position: "absolute",
          display: "block",
          top: "0",
          right: "0",
          height: "100%",
          width: "100%",
          overflow: "hidden",
          userSelect: "none",
          webkitUserSelect: "none",
          webkitTouchCallout: "none",
        } as Partial<CSSStyleDeclaration>,
      });
    });

    // Add subtitles if available
    if (sub?.length > 0) {
      art.controls.add({
        name: "subtitle",
        position: "right",
        html: `Subtitle`,
        selector: [
          {
            default: true,
            html: `Off`,
            value: "",
          },
          ...sub.map((item: any, i: number) => {
            return {
              html: `<div>${item.lang}</div>`,
              value: item?.url,
            };
          }),
        ],
        onSelect: function (item, $dom) {
          art.subtitle.switch(item.value);
          return item.html;
        },
      });
    }

    // Update volume control position
    art.controls.update({
      name: "volume",
      position: "left",
    });

    // Cleanup on unmount
    return () => {
      if (art && art.destroy) {
        art.destroy(false);
        art?.hls?.destroy();
      }
    };
  }, [posterUrl]);

  return <div ref={artRef} {...rest}></div>;
}
