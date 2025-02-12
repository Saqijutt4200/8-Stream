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
  html: `<svg fill="#ffffff" width="64px" height="64px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M 27.9999 54.4024 C 41.0546 54.4024 51.9063 43.5742 51.9063 30.4961 C 51.9063 18.9649 43.4687 9.1914 32.5234 7.0351 L 32.5234 3.7070 C 32.5234 2.0430 31.3749 1.5976 30.0858 2.5117 L 22.6093 7.7383 C 21.5546 8.4883 21.5312 9.6133 22.6093 10.3867 L 30.0624 15.6367 C 31.3749 16.5742 32.5234 16.1289 32.5234 14.4414 L 32.5234 11.0898 C 41.3827 13.1055 47.8983 21.0039 47.8983 30.4961 C 47.8983 41.5586 39.0390 50.4180 27.9999 50.4180 C 16.9374 50.4180 8.0546 41.5586 8.0780 30.4961 C 8.1014 23.8398 11.3358 17.9570 16.3280 14.3945 C 17.2890 13.6680 17.5936 12.5664 16.9843 11.5820 C 16.4218 10.6211 15.1327 10.3633 14.1014 11.1602 C 8.0546 15.5430 4.0937 22.6211 4.0937 30.4961 C 4.0937 43.5742 14.9218 54.4024 27.9999 54.4024 Z M 21.0390 40.1055 C 21.9530 40.1055 22.5155 39.4727 22.5155 38.4883 L 22.5155 23.6992 C 22.5155 22.5039 21.9296 21.8711 20.8749 21.8711 C 20.2187 21.8711 19.7499 22.0820 18.9062 22.6445 L 15.6952 24.8242 C 15.1562 25.2227 14.8983 25.6445 14.8983 26.1836 C 14.8983 26.9570 15.5077 27.6133 16.2577 27.6133 C 16.7265 27.6133 16.9609 27.5195 17.3827 27.1680 L 19.5858 25.5508 L 19.5858 38.4883 C 19.5858 39.4492 20.1483 40.1055 21.0390 40.1055 Z M 32.9452 40.3867 C 36.8358 40.3867 39.3905 37.8789 39.3905 34.1055 C 39.3905 30.6602 37.0702 28.1992 33.7421 28.1992 C 32.3358 28.1992 30.8358 28.8320 30.1562 29.8867 L 30.5546 24.8242 L 37.5624 24.8242 C 38.2655 24.8242 38.8514 24.2617 38.8514 23.4649 C 38.8514 22.6680 38.2655 22.1524 37.5624 22.1524 L 30.0858 22.1524 C 28.8436 22.1524 28.1640 22.8555 28.0702 24.0976 L 27.5546 30.8476 C 27.4609 32.0195 28.0702 32.5820 29.1014 32.5820 C 29.8749 32.5820 30.2030 32.4414 30.8593 31.9258 C 31.7733 31.1055 32.4765 30.7773 33.4140 30.7773 C 35.2421 30.7773 36.4609 32.1133 36.4609 34.1524 C 36.4609 36.2149 35.0077 37.7149 33.0858 37.7149 C 31.6796 37.7149 30.5077 36.9180 29.8983 35.6992 C 29.5468 35.0898 29.1249 34.7617 28.5390 34.7617 C 27.7655 34.7617 27.2265 35.3242 27.2265 36.1211 C 27.2265 36.4492 27.2968 36.7539 27.4140 37.0586 C 28.0468 38.7461 30.1093 40.3867 32.9452 40.3867 Z"></path></g></svg>`,
  click: (event) => {
    art.currentTime = Math.max(0, art.currentTime - 15);
    animateIcon(event.currentTarget);
  },
  style: {
    padding: "5px",
    transition: "transform 0.2s ease-in-out",
  },
});

// Add 15s forward button
art.controls.add({
  name: "forward",
  position: "right",
  html: `<svg fill="#ffffff" width="64px" height="64px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M 27.9999 54.4024 C 41.0546 54.4024 51.9063 43.5742 51.9063 30.4961 C 51.9063 22.6211 47.9219 15.5430 41.8983 11.1602 C 40.8671 10.3633 39.5780 10.6211 38.9921 11.5820 C 38.4062 12.5664 38.7109 13.6680 39.6483 14.3945 C 44.6405 17.9570 47.8983 23.8398 47.9219 30.4961 C 47.9454 41.5586 39.0390 50.4180 27.9999 50.4180 C 16.9374 50.4180 8.1014 41.5586 8.1014 30.4961 C 8.1014 21.0039 14.6171 13.1055 23.4765 11.0898 L 23.4765 14.4649 C 23.4765 16.1289 24.6249 16.5742 25.8905 15.6602 L 33.3905 10.4102 C 34.4452 9.6836 34.4687 8.5586 33.3905 7.7851 L 25.9140 2.5351 C 24.6249 1.5976 23.4765 2.0430 23.4765 3.7305 L 23.4765 7.0351 C 12.5077 9.1680 4.0937 18.9649 4.0937 30.4961 C 4.0937 43.5742 14.9218 54.4024 27.9999 54.4024 Z M 21.0390 40.1055 C 21.9530 40.1055 22.5155 39.4727 22.5155 38.4883 L 22.5155 23.6992 C 22.5155 22.5039 21.9296 21.8711 20.8749 21.8711 C 20.2187 21.8711 19.7499 22.0820 18.9062 22.6445 L 15.6952 24.8242 C 15.1562 25.2227 14.8983 25.6445 14.8983 26.1836 C 14.8983 26.9570 15.5077 27.6133 16.2577 27.6133 C 16.7265 27.6133 16.9609 27.5195 17.3827 27.1680 L 19.5858 25.5508 L 19.5858 38.4883 C 19.5858 39.4492 20.1483 40.1055 21.0390 40.1055 Z M 32.9452 40.3867 C 36.8358 40.3867 39.3905 37.8789 39.3905 34.1055 C 39.3905 30.6602 37.0702 28.1992 33.7421 28.1992 C 32.3358 28.1992 30.8358 28.8320 30.1562 29.8867 L 30.5546 24.8242 L 37.5624 24.8242 C 38.2655 24.8242 38.8514 24.2617 38.8514 23.4649 C 38.8514 22.6680 38.2655 22.1524 37.5624 22.1524 L 30.0858 22.1524 C 28.8436 22.1524 28.1640 22.8555 28.0702 24.0976 L 27.5546 30.8476 C 27.4609 32.0195 28.0702 32.5820 29.1014 32.5820 C 29.8749 32.5820 30.2030 32.4414 30.8593 31.9258 C 31.7733 31.1055 32.4765 30.7773 33.4140 30.7773 C 35.2421 30.7773 36.4609 32.1133 36.4609 34.1524 C 36.4609 36.2149 35.0077 37.7149 33.0858 37.7149 C 31.6796 37.7149 30.5077 36.9180 29.8983 35.6992 C 29.5468 35.0898 29.1249 34.7617 28.5390 34.7617 C 27.7655 34.7617 27.2265 35.3242 27.2265 36.1211 C 27.2265 36.4492 27.2968 36.7539 27.4140 37.0586 C 28.0468 38.7461 30.1093 40.3867 32.9452 40.3867 Z"></path></g></svg>`,
  click: (event) => {
    art.currentTime = Math.min(art.duration, art.currentTime + 15);
    animateIcon(event.currentTarget);
  },
  style: {
    padding: "5px",
    transition: "transform 0.2s ease-in-out",
  },
});

// Animation function
function animateIcon(icon) {
  icon.style.transform = "scale(1.3)"; // Increase size
  setTimeout(() => {
    icon.style.transform = "scale(1)"; // Return to original size
  }, 200);
}

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
