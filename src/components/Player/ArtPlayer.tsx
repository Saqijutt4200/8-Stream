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
        {
          html: "Quality",
          tooltip: "Select video quality",
          name: "quality",
          selector: [
            {
              html: "240P",
              value: "240",
            },
            {
              html: "360P",
              value: "360",
            },
            {
              html: "480P",
              value: "480",
            },
            {
              html: "720P",
              value: "720",
            },
            {
              html: "1080P",
              value: "1080",
            },
          ],
          onSelect: function (item) {
            const hls = art.hls;
            if (hls) {
              const levelIndex = hls.levels.findIndex(
                (level) => level.height === parseInt(item.value)
              );
              if (levelIndex !== -1) {
                hls.currentLevel = levelIndex;
              }
            }
            return item.html;
          },
        },
      ],
      container: artRef.current!,
      plugins: [
        artplayerPluginHlsQuality({
          control: true,
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
          ...sub.map((item: any) => ({
            html: `<div>${item.lang}</div>`,
            value: item?.url,
          })),
        ],
        onSelect: function (item) {
          art.subtitle.switch(item.value);
          return item.html;
        },
      });
    }

    art.controls.update({
      name: "volume",
      position: "right",
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
