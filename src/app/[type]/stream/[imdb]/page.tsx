import { Suspense } from "react";
import Stream from "@/components/Player/Stream";

interface PageProps {
  params: {
    imdb: string;  // This matches your [imdb] dynamic route segment
  }
}

const Page = async ({ params }: PageProps) => {
  // Log the params to help with debugging
  console.log("Page received params:", params);

  return (
    <div className="w-full h-full">
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"/>
      </div>}>
        <Stream params={params} />
      </Suspense>
    </div>
  );
};

export default Page;