import { useEffect, useState, useCallback } from "react";
import Artplayer from "artplayer";
import { type Option } from "artplayer/types/option";
import { type Component } from "artplayer/types/component";
import artplayerPluginHlsQuality from "artplayer-plugin-hls-quality";
import Hls from "hls.js";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

// Types
interface HLSLevel {
  height: number;
  width: number;
  bitrate: number;
  url: string;
  index?: number;
}

interface QualityLevel {
  height: number;
  html: string;
}

interface SandboxResult {
  isSandboxed: boolean;
  reason?: string;
}

declare global {
  interface Document {
    sandbox?: DOMTokenList;
  }
  interface Window {
    controlsTimeout?: NodeJS.Timeout;
  }
}

// Utility Functions
const detectSandbox = (): SandboxResult => {
  try {
    if (window !== window.parent) {
      const currentFrame = window.frameElement as HTMLIFrameElement | null;
      
      if (currentFrame) {
        if (!currentFrame.hasAttribute('sandbox')) {
          console.log('No sandbox attribute - allowing video');
          return { isSandboxed: false };
        }
        
        const sandboxValue = currentFrame.getAttribute('sandbox') || '';
        const permissions = sandboxValue.split(' ');
        
        if (permissions.length === 1 && permissions.includes('allow-scripts')) {
          return { 
            isSandboxed: true, 
            reason: "Insufficient permissions. Video requires 'allow-same-origin' in addition to 'allow-scripts'."
          };
        }
        
        if (permissions.length === 2 && 
            permissions.includes('allow-scripts') && 
            permissions.includes('allow-same-origin')) {
          return { 
            isSandboxed: true, 
            reason: "Video requires 'allow-presentation' in addition to current permissions."
          };
        }
        
        if (permissions.length === 3 && 
            permissions.includes('allow-scripts') && 
            permissions.includes('allow-same-origin') && 
            permissions.includes('allow-presentation')) {
          return { 
            isSandboxed: true, 
            reason: "Video playback is restricted in sandbox mode with current permissions."
          };
        }
        
        return { 
          isSandboxed: true, 
          reason: `Unsupported sandbox configuration: ${sandboxValue}`
        };
      }
      
      try {
        window.parent.location.href;
        return { isSandboxed: false };
      } catch (e) {
        return { 
          isSandboxed: true, 
          reason: "Cross-origin iframe access is restricted."
        };
      }
    }
    
    return { isSandboxed: false };
  } catch (error) {
    console.error('Sandbox detection error:', error);
    return { isSandboxed: false };
  }
};

export default function Player({
  option,
  getInstance,
  artRef,
  sub,
  availableLang = [],
  onLanguageChange,
  ...rest
}: {
  option: Option;
  getInstance?: (art: Artplayer) => void;
  artRef: any;
  sub?: any;
  availableLang?: string[];
  onLanguageChange?: (lang: string) => void;
  [key: string]: any;
}) {
  const posterUrl = useSelector((state: RootState) => state.posterUrl.currentPosterUrl);
  const [sandboxResult, setSandboxResult] = useState<SandboxResult>({ isSandboxed: false });
  const [showControls, setShowControls] = useState(false);

  // Initialize styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .art-video-player .art-progress .art-progress-bar {
        height: 4px !important;
      }
      /* ... rest of your styles ... */
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Sandbox detection
  useEffect(() => {
    const result = detectSandbox();
    setSandboxResult(result);
    console.log(`Sandbox detection result:`, result);
  }, []);

  // Initialize ArtPlayer
  useEffect(() => {
    if (sandboxResult.isSandboxed || !artRef.current) return;

    const container = artRef.current;
    const storedImageUrl = localStorage.getItem("currentPosterUrl");

    if (!(container instanceof Element)) {
      console.error("Invalid container element for ArtPlayer");
      return;
    }

    const art = new Artplayer({
      ...option,
      container,
      settings: [
        {
          html: "Quality",
          tooltip: "Quality",
          name: "quality",
          selector: [
            {
              html: "480P",
              default: true,
              value: "480p",
            },
            {
              html: "720P",
              value: "720p",
            },
            {
              html: "1080P",
              value: "1080p",
            },
          ],
          onSelect: function (item) {
            const levels = art.hls?.levels;
            if (!levels || levels.length === 0) return item.html;

            const selectedLevel = levels.reduce(
              (prev: HLSLevel, curr: HLSLevel, index: number) => {
                const prevDiff = Math.abs(prev.height - parseInt(item.value));
                const currDiff = Math.abs(curr.height - parseInt(item.value));
                return currDiff < prevDiff ? { ...curr, index } : prev;
              },
              { ...levels[0], index: 0 }
            );

            if (art.hls) {
              art.hls.currentLevel = selectedLevel.index;
            }
            return item.html;
          },
        },
      ],
      // ... rest of your ArtPlayer configuration ...
    });

    // Set up event listeners
    setupEventListeners(art);
    setupHLSCustomType(art);
    setupControls(art, sub);

    if (getInstance && typeof getInstance === "function") {
      getInstance(art);
    }

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
        art.hls?.destroy();
      }
    };
  }, [artRef.current, sandboxResult.isSandboxed, option, getInstance, sub]);

  if (sandboxResult.isSandboxed) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/95 z-50">
        <div className="bg-red-600/20 border-2 border-red-600 rounded-lg p-8 max-w-xl mx-4">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="text-red-500 text-5xl">⚠️</div>
            <h2 className="text-2xl font-bold text-white">
              Sandbox Mode Detected
            </h2>
            <p className="text-gray-300">
              {sandboxResult.reason || "This video player cannot be embedded in sandbox mode for security reasons."}
            </p>
            <div className="text-sm text-gray-400 mt-4">
              Error Code: SANDBOX_RESTRICTED
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div ref={artRef} className="w-full h-full" {...rest}></div>;
}