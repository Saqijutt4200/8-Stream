import { useEffect } from "react";
import Artplayer from "artplayer";
import { type Option } from "artplayer/types/option";
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
      customType: {
        m3u8: function playM3u8(video, url, art) {
          if (Hls.isSupported()) {
            if (art.hls) art.hls.destroy();
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            art.hls = hls;

            // Add quality levels when HLS loads
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              const levels = hls.levels.map((level, index) => ({
                html: `${level.height}P`,
                value: index,
                default: index === hls.firstLevel,
              }));

              // Add quality to the settings menu
              art.controls.add({
                name: "quality",
                position: "settings",
                html: "Quality",
                selector: levels,
                onSelect: (item) => {
                  hls.currentLevel = item.value;
                  return item.html;
                },
              });
            });

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

    // Add subtitles if provided
    if (sub?.length > 0) {
      art.controls.add({
        name: "subtitle",
        position: "settings",
        html: "Subtitle",
        selector: [
          { html: "Off", value: "", default: true },
          ...sub.map((item: any) => ({
            html: item.lang,
            value: item.url,
          })),
        ],
        onSelect: (item) => {
          // @ts-ignore
          art.subtitle.switch(item.value);
          return item.html;
        },
      });
    }

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
        art?.hls?.destroy();
      }
    };
  }, []);

  return <div ref={artRef} {...rest}></div>;
}
