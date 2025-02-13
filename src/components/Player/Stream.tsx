"use client";
import React, { useEffect, useState } from "react";
import Artplayer from "./ArtPlayer";
import { useAppDispatch, useAppSelector } from "@/lib/hook";
import { CgClose } from "react-icons/cg";
import { playEpisode, playMovie } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import { consumetPlay } from "@/lib/consumetApi";
import { toast } from "react-toastify";

const Stream = ({
  params,
}: {
  params: { imdb: string; type: string; id: string };
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const season = searchParams.get("season");
  const episode = searchParams.get("episode");
  const dispatch = useAppDispatch();
  const [url, setUrl] = useState<string>("");
  const ref = React.useRef<any>();
  const [art, setArt] = useState<any>();
  const [availableLang, setAvailableLang] = useState<any>([""]);
  const [currentLang, setCurrentLang] = useState<any>("");
  const [sub, setSub] = useState<any>([]);

  const provider = useAppSelector((state) => state.options.api);

  useEffect(() => {
    async function get8Stream() {
      if (params.type === "movie") {
        const data = await playMovie(params.imdb, currentLang);
        if (data?.success && data?.data?.link?.length > 0) {
          art?.switchUrl(data?.data?.link);
          setUrl(data?.data?.link);
          setAvailableLang(data?.availableLang);
        } else {
          toast.error("No link found", {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        }
      } else {
        const data = await playEpisode(
          params.imdb,
          parseInt(season as string),
          parseInt(episode as string),
          currentLang
        );
        if (data?.success && data?.data?.link?.length > 0) {
          setUrl(data?.data?.link);
          setAvailableLang(data?.availableLang);
          art?.switchUrl(data?.data?.link);
        } else {
          toast.error("No link found", {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        }
      }
    }
    async function getConsumet() {
      const data = await consumetPlay(
        params.id,
        params.type,
        parseInt(episode as string),
        parseInt(season as string)
      );
      if (data?.success && data?.data?.sources?.length > 0) {
        setUrl(data?.data?.sources[data?.data?.sources.length - 1]?.url);
        setSub(data?.data?.subtitles);
      } else {
        toast.error("No link found", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    }
    if (provider === "8stream") {
      get8Stream();
    } else {
      getConsumet();
    }
  }, [currentLang]);

  // Function to move the player backward by 15 seconds
  const handleBackward = () => {
    if (art) {
      const currentTime = art.currentTime;
      art.seek(currentTime - 15);
    }
  };

  // Function to move the player forward by 15 seconds
  const handleForward = () => {
    if (art) {
      const currentTime = art.currentTime;
      art.seek(currentTime + 15);
    }
  };

  return (
    <div className="fixed bg-black inset-0 flex justify-center items-end z-[200]">
      <div className="w-[100%] h-[100%] rounded-lg" id="player-container">
        {url?.length > 0 ? (
          <Artplayer
            artRef={ref}
            sub={sub}
            style={{ width: "100%", height: "100%", aspectRatio: "16/9" }}
            option={{
              container: "#player-container",
              url: url,
              setting: true,
              theme: "#fcba03",
              controls: [
                {
                  name: "Lang",
                  position: "right",
                  index: 10,
                  html: `<p >${availableLang[0]}</p>`,
                  selector: [
                    ...availableLang.map((item: any, i: number) => {
                      return {
                        default: i === 0,
                        html: `<p ">${item}</p>`,
                        value: item,
                      };
                    }),
                  ],
                  onSelect: function (item, $dom) {
                    setCurrentLang(item.value);
                    return item.html;
                  },
                },
              ],
              playbackRate: true,
              fullscreen: true,
              subtitleOffset: true,
              subtitle: {
                type: "vtt",
                escape: false,
                style: {
                  color: "#fff",
                  "font-size": "35px",
                  "font-family": "sans-serif",
                  "text-shadow":
                    "-3px 3px 4px rgba(0, 0, 0, 1),2px 2px 4px rgba(0, 0, 0, 1),1px -1px 3px rgba(0, 0, 0, 1),-3px -2px 4px rgba(0, 0, 0, 1)",
                },
              },
              lock: true,
              fastForward: true,
              cssVar: {
                "--art-indicator-scale": 1.5,
                "--art-indicator-size": "15px",
                "--art-bottom-gap": "25px",
                "--art-control-icon-scale": 1.7,
                "--art-padding": "10px 30px",
                "--art-volume-handle-size": "20px",
                "--art-volume-height": "150px",
              },
            }}
            getInstance={(art: any) => {
              setArt(art);
            }}
          />
        ) : (
          <div className="flex justify-center items-center h-full">
            <span className="loader"></span>
          </div>
        )}
        {/* Controls for 15-second forward and backward */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-4">
          <button
            onClick={handleBackward}
            className="bg-gray-700 p-2 rounded-full text-white hover:bg-gray-600"
          >
            -15s
          </button>
          <button
            onClick={handleForward}
            className="bg-gray-700 p-2 rounded-full text-white hover:bg-gray-600"
          >
            +15s
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stream;
