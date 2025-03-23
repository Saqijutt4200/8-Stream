<div class="api-docs">
    <h2>API Documentation</h2>
    <p>Detailed representation of the API endpoints for Vidsrc includes comprehensive information regarding the available methods, request formats, required parameters and optional parameters.</p>

    <!-- Movie Embed URL Section -->
    <section class="endpoint">
        <h3>Movie Embed URL</h3>
        <div class="details">
            <p><strong>Endpoint</strong></p>
            <code>/movie/{id}</code>
            <p><strong>Valid parameters:</strong></p>
            <ul>
                <li><code>{id}</code> <span style="color: red;">(required)</span> - from <strong>imdb.com</strong> or <strong>themoviedb.com</strong>, imdb id must have <strong>tt</strong> prefix.</li>
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
            <p><strong>Valid parameters:</strong></p>
            <ul>
                <li><code>{id}</code> <span style="color: red;">(required)</span> - from <strong>imdb.com</strong> or <strong>themoviedb.com</strong>, imdb id must have <strong>tt</strong> prefix.</li>
                <li><code>{season}</code> <span style="color: red;">(required)</span> - the season number.</li>
                <li><code>{episode}</code> <span style="color: red;">(required)</span> - the episode number.</li>
            </ul>
            <p><strong>Examples</strong></p>
            <code>https://embed.vidsrc.pk/tv/tt3581920/1-5</code><br>
            <code>https://embed.vidsrc.pk/tv/202555/1-5</code>
        </div>
    </section>
</div>

<style>
/* General Styles */
.api-docs {
    max-width: 800px;
    margin: 50px auto;
    padding: 20px;
    background-color: #0c1824;
    color: white;
}

.api-docs h2 {
    text-align: center;
}

.endpoint {
    margin-bottom: 10px;
    padding: 10px;
    background-color: #112437;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
}

.endpoint h3 {
    font-size: 1.2rem;
    color: #fcba03;
    position: relative;
    padding-right: 20px;
}

.endpoint h3::after {
    content: "+";
    font-size: 1.5rem;
    font-weight: bold;
    color: #fcba03;
    position: absolute;
    right: 10px;
}

.endpoint.active h3::after {
    content: "−";
}

.details {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-out, padding 0.3s ease-out;
}

.endpoint.active .details {
    max-height: 500px; /* Adjust this based on content */
    padding: 10px 0;
}

/* Code Styling */
code {
    display: block;
    background-color: black;
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-family: monospace;
    overflow-x: auto;
}
</style>

<script>
document.querySelectorAll('.endpoint h3').forEach(header => {
    header.addEventListener('click', () => {
        const endpoint = header.parentElement;
        endpoint.classList.toggle('active');
    });
});
</script>
  
