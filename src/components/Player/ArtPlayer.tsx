import { useEffect, useState } from "react";
import Artplayer from "artplayer";
import { type Option } from "artplayer/types/option";
import artplayerPluginHlsQuality from "artplayer-plugin-hls-quality";
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
  posterUrl, // Add this prop
  availableLang = [], // Add this prop with default empty array
  onLanguageChange, // Add this prop
  ...rest
}: {
  option: Option;
  getInstance?: (art: Artplayer) => void;
  artRef: any;
  sub?: any;
  posterUrl?: string; // Add this prop
  availableLang?: string[]; // Add this to the type
  onLanguageChange?: (lang: string) => void; // Add this to the type
  [key: string]: any;
}) {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      /* Modern color scheme */
      .art-video-player {
        background-color: #1e1e1e;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }

      .art-controls {
        background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
        padding: 10px 15px !important;
      }

      .art-progress {
        background-color: rgba(255, 255, 255, 0.2);
      }

      .art-progress .art-progress-bar {
        background-color: #ff4757;
        height: 4px !important;
      }

      .art-progress .art-progress-indicator {
        background-color: #ff4757;
        border-radius: 50%;
        transform: scale(0.8);
        transition: transform 0.2s ease;
      }

      .art-progress:hover .art-progress-indicator {
        transform: scale(1);
      }

      .art-control-button {
        color: #fff;
        transition: all 0.3s ease;
      }

      .art-control-button:hover {
        color: #ff4757;
        transform: scale(1.1);
      }

      .art-control-volume .art-volume-slider {
        background-color: #ff4757;
      }

      .art-control-quality, .art-control-subtitle, .art-control-fullscreen {
        color: #fff;
      }

      .art-control-quality:hover, .art-control-subtitle:hover, .art-control-fullscreen:hover {
        color: #ff4757;
      }

      /* Custom icons */
      .art-control-play::before {
        content: "\\25B6"; /* Play icon */
      }

      .art-control-pause::before {
        content: "\\II"; /* Pause icon */
      }

      .art-control-volume::before {
        content: "\\1F50A"; /* Volume icon */
      }

      .art-control-fullscreen::before {
        content: "\\26F6"; /* Fullscreen icon */
      }

      /* Animation for controls */
      .art-controls {
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .art-video-player:hover .art-controls {
        opacity: 1;
      }

      /* Custom scrollbar */
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #ff4757 rgba(255, 255, 255, 0.2);
      }

      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }

      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.2);
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #ff4757;
        border-radius: 4px;
      }
    `;
    document.head.appendChild(style);

    const art = new Artplayer({
      ...option,
      settings: [
        {
          html: "Quality",
          tooltip: "Auto",
          name: "quality",
          selector: [
            {
              html: "480P",
              default: true,
              value: "480p",
            },
            {
              html: "720P",
              value: "720p",
            },
            {
              html: "1080P",
              value: "1080p",
            },
          ],
          onSelect: function (item) {
            const levels = art.hls.levels;
            if (!levels || levels.length === 0) return item.html;

            const selectedLevel = levels.reduce(
              (prev: HLSLevel, curr: HLSLevel, index: number) => {
                const prevDiff = Math.abs(prev.height - item.value);
                const currDiff = Math.abs(curr.height - item.value);
                return currDiff < prevDiff ? { ...curr, index } : prev;
              },
              { ...levels[0], index: 0 }
            );

            art.hls.currentLevel = selectedLevel.index;
            return item.html;
          },
        },
      ],
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
          click: function (...args) {
            console.info("click", args);
          },
          mounted: function (...args) {
            console.info("mounted", args);
          },
        },
        {
          name: "languageSelector",
          html: `
              <div class="language-selector" style="
                position: absolute;
                top: 15px;
                right: 15px;
                background-color: #ff4757;
                padding: 8px;
                border-radius: 4px;
                cursor: pointer;
                z-index: 100;
                transition: all 0.3s ease;
                backdrop-filter: blur(0px);
                transform: translateZ(0);
              ">
                <div class="current-lang" style="
                  color: white;
                  background-color: #ff4757;
                  font-size: 14px;
                  font-weight: 500;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  -webkit-font-smoothing: antialiased;
                  text-rendering: optimizeLegibility; 
                  text-shadow: none !important;
                ">
                  <span>${availableLang[0] || "Select Language"}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
                <div class="lang-options" style="
                  display: none;
                  position: absolute;
                  top: 100%;
                  right: 0;
                  background-color: rgba(0, 0, 0, 0.9);
                  border-radius: 4px;
                  margin-top: 4px;
                  min-width: 100px;
                  max-height: 100px;
                  overflow-y: auto;
                  border: 1px solid #ff4757;
                  z-index: 100;
                ">
                  ${availableLang
                    .map(
                      (lang: string) => `
                    <div class="lang-option" data-value="${lang}" style="
                    color: ${lang === availableLang[0] ? "#ff4757" : "white"};
                    background-color: ${
                      lang === availableLang[0] ? "#49484a" : "transparent"
                    };
                      padding: 8px 12px;
                      cursor: pointer;
                      font-size: 14px;
                      transition: background-color 0.2s;
                    ">
                      ${lang}
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>
            `,
          click: function (_, event) {
            const target = event.target as HTMLElement;
            const selector = target.closest(".language-selector");
            const option = target.closest(".lang-option");

            if (selector) {
              const options = selector.querySelector(
                ".lang-options"
              ) as HTMLElement;
              if (options) {
                const isHidden = options.style.display === "none";
                options.style.display = isHidden ? "block" : "none";

                if (isHidden) {
                  const currentLangText =
                    selector.querySelector(".current-lang span")?.textContent;
                  const allOptions = options.querySelectorAll(".lang-option");
                  allOptions.forEach((opt) => {
                    const optElement = opt as HTMLElement;
                    const isCurrentLang =
                      optElement.getAttribute("data-value") === currentLangText;
                    optElement.style.backgroundColor = isCurrentLang
                      ? "#49484a"
                      : "transparent";
                    optElement.style.color = isCurrentLang
                      ? "#ff4757"
                      : "white";
                  });
                }
              }
            }

            if (option && onLanguageChange) {
              const value = option.getAttribute("data-value");
              if (value) {
                onLanguageChange(value);

                const allOptions = selector?.querySelectorAll(".lang-option");
                allOptions?.forEach((opt) => {
                  const optElement = opt as HTMLElement;
                  optElement.style.backgroundColor = "transparent";
                  optElement.style.color = "white";
                });

                const optionElement = option as HTMLElement;
                optionElement.style.backgroundColor = "#49484a";
                optionElement.style.color = "#ff4757";
                const currentLang = selector?.querySelector(
                  ".current-lang span"
                ) as HTMLElement;
                if (currentLang) {
                  currentLang.textContent = value;
                }
                const options = selector?.querySelector(
                  ".lang-options"
                ) as HTMLElement;
                if (options) {
                  options.style.display = "none";
                }
              }
            }
          },
          mounted: function (layer) {
            const img = layer.querySelector('img');
            if (img) {
              img.addEventListener('contextmenu', (e) => e.preventDefault());
              img.addEventListener('touchstart', (e) => e.preventDefault());
              img.addEventListener('mousedown', (e) => e.preventDefault());
            }
            const selector = layer.querySelector(
              ".language-selector"
            ) as HTMLElement;
            if (selector) {
              selector.addEventListener("mouseenter", () => {
                selector.style.backgroundColor = "#ff4757";
              });
              selector.addEventListener("mouseleave", () => {
                selector.style.backgroundColor = "#ff4757";
                const options = selector.querySelector(
                  ".lang-options"
                ) as HTMLElement;
                if (options) {
                  options.style.display = "none";
                }
              });

              const options = selector.querySelectorAll(".lang-option");
              options.forEach((option) => {
                const optionElement = option as HTMLElement;
                optionElement.addEventListener("mouseenter", () => {
                  if (optionElement.style.color !== "#ff4757") {
                    optionElement.style.backgroundColor =
                      "rgba(255, 255, 255, 0.1)";
                  }
                });
                optionElement.addEventListener("mouseleave", () => {
                  const currentLangText =
                    selector.querySelector(".current-lang span")?.textContent;
                  const isCurrentLang =
                    optionElement.getAttribute("data-value") ===
                    currentLangText;
                  if (!isCurrentLang) {
                    optionElement.style.backgroundColor = "transparent";
                  }
                });
              });
              const langOptions = selector.querySelector(
                ".lang-options"
              ) as HTMLElement;
              if (langOptions) {
                langOptions.classList.add("custom-scrollbar");
              }
            }
          },
        },
      ],
      plugins: [],
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
    art.on("ready", () => {
      art.play();
      art.forward = 10;
      art.backward = 10;
    });
    if (getInstance && typeof getInstance === "function") {
      getInstance(art);
    }
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
      }
    });
    art.layers.add({
      name: "backward",
      html: `<div class="control-button control-backward"><svg fill="#ffffff" width="30px" height="30px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M 27.9999 54.4024 C 41.0546 54.4024 51.9063 43.5742 51.9063 30.4961 C 51.9063 18.9649 43.4687 9.1914 32.5234 7.0351 L 32.5234 3.7070 C 32.5234 2.0430 31.3749 1.5976 30.0858 2.5117 L 22.6093 7.7383 C 21.5546 8.4883 21.5312 9.6133 22.6093 10.3867 L 30.0624 15.6367 C 31.3749 16.5742 32.5234 16.1289 32.5234 14.4414 L 32.5234 11.0898 C 41.3827 13.1055 47.8983 21.0039 47.8983 30.4961 C 47.8983 41.5586 39.0390 50.4180 27.9999 50.4180 C 16.9374 50.4180 8.0546 41.5586 8.0780 30.4961 C 8.1014 23.8398 11.3358 17.9570 16.3280 14.3945 C 17.2890 13.6680 17.5936 12.5664 16.9843 11.5820 C 16.4218 10.6211 15.1327 10.3633 14.1014 11.1602 C 8.0546 15.5430 4.0937 22.6211 4.0937 30.4961 C 4.0937 43.5742 14.9218 54.4024 27.9999 54.4024 Z M 21.0390 40.1055 C 21.9530 40.1055 22.5155 39.4727 22.5155 38.4883 L 22.5155 23.6992 C 22.5155 22.5039 21.9296 21.8711 20.8749 21.8711 C 20.2187 21.8711 19.7499 22.0820 18.9062 22.6445 L 15.6952 24.8242 C 15.1562 25.2227 14.8983 25.6445 14.8983 26.1836 C 14.8983 26.9570 15.5077 27.6133 16.2577 27.6133 C 16.7265 27.6133 16.9609 27.5195 17.3827 27.1680 L 19.5858 25.5508 L 19.5858 38.4883 C 19.5858 39.4492 20.1483 40.1055 21.0390 40.1055 Z M 32.9452 40.3867 C 36.8358 40.3867 39.3905 37.8789 39.3905 34.1055 C 39.3905 30.6602 37.0702 28.1992 33.7421 28.1992 C 32.3358 28.1992 30.8358 28.8320 30.1562 29.8867 L 30.5546 24.8242 L 37.5624 24.8242 C 38.2655 24.8242 38.8514 24.2617 38.8514 23.4649 C 38.8514 22.6680 38.2655 22.1524 37.5624 22.1524 L 30.0858 22.1524 C 28.8436 22.1524 28.1640 22.8555 28.0702 24.0976 L 27.5546 30.8476 C 27.4609 32.0195 28.0702 32.5820 29.1014 32.5820 C 29.8749 32.5820 30.2030 32.4414 30.8593 31.9258 C 31.7733 31.1055 32.4765 30.7773 33.4140 30.7773 C 35.2421 30.7773 36.4609 32.1133 36.4609 34.1524 C 36.4609 36.2149 35.0077 37.7149 33.0858 37.7149 C 31.6796 37.7149 30.5077 36.9180 29.8983 35.6992 C 29.5468 35.0898 29.1249 34.7617 28.5390 34.7617 C 27.7655 34.7617 27.2265 35.3242 27.2265 36.1211 C 27.2265 36.4492 27.2968 36.7539 27.4140 37.0586 C 28.0468 38.7461 30.1093 40.3867 32.9452 40.3867 Z"></path></g></svg></div>`,
      click: () => {
        art.currentTime = Math.max(0, art.currentTime - 15);
      },
    });

    art.layers.add({
      name: "forward",
      html: `<div class="control-button control-forward"><svg fill="#ffffff" width="30px" height="30px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M 27.9999 54.4024 C 41.0546 54.4024 51.9063 43.5742 51.9063 30.4961 C 51.9063 22.6211 47.9219 15.5430 41.8983 11.1602 C 40.8671 10.3633 39.5780 10.6211 38.9921 11.5820 C 38.4062 12.5664 38.7109 13.6680 39.6483 14.3945 C 44.6405 17.9570 47.8983 23.8398 47.9219 30.4961 C 47.9454 41.5586 39.0390 50.4180 27.9999 50.4180 C 16.9374 50.4180 8.1014 41.5586 8.1014 30.4961 C 8.1014 21.0039 14.6171 13.1055 23.4765 11.0898 L 23.4765 14.4649 C 23.4765 16.1289 24.6249 16.5742 25.8905 15.6602 L 33.3905 10.4102 C 34.4452 9.6836 34.4687 8.5586 33.3905 7.7851 L 25.9140 2.5351 C 24.6249 1.5976 23.4765 2.0430 23.4765 3.7305 L 23.4765 7.0351 C 12.5077 9.1680 4.0937 18.9649 4.0937 30.4961 C 4.0937 43.5742 14.9218 54.4024 27.9999 54.4024 Z M 21.0390 40.1055 C 21.9530 40.1055 22.5155 39.4727 22.5155 38.4883 L 22.5155 23.6992 C 22.5155 22.5039 21.9296 21.8711 20.8749 21.8711 C 20.2187 21.8711 19.7499 22.0820 18.9062 22.6445 L 15.6952 24.8242 C 15.1562 25.2227 14.8983 25.6445 14.8983 26.1836 C 14.8983 26.9570 15.5077 27.6133 16.2577 27.6133 C 16.7265 27.6133 16.9609 27.5195 17.3827 27.1680 L 19.5858 25.5508 L 19.5858 38.4883 C 19.5858 39.4492 20.1483 40.1055 21.0390 40.1055 Z M 32.9452 40.3867 C 36.8358 40.3867 39.3905 37.8789 39.3905 34.1055 C 39.3905 30.6602 37.0702 28.1992 33.7421 28.1992 C 32.3358 28.1992 30.8358 28.8320 30.1562 29.8867 L 30.5546 24.8242 L 37.5624 24.8242 C 38.2655 24.8242 38.8514 24.2617 38.8514 23.4649 C 38.8514 22.6680 38.2655 22.1524 37.5624 22.1524 L 30.0858 22.1524 C 28.8436 22.1524 28.1640 22.8555 28.0702 24.0976 L 27.5546 30.8476 C 27.4609 32.0195 28.0702 32.5820 29.1014 32.5820 C 29.8749 32.5820 30.2030 32.4414 30.8593 31.9258 C 31.7733 31.1055 32.4765 30.7773 33.4140 30.7773 C 35.2421 30.7773 36.4609 32.1133 36.4609 34.1524 C 36.4609 36.2149 35.0077 37.7149 33.0858 37.7149 C 31.6796 37.7149 30.5077 36.9180 29.8983 35.6992 C 29.5468 35.0898 29.1249 34.7617 28.5390 34.7617 C 27.7655 34.7617 27.2265 35.3242 27.2265 36.1211 C 27.2265 36.4492 27.2968 36.7539 27.4140 37.0586 C 28.0468 38.7461 30.1093 40.3867 32.9452 40.3867 Z"></path></g></svg></div>`,
      click: () => {
        art.currentTime = Math.min(art.duration, art.currentTime + 15);
      },
    });

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

    if (sub?.length > 0) {
      art.controls.add({
        name: "subtitle",
        position: "right",
        html: `subtitle`,
        selector: [
          {
            default: true,
            html: `off`,
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
    art.controls.update({
      name: "volume",
      position: "left",
    });
    console.log("controls", art.controls);
    return () => {
      if (art && art.destroy) {
        art.destroy(false);
        art?.hls?.destroy();
      }
    };
  }, [posterUrl]);

  return <div ref={artRef} {...rest}></div>;
}
