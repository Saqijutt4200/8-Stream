export default function Page() {
  return (
    <main>
      <h1>Welcome to the Movie Database</h1>
      <p>This is a simple text-based page without any API connections.</p>
            <h3>Movie Embed URL</h3>
                <p><strong>Endpoint</strong></p>
                <code>/movie/{id}</code>
                <p><strong><i class="fa-solid fa-circle-check"></i> Valid parameters:</strong></p>
                <ul>
                    <li><code>{id}</code>
                    <i class="fa-solid fa-circle-exclamation"></i> 
<span style="color: red;">required</span> - from 
<strong style="color: #fcba03;">imdb.com</strong> or 
<strong style="color: #5f9afa;">themoviedb.com</strong>, 
imdb id must have <strong style="color: #fcba03;">tt </strong>prefix
.</li>
                </ul>
                <p><strong>Examples</strong></p>
                <code>https://embed.vidsrc.pk/movie/tt12037194</code><br>
                <code>https://embed.vidsrc.pk/movie/1294203</code>
            </div>
        </section>

        <!-- TV Shows Episode Embed URL Section -->
        <section class="endpoint">
            <h3>TV Shows Episode Embed URL</h3>
            <div class="details">
                <p><strong>Endpoint</strong></p>
                <code>/tv/{id}/{season}-{episode}</code>
                <p><strong> <i class="fa-solid fa-circle-check"></i>Valid parameters:</strong></p>
                <ul>
                    <li><code>{id}</code> 
                    <i class="fa-solid fa-circle-exclamation"></i> 
<span style="color: red;">required</span> - from 
<strong style="color: #fcba03;">imdb.com</strong> or 
<strong style="color: #5f9afa;">themoviedb.com</strong>, 
imdb id must have <strong style="color: #fcba03;">tt </strong>prefix
.</li>
                    <li><code>{season}</code> <i class="fa-solid fa-circle-exclamation"></i> <span style="color: red;">required</span> - the season number.</li>
                    <li><code>{episode}</code> <i class="fa-solid fa-circle-exclamation"></i> <span style="color: red;">required</span> - the episode number.</li>
                </ul>
                <p><strong>Examples</strong></p>
                <code>https://embed.vidsrc.pk/tv/tt3581920/1-5</code><br>
                <code>https://embed.vidsrc.pk/tv/202555/1-5</code>
        </main>
  );
}
