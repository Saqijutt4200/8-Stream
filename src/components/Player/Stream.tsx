"use client";
import React, { useEffect, useState } from "react";
import Artplayer from "./ArtPlayer";
import { useAppDispatch, useAppSelector } from "@/lib/hook";
import { CgClose } from "react-icons/cg";
import { playEpisode, playMovie } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import { consumetPlay } from "@/lib/consumetApi";
import { toast } from "react-toastify";

interface LanguageSelectorItem {
  default?: boolean;
  html: string;
  value: string;
}

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
  const [artInstance, setArtInstance] = useState<any>(null);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<string>("");
  const [subtitles, setSubtitles] = useState<any[]>([]);
  const [urlHash, setUrlHash] = useState<string>("");

  const provider = useAppSelector((state) => state.options.api);

  // Get URL hash on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrlHash(window.location.hash);
    }
  }, []);

  // Handle streaming based on provider
  useEffect(() => {
    const fetchStream = async () => {
      try {
        if (provider === "8stream") {
          if (params.type === "movie") {
            const data = await playMovie(params.imdb, currentLanguage);
            handleStreamResponse(data);
          } else {
            const data = await playEpisode(
              params.imdb,
              parseInt(season || "1"),
              parseInt(episode || "1"),
              currentLanguage
            );
            handleStreamResponse(data);
          }
        } else {
          const data = await consumetPlay(
            params.id,
            params.type,
            parseInt(episode || "1"),
            parseInt(season || "1")
          );
          if (data?.success && data?.data?.sources?.length > 0) {
            setUrl(data.data.sources[data.data.sources.length - 1]?.url);
            setSubtitles(data.data.subtitles || []);
          } else {
            showErrorToast();
          }
        }
      } catch (error) {
        showErrorToast();
      }
    };

    const handleStreamResponse = (data: any) => {
      if (data?.success && data?.data?.link) {
        artInstance?.switchUrl(data.data.link);
        setUrl(data.data.link);
        setAvailableLanguages(data.availableLang || []);
        
        // Handle language selection from URL hash
        if (urlHash && data.availableLang?.length > 0) {
          const langIndex = parseInt(urlHash.replace("#", "")) - 1;
          if (!isNaN(langIndex) && langIndex >= 0 && langIndex < data.availableLang.length) {
            const selectedLang = data.availableLang[langIndex];
            if (selectedLang && selectedLang !== currentLanguage) {
              setCurrentLanguage(selectedLang);
            }
          }
        }
      } else {
        showErrorToast();
      }
    };

    const showErrorToast = () => {
      toast.error("No stream link found", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    };

    fetchStream();
  }, [currentLanguage, urlHash, params, season, episode, artInstance, provider]);

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black">
      <div className="h-[100%] w-[100%] rounded-lg" id="player-container">
        {url ? (
          <Artplayer
            artRef={(instance: any) => setArtInstance(instance)}
            sub={subtitles}
            style={{ width: "100%", height: "100%", aspectRatio: "16/9" }}
            option={{
              container: "#player-container",
              url: url,
              setting: true,
              theme: "#fcba03",
              controls: [
                {
                  name: "Language",
                  position: "right",
                  index: 10,
                  html: `<p>${currentLanguage || availableLanguages[0] || "Auto"}</p>`,
                  selector: availableLanguages.map((lang, index) => ({
                    default: index === 0 || lang === currentLanguage,
                    html: `<p>${lang}</p>`,
                    value: lang,
                  })),
                  onSelect: (item: LanguageSelectorItem) => {
                    setCurrentLanguage(item.value);
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
                  fontSize: "35px",
                  fontFamily: "sans-serif",
                  textShadow:
                    "-3px 3px 4px rgba(0, 0, 0, 1), 2px 2px 4px rgba(0, 0, 0, 1), 1px -1px 3px rgba(0, 0, 0, 1), -3px -2px 4px rgba(0, 0, 0, 1)",
                },
              },
              lock: true,
              fastForward: true,
              cssVar: {
                "--art-indicator-scale": "1.5",
                "--art-indicator-size": "15px",
                "--art-bottom-gap": "25px",
                "--art-control-icon-scale": "1.7",
                "--art-padding": "10px 30px",
                "--art-volume-handle-size": "20px",
                "--art-volume-height": "150px",
              },
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-white">Loading player...</div>
          </div>
        )}
      </div>

      <button
        className="absolute right-0 top-0 z-50 m-5 cursor-pointer"
        onClick={() => router.replace(`/watch/${params.type}/${params.id}`)}
        aria-label="Close player"
      >
        <CgClose className="text-4xl text-white" />
      </button>
    </div>
  );
};

export default Stream;
