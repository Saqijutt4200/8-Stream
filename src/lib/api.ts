"use server";

// ----------------- TMDB -----------------//

// Episodes list by season (filtered for English)
export async function getEpisodes(id: string, season: number) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=${process.env.TMDB_KEY}`
    );
    const data = await response.json();
    // Filter episodes for English language
    const englishEpisodes = data.episodes.filter(
      (episode: any) => episode.original_language === "en"
    );
    return englishEpisodes;
  } catch (error) {
    console.log(error);
  }
}

// Search (filtered for English)
export async function search(query: string) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${process.env.TMDB_KEY}&query=${query}&include_adult=true&language=en-US&page=1`
    );
    const data = await response.json();
    // Filter results for English language and media type
    const filteredData = data.results.filter(
      (item: any) =>
        (item.media_type === "tv" || item.media_type === "movie") &&
        item.original_language === "en"
    );
    return filteredData;
  } catch (error) {
    console.log(error);
  }
}

// ----------------- 8stream -----------------//

// Get stream URL (no changes needed here)
export async function getStreamUrl(file: string, key: string) {
  try {
    const response = await fetch(`${process.env.STREAM_API}/getStream`, {
      cache: "no-cache",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file,
        key,
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}

// Get media info (no changes needed here)
export async function getMediaInfo(id: string) {
  try {
    const response = await fetch(
      `${process.env.STREAM_API}/mediaInfo?id=${id}`,
      { cache: "no-cache" }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}

// Play movie (filtered for English)
export async function playMovie(id: string, lang: string = "en") {
  try {
    const mediaInfo = await getMediaInfo(id);
    if (mediaInfo?.success) {
      const playlist = mediaInfo?.data?.playlist;
      // Find English language file
      let file = playlist.find((item: any) => item?.title === lang);
      if (!file) {
        file = playlist.find((item: any) => item?.title === "en"); // Fallback to English
      }
      if (!file) {
        return { success: false, error: "No English file found" };
      }
      const availableLang = playlist.map((item: any) => item?.title);
      const key = mediaInfo?.data?.key;
      const streamUrl = await getStreamUrl(file?.file, key);
      if (streamUrl?.success) {
        return { success: true, data: streamUrl?.data, availableLang };
      } else {
        return { success: false, error: "No stream URL found" };
      }
    } else {
      return { success: false, error: "No media info found" };
    }
  } catch (error) {
    console.log(error);
    return { success: false, error };
  }
}

// Play episode (filtered for English)
export async function playEpisode(
  id: string,
  season: number,
  episode: number,
  lang: string = "en"
) {
  try {
    const mediaInfo = await getMediaInfo(id);
    if (!mediaInfo?.success) {
      return { success: false, error: "No media info found" };
    }
    const playlist = mediaInfo?.data?.playlist;
    const getSeason = playlist.find(
      (item: any) => item?.id === season.toString()
    );
    if (!getSeason) {
      return { success: false, error: "No season found" };
    }
    const getEpisode = getSeason?.folder.find(
      (item: any) => item?.episode === episode.toString()
    );
    if (!getEpisode) {
      return { success: false, error: "No episode found" };
    }
    // Find English language file
    let file = getEpisode?.folder.find((item: any) => item?.title === lang);
    if (!file) {
      file = getEpisode?.folder.find((item: any) => item?.title === "en"); // Fallback to English
    }
    if (!file) {
      return { success: false, error: "No English file found" };
    }
    const availableLang = getEpisode?.folder.map((item: any) => item?.title);
    const filterLang = availableLang.filter((item: any) => item?.length > 0);
    const key = mediaInfo?.data?.key;
    const streamUrl = await getStreamUrl(file?.file, key);
    if (streamUrl?.success) {
      return {
        success: true,
        data: streamUrl?.data,
        availableLang: filterLang,
      };
    } else {
      return { success: false, error: "No stream URL found" };
    }
  } catch (error) {
    console.log(error);
    return { success: false, error };
  }
}

// Get season and episode list (no changes needed here)
export async function getSeasonList(id: string) {
  try {
    const response = await fetch(
      `${process.env.STREAM_API}/getSeasonList?id=${id}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
                               }
