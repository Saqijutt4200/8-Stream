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
// Add 15s backward button
    art.controls.add({
      name: "backward",
      position: "left",
      html: `<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M14.4314 16.9203H12.1414C11.7314 16.9203 11.3914 16.5803 11.3914 16.1703C11.3914 15.7603 11.7314 15.4203 12.1414 15.4203H14.4314C14.8614 15.4203 15.2114 15.0703 15.2114 14.6403C15.2114 14.2103 14.8614 13.8603 14.4314 13.8603H12.1414C11.9014 13.8603 11.6714 13.7403 11.5314 13.5503C11.3914 13.3603 11.3514 13.1003 11.4314 12.8703L12.1914 10.5803C12.2914 10.2703 12.5814 10.0703 12.9014 10.0703H15.9614C16.3714 10.0703 16.7114 10.4103 16.7114 10.8203C16.7114 11.2303 16.3714 11.5703 15.9614 11.5703H13.4414L13.1814 12.3603H14.4314C15.6914 12.3603 16.7114 13.3803 16.7114 14.6403C16.7114 15.9003 15.6814 16.9203 14.4314 16.9203Z" fill="#ffffff"></path> <path d="M9.54041 16.9208C9.13041 16.9208 8.79041 16.5808 8.79041 16.1708V12.7808L8.60041 13.0008C8.32041 13.3108 7.85041 13.3308 7.54041 13.0608C7.24041 12.7808 7.21041 12.3108 7.49041 12.0008L8.99041 10.3308C9.20041 10.1008 9.53041 10.0208 9.82041 10.1308C10.1104 10.2408 10.3004 10.5208 10.3004 10.8308V16.1808C10.2904 16.5908 9.96041 16.9208 9.54041 16.9208Z" fill="#ffffff"></path> <path d="M12.0016 3.47945C11.9216 3.47945 11.8416 3.48945 11.7616 3.48945L12.5816 2.46945C12.8416 2.14945 12.7916 1.66945 12.4616 1.41945C12.1316 1.16945 11.6716 1.20945 11.4116 1.53945L9.44156 3.99945C9.43156 4.00945 9.43156 4.01945 9.42156 4.03945C9.39156 4.07945 9.37156 4.12945 9.35156 4.16945C9.33156 4.21945 9.31156 4.25945 9.30156 4.29945C9.29156 4.34945 9.29156 4.38945 9.29156 4.43945C9.29156 4.48945 9.29156 4.53945 9.29156 4.58945C9.29156 4.60945 9.29156 4.61945 9.29156 4.63945C9.30156 4.66945 9.32156 4.68945 9.33156 4.71945C9.35156 4.76945 9.37156 4.80945 9.39156 4.85945C9.42156 4.89945 9.45156 4.93945 9.49156 4.96945C9.51156 4.99945 9.52156 5.02945 9.55156 5.04945C9.57156 5.05945 9.58156 5.06945 9.60156 5.07945C9.62156 5.09945 9.65156 5.10945 9.68156 5.11945C9.73156 5.14945 9.79156 5.16945 9.84156 5.17945C9.88156 5.19945 9.91156 5.19945 9.94156 5.19945C9.97156 5.19945 9.99156 5.20945 10.0216 5.20945C10.0516 5.20945 10.0716 5.19945 10.0916 5.18945C10.1216 5.18945 10.1516 5.19945 10.1816 5.18945C10.8216 5.03945 11.4216 4.96945 11.9916 4.96945C16.4816 4.96945 20.1316 8.61945 20.1316 13.1095C20.1316 17.5994 16.4816 21.2495 11.9916 21.2495C7.50156 21.2495 3.85156 17.5994 3.85156 13.1095C3.85156 11.3695 4.42156 9.68945 5.50156 8.24945C5.75156 7.91945 5.68156 7.44945 5.35156 7.19945C5.02156 6.94945 4.55156 7.01945 4.30156 7.34945C3.02156 9.04945 2.35156 11.0395 2.35156 13.1095C2.35156 18.4195 6.67156 22.7495 11.9916 22.7495C17.3116 22.7495 21.6316 18.4295 21.6316 13.1095C21.6316 7.78945 17.3116 3.47945 12.0016 3.47945Z" fill="#ffffff"></path> </g></svg>`,
      click: () => {
        art.currentTime = Math.max(0, art.currentTime - 15);
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
