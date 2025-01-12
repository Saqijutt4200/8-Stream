import { Suspense } from "react";
import Stream from "@/components/Player/Stream";

interface PageProps {
  params: {
    type: string;    // 'movie' or 'tv'
    imdb: string;    // IMDB ID
    id?: string;     // Additional ID if needed
    seasonEpisode?: string; 
  }
}

const Page = async ({ params }: PageProps) => {

  const streamParams = {
    type: params.type,
    imdb: params.imdb,
    id: params.id || params.imdb, // Use imdb as id if not provided
    seasonEpisode: params.seasonEpisode
  };
  // Log the params to help with debugging
  console.log("Page received params:", params);

  return (
    <div className="w-full h-full">
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"/>
      </div>}>
        <Stream params={streamParams} />
      </Suspense>
    </div>
  );
};

export default Page;