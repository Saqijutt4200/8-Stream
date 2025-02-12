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

    art.controls.remove("playAndPause");

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
// Add 10s backward button
    art.controls.add({
      name: "backward",
      position: "left",
      html: `<svg width="113px" height="113px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="0.4" d="M9.53906 15.92V10.5801L8.03906 12.2501" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M10.0195 4.46997L11.9995 2" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M4.90939 7.79974C3.79939 9.27974 3.10938 11.1097 3.10938 13.1097C3.10938 18.0197 7.08939 21.9998 11.9994 21.9998C16.9094 21.9998 20.8894 18.0197 20.8894 13.1097C20.8894 8.19974 16.9094 4.21973 11.9994 4.21973C11.3194 4.21973 10.6594 4.30978 10.0194 4.45978" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path opacity="0.4" d="M14 10.5801C15.1 10.5801 16 11.4801 16 12.5801V13.9301C16 15.0301 15.1 15.9301 14 15.9301C12.9 15.9301 12 15.0301 12 13.9301V12.5801C12 11.4701 12.9 10.5801 14 10.5801Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`,
      click: () => {
        art.currentTime = Math.max(0, art.currentTime - 10);
      },
      style: {
        padding: "5px",
      },
    });

    // Add 10s forward button
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
