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
