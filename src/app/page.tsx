export default function Page() {
  return (
    <main style={styles.container}>
      <h1 style={styles.heading}>🎬 Welcome to the Movie Database</h1>
      <p style={styles.description}>
        Explore a wide range of movies and TV shows with easy-to-use embed links.
      </p>

      <section style={styles.section}>
        <h2 style={styles.subheading}>📌 API Documentation</h2>
        <p>
          Detailed representation of the API endpoints for <strong>Vidsrc</strong> includes comprehensive information regarding the available methods, request formats, required parameters, and optional parameters.
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.subheading}>🎥 Movie Embed URL</h2>
        <p>
          <strong>Endpoint:</strong> <code>/movie/{'{id}'}</code>
        </p>
        <p>
          <strong>Valid Parameters:</strong>
          <ul>
            <li>
              <code>{'{id}'}</code> (required) - IMDB or TMDB ID, must have <code>tt</code> prefix for IMDB.
            </li>
          </ul>
        </p>
        <p><strong>Examples:</strong></p>
        <ul>
          <li>
            <a href="https://embed.vidsrc.pk/movie/tt12037194" target="_blank">
              https://embed.vidsrc.pk/movie/tt12037194
            </a>
          </li>
          <li>
            <a href="https://embed.vidsrc.pk/movie/1294203" target="_blank">
              https://embed.vidsrc.pk/movie/1294203
            </a>
          </li>
        </ul>
      </section>

      <section style={styles.section}>
        <h2 style={styles.subheading}>📺 TV Shows Episode Embed URL</h2>
        <p>
          <strong>Endpoint:</strong> <code>/tv/{'{id}'}/{'{season}-{episode}'}</code>
        </p>
        <p>
          <strong>Valid Parameters:</strong>
          <ul>
            <li>
              <code>{'{id}'}</code> (required) - IMDB or TMDB ID, must have <code>tt</code> prefix for IMDB.
            </li>
            <li>
              <code>{'{season}'}</code> (required) - The season number.
            </li>
            <li>
              <code>{'{episode}'}</code> (required) - The episode number.
            </li>
          </ul>
        </p>
        <p><strong>Examples:</strong></p>
        <ul>
          <li>
            <a href="https://embed.vidsrc.pk/tv/tt3581920/1-5" target="_blank">
              https://embed.vidsrc.pk/tv/tt3581920/1-5
            </a>
          </li>
          <li>
            <a href="https://embed.vidsrc.pk/tv/202555/1-5" target="_blank">
              https://embed.vidsrc.pk/tv/202555/1-5
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}

const styles = {
  container: {
    fontFamily: "'Arial', sans-serif",
    maxWidth: "800px",
    margin: "auto",
    padding: "20px",
    lineHeight: "1.6",
  },
  heading: {
    textAlign: "center",
    color: "#ff5733",
  },
  description: {
    textAlign: "center",
    fontSize: "18px",
    color: "#555",
  },
  section: {
    background: "#f9f9f9",
    padding: "15px",
    margin: "20px 0",
    borderRadius: "8px",
  },
  subheading: {
    color: "#2c3e50",
  },
};
