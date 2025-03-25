"use client";
import React, { useState } from "react";

export default function Page() {
  return (
    <main style={containerStyle}>
      <h1 style={headingStyle}>Movie & TV Show API Documentation</h1>
      <p style={descriptionStyle}>
        Easily embed movies and TV shows using our Vidsrc API. Follow the guide below for details.
      </p>

      {/* Movie Embed API */}
      <APISection
        title="Movie Embed API"
        endpoint="/movie/{id}"
        description="Retrieve an embedded movie player by providing the movie ID from IMDB or TMDB."
        parameters={[
          { name: "id", required: true, description: "Movie ID from IMDB or TMDB (IMDB must have 'tt' prefix)." },
        ]}
        examples={[
          "https://embed.vidsrc.pk/movie/tt12037194",
          "https://embed.vidsrc.pk/movie/1294203",
        ]}
      />

      {/* TV Show Embed API */}
      <APISection
        title="TV Show Episode Embed API"
        endpoint="/tv/{id}/{season}-{episode}"
        description="Retrieve an embedded TV show player by providing the show ID, season, and episode."
        parameters={[
          { name: "id", required: true, description: "TV show ID from IMDB or TMDB (IMDB must have 'tt' prefix)." },
          { name: "season", required: true, description: "Season number of the TV show." },
          { name: "episode", required: true, description: "Episode number of the season." },
        ]}
        examples={[
          "https://embed.vidsrc.pk/tv/tt3581920/1-5",
          "https://embed.vidsrc.pk/tv/202555/1-5",
        ]}
      />
    </main>
  );
}

// API Section Component
function APISection({
  title,
  endpoint,
  description,
  parameters,
  examples,
}: {
  title: string;
  endpoint: string;
  description: string;
  parameters: { name: string; required: boolean; description: string }[];
  examples: string[];
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(endpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <section style={sectionStyle}>
      <h2 style={subheadingStyle}>{title}</h2>
      <p>{description}</p>

      <div style={apiBoxStyle}>
        <code style={codeStyle}>{endpoint}</code>
        <button onClick={handleCopy} style={copyButtonStyle}>
          {copied ? (
            <CheckIcon />
          ) : (
            <CopyIcon />
          )}
        </button>
      </div>

      <h3>Parameters:</h3>
      <ul>
        {parameters.map((param) => (
          <li key={param.name}>
            <strong>{param.name}</strong> ({param.required ? "Required" : "Optional"}): {param.description}
          </li>
        ))}
      </ul>

      <h3>Example URLs:</h3>
      <ul>
        {examples.map((example, index) => (
          <li key={index}>
            <a href={example} target="_blank" rel="noopener noreferrer" style={linkStyle}>
              {example}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

// SVG Copy Icon
const CopyIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
  </svg>
);

// SVG Check Icon
const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="green"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6L9 17l-5-5"></path>
  </svg>
);

// Styles
const containerStyle: React.CSSProperties = {
  fontFamily: "'Arial', sans-serif",
  maxWidth: "900px",
  margin: "auto",
  padding: "20px",
  lineHeight: "1.6",
  backgroundColor: "#121212",
  color: "#e0e0e0",
};

const headingStyle: React.CSSProperties = {
  textAlign: "center" as const,
  color: "#ff5733",
};

const descriptionStyle: React.CSSProperties = {
  textAlign: "center" as const,
  fontSize: "18px",
  color: "#bbb",
};

const sectionStyle: React.CSSProperties = {
  background: "#1e1e1e",
  padding: "20px",
  margin: "20px 0",
  borderRadius: "8px",
  boxShadow: "0px 2px 5px rgba(255, 255, 255, 0.1)",
};

const subheadingStyle: React.CSSProperties = {
  color: "#ff9800",
};

const apiBoxStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  background: "#333",
  padding: "10px",
  borderRadius: "5px",
  justifyContent: "space-between",
};

const codeStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "16px",
  color: "#eee",
};

const copyButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
};

const linkStyle: React.CSSProperties = {
  color: "#64b5f6",
  textDecoration: "none",
};
