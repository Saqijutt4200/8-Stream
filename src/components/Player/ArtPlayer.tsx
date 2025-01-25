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
        art.seek(art.currentTime - 10); // Seek back 10 seconds
      } else if (!isInputFocused && event?.code === "ArrowRight") {
        event.preventDefault();
        art.seek(art.currentTime + 10); // Seek forward 10 seconds
      }
    });

    // Add custom controls for back and forward 10s
    art.controls.add({
      name: "backward",
      position: "left",
      html: `<div>10s Back</div>`,
      onClick: () => {
        art.seek(art.currentTime - 10); // Seek back 10 seconds
      },
    });

    art.controls.add({
      name: "forward",
      position: "right",
      html: `<div>10s Forward</div>`,
      onClick: () => {
        art.seek(art.currentTime + 10); // Seek forward 10 seconds
      },
    });

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
  }, [option, getInstance, artRef, sub]);

  return <div ref={artRef} {...rest}></div>;
}
