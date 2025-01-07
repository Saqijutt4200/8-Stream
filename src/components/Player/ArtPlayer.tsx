import { useEffect, useState } from "react";
import Artplayer from "artplayer";
import { type Option } from "artplayer/types/option";
import artplayerPluginHlsQuality from "artplayer-plugin-hls-quality";
import Hls from "hls.js";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

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
  useEffect(() => {
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
            html: `<img style="object-fit: cover; height: 100%; width: 100%; "  src="${posterUrl}">`,
            tooltip: "Poster Tip",
            style: {
              position: "absolute",
              top: "0",
              right: "0",
              height: "100%",
              width: "100%",
              overflow: "hidden"
            },
            click: function (...args) {
              console.info("click", args);
            },
            mounted: function (...args) {
              console.info("mounted", args);
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

      art.on("ready", () => {
        art.play();
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
        }
      });
  
      art.on("play", () => {
        art.layers.update({
          name: "poster",
            html: `<img style="object-fit: cover; height: 100%; width: 100%; "  src="${posterUrl}">`,
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
            html: `<img style="object-fit: cover; height: 100%; width: 100%; "  src="${posterUrl}">`,
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
  }, []);

  if (isSandboxed) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/95 z-50">
        <div className="bg-red-600/20 border-2 border-red-600 rounded-lg p-8 max-w-xl mx-4">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="text-red-500 text-5xl">⚠️</div>
            <h2 className="text-2xl font-bold text-white">Sandbox Mode Detected</h2>
            <p className="text-gray-300">
              This video player cannot be embedded in sandbox mode for security reasons.
              Please visit our website directly to watch the content.
            </p>
            <div className="text-sm text-gray-400 mt-4">
              Error Code: SANDBOX_RESTRICTED
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div ref={artRef} {...rest}></div>;
}
