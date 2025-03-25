"use client";
import React, { useState } from "react";

export default function Page() {
  return (
    <main style={containerStyle}>
      <h1 style={headingStyle}>Movie & TV Show API Documentation</h1>
      <p style={descriptionStyle}>
        Easily embed movies and TV shows using our Vidsrc API. Follow the guide below for details.
      </p>

      {/* API Sections */}
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

      {/* FAQ Section */}
      <FAQSection />
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
          {copied ? <CheckIcon /> : <CopyIcon />}
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

// FAQ Section Component
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    { question: "Are your links protected from DMCA?", answer: "Our links are secure and protected, ensuring that they are not subject to removal due to DMCA notices." },
    { question: "Are subtitles available for all movies and TV shows?", answer: "We source subtitles from various websites, ensuring we have a wide selection available for almost every title." },
    { question: "How do I utilize your API?", answer: "Using our API requires basic programming knowledge. However, if you require any assistance, feel free to contact our support team." },
    { question: "What should I do if I come across incorrect movies or TV shows?", answer: "If you notice any inaccuracies, please use the report button on the player. Our team will promptly address and rectify the issue." },
    { question: "Is it possible to change the video quality?", answer: "Yes! The player has a range of quality options." },
    { question: "Do you offer movies and TV shows in languages other than English?", answer: "While our server primarily caters to English-speaking audiences, we host a vast collection of global movies in their original language. However, most of our videos have subtitles included." },
    { question: "Can I use this API for anime?", answer: "Currently, we do not support anime, but we may do so in the future." },
  ];

  return (
    <section style={faqSectionStyle}>
      <h2 style={subheadingStyle}>Frequently Asked Questions</h2>
      <p>Contact us if you have any more questions.</p>

      {faqs.map((faq, index) => (
        <div key={index} style={faqItemStyle}>
          <button onClick={() => toggleFAQ(index)} style={faqButtonStyle}>
            {faq.question}
          </button>
          {openIndex === index && <p style={faqAnswerStyle}>{faq.answer}</p>}
        </div>
      ))}
    </section>
  );
}

// SVG Icons
const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"></path>
  </svg>
);

// Styles
const faqSectionStyle: React.CSSProperties = { background: "#1e1e1e", padding: "20px", borderRadius: "8px", marginTop: "20px" };
const faqItemStyle: React.CSSProperties = { borderBottom: "1px solid #444", padding: "10px 0" };
const faqButtonStyle: React.CSSProperties = { background: "none", color: "#ff9800", border: "none", fontSize: "16px", cursor: "pointer" };
const faqAnswerStyle: React.CSSProperties = { color: "#bbb", padding: "5px 0" };

const containerStyle: React.CSSProperties = { fontFamily: "Arial, sans-serif", maxWidth: "900px", margin: "auto", padding: "20px", backgroundColor: "#121212", color: "#e0e0e0" };

const subheadingStyle: React.CSSProperties = { color: "#ff9800" };
const linkStyle: React.CSSProperties = { color: "#64b5f6", textDecoration: "none" };
