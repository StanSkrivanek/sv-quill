
<script>

</script>

<div class="hero ">
  <div class="hero-content">
    <h1>Simply Notes</h1>
    <p class="tagline">Capture your thoughts, simply and beautifully</p>
    <p class="description">
      A minimalist note-taking app that lets you focus on what matters most - your ideas.
      No distractions, just pure writing pleasure.
    </p>
    <div class="cta-container">
      <a href="/notes/new" class="cta-button">Start Writing</a>
      <!-- {#if notesCount > 0}
        <a href="/notes" class="secondary-button">View My Notes ({notesCount})</a>
      {/if} -->
    </div>
  </div>

  <div class="hero-image">
    <svg viewBox="0 0 400 300" class="illustration">
      <!-- Notebook -->
      <rect x="100" y="50" width="200" height="250" rx="10" fill="rgba(234, 88, 12, 0.1)" />
      <rect x="120" y="70" width="160" height="20" rx="5" fill="rgba(234, 88, 12, 0.2)" />
      <rect x="120" y="100" width="160" height="10" rx="5" fill="rgba(234, 88, 12, 0.2)" />
      <rect x="120" y="120" width="120" height="10" rx="5" fill="rgba(234, 88, 12, 0.2)" />
      <rect x="120" y="140" width="140" height="10" rx="5" fill="rgba(234, 88, 12, 0.2)" />
      
      <!-- Pencil -->
      <g transform="rotate(-45, 280, 150)">
        <rect x="250" y="140" width="60" height="20" rx="2" fill="rgb(234, 88, 12)" />
        <polygon points="310,140 310,160 330,150" fill="rgba(234, 58, 12)" />
      </g>
      
      <!-- Decorative circles -->
      <circle cx="50" cy="50" r="20" fill="rgba(234, 88, 12)" opacity="0.2" />
      <circle cx="350" cy="250" r="30" fill="rgba(234, 88, 12)" opacity="0.2" />
      <circle cx="30" cy="200" r="15" fill="rgba(234, 88, 12)" opacity="0.2" />
    </svg>
  </div>
</div>

<div class="features">
  <div class="feature">
    <h3>🚀 Simple & Fast</h3>
    <p>No complicated setup. Just open and start writing.</p>
  </div>
  <div class="feature">
    <h3>✨ Rich Text Editor</h3>
    <p>Format your notes beautifully with our intuitive editor.</p>
  </div>
  <div class="feature">
    <h3>🔒 Safe & Private</h3>
    <p>Your notes are stored securely on your local machine.</p>
  </div>
</div>

<style>
  .hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    padding: 4rem 2rem;
    min-height: 50vh;
    gap: 4rem;
  }

  @media (max-width: 768px) {
    .hero {
      flex-direction: column;
      text-align: center;
      padding: 2rem;
    }
  }

  .hero-content {
    flex: 1;
  }

  h1 {
    font-size: 4rem;
    font-weight: 800;
    margin: 0;
    background: linear-gradient(45deg, rgb(234, 88, 12), rgb(246, 138, 80));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1.1;
  }

  .tagline {
    font-size: 1.5rem;
    color: #666;
    margin: 1rem 0;
  }

  .description {
    font-size: 1.1rem;
    color: #666;
    margin: 1.5rem 0;
    line-height: 1.6;
  }

  .hero-image {
    flex: 1;
    max-width: 500px;
  }

  .illustration {
    width: 100%;
    height: auto;
  }

  .cta-container {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }

  @media (max-width: 768px) {
    .cta-container {
      justify-content: center;
    }
  }

  .cta-button {
    background: rgb(234, 88, 12);
    color: white;
    padding: 1rem 2rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(234, 88, 12, 0.2);
  }

  .cta-button:hover {
    background: rgb(234, 88, 12);
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(234, 88, 12, 0.4);
  }

  .secondary-button {
    background: #f0f0f0;
    color: #666;
    padding: 1rem 2rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s ease;
  }

  .secondary-button:hover {
    background: #e0e0e0;
  }

  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 4rem 2rem;
    background: #f9f9f9;
    border-radius: 20px;
    margin-bottom: 4rem;
  }

  .feature {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 15px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    transition: transform 0.3s ease;
  }

  .feature:hover {
    transform: translateY(-5px);
  }

  .feature h3 {
    color: rgb(234, 88, 12);
    margin-bottom: 1rem;
  }

  .feature p {
    color: #666;
    line-height: 1.6;
  }
</style>