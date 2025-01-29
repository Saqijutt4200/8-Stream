import { useEffect, useState } from "react";
import Artplayer from "artplayer";
import { type Option } from "artplayer/types/option";
import { type Component } from "artplayer/types/component";
import artplayerPluginHlsQuality from "artplayer-plugin-hls-quality";
import Hls from "hls.js";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";


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
  availableLang = [], // Add this prop with default empty array
  onLanguageChange, // Add this prop
  ...rest
}: {
  option: Option;
  getInstance?: (art: Artplayer) => void;
  artRef: any;
  sub?: any;
  availableLang?: string[]; // Add this to the type
  onLanguageChange?: (lang: string) => void; // Add this to the type
  [key: string]: any;
}) {
  const posterUrl = useSelector(
    (state: RootState) => state.posterUrl.currentPosterUrl
  );
  const [isSandboxed, setIsSandboxed] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // NEW: Effect to detect mobile devices
  useEffect(() => {
    if (!artRef.current) {
      return;
    }
    const checkSandbox = () => {
      try {
        // Check if we're in an iframe
        const isIframe = window !== window.parent;

        // Try to access parent window - will throw error if sandboxed
        if (isIframe) {
          window.parent.document;
        }

        return false;
      } catch (e) {
        return true;
      }
    };

    const sandboxed = checkSandbox();
    setIsSandboxed(sandboxed);

    if (!sandboxed) {
      console.log(posterUrl);
      const storedImageUrl = localStorage.getItem("currentPosterUrl");
      const container = artRef.current;

      if (!(container instanceof Element)) {
        console.error("Invalid container element for ArtPlayer");
        return;
      }

      const style = document.createElement("style");
      style.textContent = `
      
        
        .art-video-player .art-progress .art-progress-bar {
          height: 4px !important; /* Make the line bolder */
          
        }
        
        .art-video-player .art-progress .art-progress-loaded {
          height: 4px !important; /* Match the bar height */
          
        }
        
        .art-video-player .art-progress .art-progress-played {
          height: 4px !important; /* Match the bar height */
          
        }
        
        .art-video-player .art-progress .art-progress-highlight {
          height: 4px !important; /* Match the bar height */
        }
        
        .art-video-player .art-progress .art-progress-indicator {
          transform: scale(0.6) !important; /* Reduce dot size by 40% */
          
        }
        
        .art-video-player .art-progress:hover .art-progress-indicator {
          transform: scale(0.8) !important; /* Slightly larger on hover */
        }
        
        .art-video-player .art-progress {
          margin-top: 2px !important; /* Adjust for thicker line */
        }
        .art-video-player {
          margin-bottom: 0 !important;
          padding-bottom: 0 !important;
        }

        .art-video-player .art-controls {
          bottom: 0 !important;
          margin-bottom: 0 !important;
        }

        .art-video-player .art-control-progress {
          bottom: 45px !important;
        }

        .art-video-player .art-control-fullscreen {
          margin-bottom: 0 !important;
        }
        
    
      `;
      document.head.appendChild(style);

      const art = new Artplayer({
        ...option,
        settings: [
          {
            html: "Quality",
            tooltip: "Quality",
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
              // Get quality levels from HLS
              const levels = art.hls.levels;
              if (!levels || levels.length === 0) return item.html;
        
              // Find the closest matching quality level
              const selectedLevel = levels.reduce((prev: HLSLevel, curr: HLSLevel, index: number) => {
                const prevDiff = Math.abs(prev.height - item.value);
                const currDiff = Math.abs(curr.height - item.value);
                return currDiff < prevDiff ? { ...curr, index } : prev;
              }, { ...levels[0], index: 0 });
        
              art.hls.currentLevel = selectedLevel.index;
              return item.html;
            },
          },
         
        ],
        container: artRef.current!,
        layers: [
          {
            name: "poster",
            html: `<img style="object-fit: cover; height: 100%; width: 100%; "  src="${storedImageUrl}">`,
            tooltip: "Poster Tip",
            style: {
              position: "absolute",
              top: "0",
              right: "0",
              height: "100%",
              width: "100%",
              overflow: "hidden",
            },
            click: function (...args) {
              console.info("click", args);
            },
            mounted: function (...args) {
              console.info("mounted", args);
            },
          },
          
          {
            name: 'languageSelector',
            html: `
              <div class="language-selector" style="
                position: absolute;
                top: 20px;
                right: 20px;
                background-color: rgba(0, 0, 0, 0.7);
                padding: 8px;
                border-radius: 4px;
                cursor: pointer;
                z-index: 100;
                transition: all 0.3s ease;
              ">
                <div class="current-lang" style="
                  color: white;
                  font-size: 14px;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                ">
                  <span>${availableLang[0] || 'Select Language'}</span>
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
                ">
                  ${availableLang.map((lang: string) => `
                    <div class="lang-option" data-value="${lang}" style="
                      color: white;
                      padding: 8px 12px;
                      cursor: pointer;
                      font-size: 14px;
                      transition: background-color 0.2s;
                    ">
                      ${lang}
                    </div>
                  `).join('')}
                </div>
              </div>
            `,
            click: function(_, event) {
              const target = event.target as HTMLElement;
              const selector = target.closest('.language-selector');
              const option = target.closest('.lang-option');
              
              if (selector) {
                const options = selector.querySelector('.lang-options') as HTMLElement;
                if (options) {
                  const isHidden = options.style.display === 'none';
                  options.style.display = isHidden ? 'block' : 'none';
                }
              }
              
              if (option && onLanguageChange) {
                const value = option.getAttribute('data-value');
                if (value) {
                  //setCurrentLang(value);
                  onLanguageChange(value);
                  const currentLang = selector?.querySelector('.current-lang span') as HTMLElement;
                  if (currentLang) {
                    currentLang.textContent = value;
                  }
                  const options = selector?.querySelector('.lang-options') as HTMLElement;
                  if (options) {
                    options.style.display = 'none';
                  }
                }
              }
            },
            mounted: function(layer) {
              // Add hover effects
              const selector = layer.querySelector('.language-selector') as HTMLElement;
              if (selector) {
                selector.addEventListener('mouseenter', () => {
                  selector.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                });
                selector.addEventListener('mouseleave', () => {
                  selector.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                  const options = selector.querySelector('.lang-options') as HTMLElement;
                  if (options) {
                    options.style.display = 'none';
                  }
                });
                
                // Add hover effect for options
                const options = selector.querySelectorAll('.lang-option');
                options.forEach(option => {
                  const optionElement = option as HTMLElement;
                  optionElement.addEventListener('mouseenter', () => {
                    optionElement.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  });
                  optionElement.addEventListener('mouseleave', () => {
                    optionElement.style.backgroundColor = 'transparent';
                  });
                });
              }
            }
          }
        ],
        plugins: [],
        customType: {
          m3u8: function playM3u8(video, url, art) {
            if (Hls.isSupported()) {
              if (art.hls) art.hls.destroy();
              const hls = new Hls({
                debug: true, // Enable debug logs
              });
              
              // Add error handling
              hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                  console.error('HLS error:', data);
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
                      // Cannot recover
                      hls.destroy();
                      art.notice.show = `Playback error: ${data.type}`;
                      break;
                  }
                }
              });
        
              // Add loading state handler
              hls.on(Hls.Events.MANIFEST_LOADING, () => {
                console.log('Loading manifest from URL:', url);
              });
        
              hls.on(Hls.Events.MANIFEST_LOADED, () => {
                console.log('Manifest loaded successfully');
              });
        
              try {
                hls.loadSource(url);
                hls.attachMedia(video);
                art.hls = hls;
                
                // Add event listener for level loading
                hls.on(Hls.Events.MANIFEST_PARSED, function (_, data) {
                  console.log('Available levels:', hls.levels);
                  
                  if (hls.levels.length > 0) {
                    const standardQualities: QualityLevel[] = [
                      { height: 1080, html: "1080P" },
                      { height: 720, html: "720P" },
                      { height: 480, html: "480P" },
                      { height: 360, html: "360P" },
                      { height: 240, html: "240P" }
                    ];
                    // Filter available qualities to closest matching standard qualities
    const availableQualities = standardQualities
    .filter(sq => {
      // Only include qualities that have a reasonably close match
      return hls.levels.some(level => 
        Math.abs(level.height - sq.height) < 100
      );
    })
    .map(sq => ({
      html: sq.html,
      value: sq.height,
      default: sq.height === 1080 // Set 1080P as default if available
    }));

  // If 1080P is not available, set the highest available quality as default
  if (!availableQualities.some(q => q.default)) {
    availableQualities[0].default = true;
  }
                    
                    // Update the quality selector options
                    art.setting.update({
                      name: 'quality',
                      selector: availableQualities,
                    });
                  }
                });
        
                art.on("destroy", () => {
                  console.log("Destroying HLS instance");
                  hls.destroy();
                });
        
              } catch (error) {
                console.error('Error setting up HLS:', error);
                art.notice.show = 'Failed to load video source';
              }
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
              // Fallback for Safari
              video.src = url;
            } else {
              art.notice.show = "Unsupported playback format: m3u8";
            }
          },
        }
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
        // Check if the focus is on an input field or textarea
        const isInputFocused =
          document?.activeElement?.tagName === "INPUT" ||
          document?.activeElement?.tagName === "TEXTAREA";

        if (!isInputFocused && event?.code === "Space") {
          event.preventDefault();
          art.playing ? art.pause() : art.play();
        } else if (!isInputFocused && event?.code === "KeyF") {
          event.preventDefault();
          art.fullscreen = !art.fullscreen;
        } else if (!isInputFocused && event?.code === "ArrowLeft") {
          event.preventDefault();
          art.currentTime = Math.max(0, art.currentTime - 10);
        } else if (!isInputFocused && event?.code === "ArrowRight") {
          event.preventDefault();
          art.currentTime = Math.min(art.duration, art.currentTime + 10);
        }
      });

      art.on("play", () => {
        art.layers.update({
          name: "poster",
          html: `<img style="object-fit: cover; height: 100%; width: 100%; "  src="${storedImageUrl}">`,
          tooltip: "Poster Tip",
          style: {
            position: "absolute",
            display: "none",
            top: "0",
            right: "0",
            height: "100%",
            width: "100%",
            overflow: "hidden",
          },
        });
      });
      art.on("pause", () => {
        art.layers.update({
          name: "poster",
          html: `<img style="object-fit: cover; height: 100%; width: 100%; "  src="${storedImageUrl}">`,
          tooltip: "Poster Tip",
          style: {
            position: "absolute",
            display: "block",
            top: "0",
            right: "0",
            height: "100%",
            width: "100%",
            overflow: "hidden",
          },
        });
      });

      //art.controls.remove("playAndPause");
      
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
            // @ts-ignore
            art.subtitle.switch(item.value);
            return item.html;
          },
        });
      }
      art.controls.update({
        name: "volume",
        position: "right",
      });
      console.log("controls", art.controls);
      return () => {
        if (art && art.destroy) {
          art.destroy(false);
          art?.hls?.destroy();
        }
      };
    }
  }, [artRef.current]);

  if (isSandboxed) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/95 z-50">
        <div className="bg-red-600/20 border-2 border-red-600 rounded-lg p-8 max-w-xl mx-4">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="text-red-500 text-5xl">⚠️</div>
            <h2 className="text-2xl font-bold text-white">
              Sandbox Mode Detected
            </h2>
            <p className="text-gray-300">
              This video player cannot be embedded in sandbox mode for security
              reasons. Please visit our website directly to watch the content.
            </p>
            <div className="text-sm text-gray-400 mt-4">
              Error Code: SANDBOX_RESTRICTED
            </div>
          </div>
        </div>
      </div>
    );
  }

  //

  return <div ref={artRef} className="w-full h-full" {...rest}></div>;
}