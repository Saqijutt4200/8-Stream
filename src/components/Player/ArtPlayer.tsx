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
          tooltip: "Adjust font size",
          name: "fontSize",
          selector: [
            { html: "Small", value: "20px" },
            { html: "Medium", value: "35px", default: true },
            { html: "Large", value: "48px" },
          ],
          onSelect: function (item) {
            art.subtitle.style({ "font-size": item.value });
            return item.html;
          },
        },
        {
          html: "Playback Speed",
          tooltip: "Adjust speed",
          name: "speed",
          selector: [
            { html: "0.5x", value: 0.5 },
            { html: "1x (Normal)", value: 1, default: true },
            { html: "1.5x", value: 1.5 },
            { html: "2x", value: 2 },
          ],
          onSelect: function (item) {
            art.playbackRate = item.value;
            return `${item.html}`;
          },
        },
      ],
      container: artRef.current!,
      plugins: [
        artplayerPluginHlsQuality({
          control: true,
          getResolution: (level) => {
            if (level.height <= 240) return "240P";
            if (level.height <= 360) return "360P";
            if (level.height <= 480) return "480P";
            if (level.height <= 720) return "720P";
            if (level.height <= 1080) return "1080P";
            return level.height + "P";
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

    // Custom Controls
    art.controls.add({
      name: "PiP",
      position: "right",
      html: "Picture-in-Picture",
      onClick: () => {
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture();
        } else {
          art.video.requestPictureInPicture();
        }
      },
    });

    // Handle playback resume
    const lastPlayed = localStorage.getItem("lastPlayed");
    if (lastPlayed) {
      art.currentTime = parseFloat(lastPlayed);
    }
    art.on("timeupdate", () => {
      localStorage.setItem("lastPlayed", art.currentTime.toString());
    });

    // Subtitle settings
    if (sub?.length > 0) {
      art.controls.add({
        name: "subtitle",
        position: "right",
        html: `Subtitle`,
        selector: [
          { default: true, html: `Off`, value: "" },
          ...sub.map((item: any) => ({
            html: item.lang,
            value: item.url,
          })),
        ],
        onSelect: function (item) {
          art.subtitle.switch(item.value);
          return item.html;
        },
      });
    }

    if (getInstance) getInstance(art);

    // Cleanup on component unmount
    return () => {
      art.destroy(false);
      art.hls?.destroy();
    };
  }, []);

  return <div ref={artRef} {...rest}></div>;
}
