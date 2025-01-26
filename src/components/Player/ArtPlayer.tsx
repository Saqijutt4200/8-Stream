import { useEffect, useState } from "react";
import Artplayer from "artplayer";
import { type Option } from "artplayer/types/option";
import { type Component } from "artplayer/types/component";
import artplayerPluginHlsQuality from "artplayer-plugin-hls-quality";
import Hls from "hls.js";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";


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
  ...rest
}: {
  option: Option;
  getInstance?: (art: Artplayer) => void;
  artRef: any;
  sub?: any;
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
        .skip-button {
          
          transition: all 0.3s ease;
          border: none;
          background-color: rgba(28, 28, 28, 0.8);
          border-radius: 50%;
          padding: 15px;
          cursor: pointer;
          z-index: 10;
          transform: scale(0.5);
          position: absolute;
          top: 50%;
        }
        
    
      `;
      document.head.appendChild(style);

      const art = new Artplayer({
        ...option,
        settings: [
          {
            html: "Font size",
            tooltip: "medium",
            name: "fontSize",
            selector: [
              {
                html: "small",
                value: "20px",
              },
              {
                html: "medium",
                default: true,
                value: "35px",
              },
              {
                html: "large",
                value: "48px",
              },
            ],
            onSelect: function (item) {
              art.subtitle.style({
                //@ts-ignore
                "font-size": item.value,
              });
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
            name: "skipBackward",
            html: `
              <button type="button" class="skip-button" style="
                position: absolute;
                left: 20%;
                top: 50%;
                opacity: 0;
                
              ">
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 48 48">
<path d="M 24 4 C 17.595652 4 11.890701 7.0253275 8.2285156 11.720703 L 7.9804688 10.316406 A 1.50015 1.50015 0 0 0 6.515625 9.0546875 A 1.50015 1.50015 0 0 0 5.0273438 10.835938 L 5.8945312 15.759766 A 1.50015 1.50015 0 0 0 7.6328125 16.976562 L 12.556641 16.109375 A 1.5003693 1.5003693 0 1 0 12.035156 13.154297 L 10.728516 13.384766 C 13.841475 9.4960454 18.619092 7 24 7 C 33.406292 7 41 14.593708 41 24 C 41 33.406292 33.406292 41 24 41 C 14.593708 41 7 33.406292 7 24 C 7 23.854658 7.0021894 23.708402 7.0058594 23.564453 A 1.5004834 1.5004834 0 0 0 4.0058594 23.488281 C 4.0015263 23.65833 4 23.829342 4 24 C 4 35.027708 12.972292 44 24 44 C 35.027708 44 44 35.027708 44 24 C 44 12.972292 35.027708 4 24 4 z M 27.5 17 C 25.019 17 23 19.019 23 21.5 L 23 26.5 C 23 28.981 25.019 31 27.5 31 C 29.981 31 32 28.981 32 26.5 L 32 21.5 C 32 19.019 29.981 17 27.5 17 z M 19.595703 17.001953 C 19.49775 17.010188 19.399938 17.0305 19.304688 17.0625 L 16.304688 18.0625 C 15.649688 18.2815 15.295672 18.989531 15.513672 19.644531 C 15.732672 20.298531 16.439703 20.651547 17.095703 20.435547 L 18.449219 19.984375 L 18.449219 29.75 C 18.449219 30.44 19.009219 31 19.699219 31 C 20.390219 31 20.949219 30.440047 20.949219 29.748047 L 20.949219 18.248047 C 20.949219 17.846047 20.757641 17.469375 20.431641 17.234375 C 20.187141 17.058125 19.889563 16.97725 19.595703 17.001953 z M 27.5 19.5 C 28.603 19.5 29.5 20.397 29.5 21.5 L 29.5 26.5 C 29.5 27.603 28.603 28.5 27.5 28.5 C 26.397 28.5 25.5 27.603 25.5 26.5 L 25.5 21.5 C 25.5 20.398 26.397 19.5 27.5 19.5 z"></path>
</svg>
              </button>
            `,
            click: function (this: Artplayer, _: Component, event: Event) {
              const target = event.target as HTMLElement;
              const button = target.closest('.skip-button');
              if (button) {
                const newTime = Math.max(0, this.currentTime - 10);
                this.seek = newTime;
                
                // Add active class for animation
                button.classList.add('active');
                setTimeout(() => button.classList.remove('active'), 300);
              }
            },
          },
          // Add skip forward button layer
          {
            name: "skipForward",
            html: `
              <button type="button" class="skip-button" style="
                position: absolute;
                right: 20%;
                top: 50%;
                
              ">
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 48 48">
<path d="M 24 4 C 12.972292 4 4 12.972292 4 24 C 4 35.027708 12.972292 44 24 44 C 35.027708 44 44 35.027708 44 24 C 44 23.829342 43.998541 23.658332 43.994141 23.488281 A 1.5004834 1.5004834 0 0 0 40.994141 23.564453 C 40.997849 23.708404 41 23.854658 41 24 C 41 33.406292 33.406292 41 24 41 C 14.593708 41 7 33.406292 7 24 C 7 14.593708 14.593708 7 24 7 C 29.380908 7 34.158525 9.4960454 37.271484 13.384766 L 35.964844 13.154297 A 1.5003693 1.5003693 0 0 0 35.443359 16.109375 L 40.367188 16.976562 A 1.50015 1.50015 0 0 0 42.105469 15.759766 L 42.972656 10.835938 A 1.50015 1.50015 0 0 0 41.439453 9.0566406 A 1.50015 1.50015 0 0 0 40.019531 10.316406 L 39.771484 11.720703 C 36.109299 7.0253275 30.404348 4 24 4 z M 27.5 17 C 25.019 17 23 19.019 23 21.5 L 23 26.5 C 23 28.981 25.019 31 27.5 31 C 29.981 31 32 28.981 32 26.5 L 32 21.5 C 32 19.019 29.981 17 27.5 17 z M 19.595703 17.001953 C 19.49775 17.010188 19.399938 17.0305 19.304688 17.0625 L 16.304688 18.0625 C 15.649688 18.2815 15.295672 18.989531 15.513672 19.644531 C 15.732672 20.298531 16.439703 20.651547 17.095703 20.435547 L 18.449219 19.984375 L 18.449219 29.75 C 18.449219 30.44 19.009219 31 19.699219 31 C 20.390219 31 20.949219 30.440047 20.949219 29.748047 L 20.949219 18.248047 C 20.949219 17.846047 20.757641 17.469375 20.431641 17.234375 C 20.187141 17.058125 19.889563 16.97725 19.595703 17.001953 z M 27.5 19.5 C 28.603 19.5 29.5 20.397 29.5 21.5 L 29.5 26.5 C 29.5 27.603 28.603 28.5 27.5 28.5 C 26.397 28.5 25.5 27.603 25.5 26.5 L 25.5 21.5 C 25.5 20.398 26.397 19.5 27.5 19.5 z"></path>
</svg>
              </button>
            `,
            click: function (this: Artplayer, _: Component, event: Event) {
              const target = event.target as HTMLElement;
              const button = target.closest('.skip-button');
              if (button) {
                const newTime = Math.min(this.duration, art.currentTime + 10);
                this.seek = newTime;
                
                // Add active class for animation
                button.classList.add('active');
                setTimeout(() => button.classList.remove('active'), 300);
              }
            },
          },
        ],
        plugins: [
          artplayerPluginHlsQuality({
            // Show quality in control
            control: true,

            // Get the resolution text from level
            getResolution: (level) => {
              if (level.height <= 240) {
                return "240P";
              } else if (level.height > 240 && level.height <= 360) {
                return "360P";
              } else if (level.height > 360 && level.height <= 480) {
                return "480P";
              } else if (level.height > 480 && level.height <= 720) {
                return "720P";
              } else if (level.height > 720 && level.height <= 1080) {
                return "1080P";
              } else {
                return level.height + "P";
              }
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

      art.proxy(art.template.$container, 'touchstart', () => {
        art.layers.update({
          name: 'skipBackward',
          style: {
            opacity: '1',
            
          }
        });
      
        art.layers.update({
          name: 'skipForward',
          style: {
            opacity: '1'
          }
        });
        
        // Hide buttons after 3 seconds
        setTimeout(() => {
          art.layers.update({
            name: 'skipBackward',
            style: {
              opacity: '0'
            }
          });
      
          art.layers.update({
            name: 'skipForward',
            style: {
              opacity: '0'
            }
          });
        }, 3000);
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

  return <div ref={artRef} {...rest}></div>;
}