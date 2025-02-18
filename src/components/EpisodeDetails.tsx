// components/EpisodeDetails.tsx
"use client";

import Image from "next/image";
import { FaStar, FaCalendarAlt } from "react-icons/fa";

interface EpisodeDetailsProps {
  episodeInfo: {
    name: string;
    overview: string;
    still_path: string;
    air_date: string;
    vote_average: number;
    season_number: number;
    episode_number: number;
    imdbId: string;
  };
}

const EpisodeDetails = ({ episodeInfo }: EpisodeDetailsProps) => {
  if (!episodeInfo) {
    return <div>Loading episode information...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Episode image */}
      <div className="relative w-full lg:w-2/3 h-[300px] lg:h-[400px]">
        <Image
          src={`https://image.tmdb.org/t/p/original${episodeInfo.still_path}`}
          alt={episodeInfo.name}
          fill
          className="object-cover rounded-lg"
          unoptimized={true}
        />
      </div>
      
      {/* Episode information */}
      <div className="w-full lg:w-1/3 flex flex-col">
        <h1 className="text-3xl font-bold text-white mb-2">
          {episodeInfo.name}
        </h1>
        
        <div className="flex items-center gap-3 mb-4">
          <p className="text-gray-300 flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            {episodeInfo.vote_average.toFixed(1)}
          </p>
          <p className="text-gray-300 flex items-center">
            <FaCalendarAlt className="text-blue-400 mr-1" />
            {new Date(episodeInfo.air_date).toLocaleDateString()}
          </p>
          <p className="text-gray-300">
            S{episodeInfo.season_number} E{episodeInfo.episode_number}
          </p>
        </div>
        
        <p className="text-gray-200 mb-6">
          {episodeInfo.overview}
        </p>
      </div>
    </div>
  );
};

export default EpisodeDetails;