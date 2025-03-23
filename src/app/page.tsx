import Catalogue from "@/components/Home/Catalogue";
import Hero from "@/components/Home/Hero";
import type { Metadata } from "next";

export default function Page() {
  const hero = {
    title: "Welcome to the Movie Catalogue",
    description: "This is a static page with no API connections.",
    backdrop_path: "/static_image.jpg", // Replace with a static image URL if needed
  };

  const data = {
    tendingMovies: { results: [] },
    tendingTV: { results: [] },
    DiscoverBollywoodMovies: { results: [] },
    DiscoverTv: { results: [] },
  };

  return (
    <main>
      <Hero hero={hero} />
      <Catalogue data={data} />
      <section>
        <h2>API Documentation</h2>
        <p>
          This page does not fetch any data from external sources. All content here is static.
        </p>
      </section>
    </main>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "Movie Catalogue - API Documentation",
    description: "A static page displaying movie categories without any API calls.",
  };
}
