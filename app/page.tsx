import Link from "next/link";

export default function Home() {
  return (
    <main className="marketing-page dashboard-dark-theme" data-theme="dark">
      <div className="hero-glow" />
      <header className="site-header">
        <Link className="brand" href="/">
          <span className="brand-mark">M</span>
          MindCare
        </Link>
        <nav className="site-nav">
          <Link href="/login">Log In</Link>
          <Link className="primary-pill" href="/register">
            Create Account
          </Link>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow">Mental wellness, designed with care</div>
          <h1 className="hero-title">
            Build calmer routines and clearer emotional insight.
          </h1>
          <p className="hero-text">
            MindCare helps you check in, track patterns, and turn small daily moments into a more
            grounded mental health practice.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/register">
              Start Free
            </Link>
            <Link className="secondary-button" href="/login">
              I already have an account
            </Link>
          </div>
          <div className="stat-row">
            <div>
              <strong>Daily mood logs</strong>
              <span>Capture how you feel in seconds</span>
            </div>
            <div>
              <strong>Pattern awareness</strong>
              <span>Spot trends before burnout builds</span>
            </div>
          </div>
        </div>

        <div className="hero-panel">
          <div className="panel-card">
            <div className="panel-topline">Today&apos;s calm plan</div>
            <h2>Small habits, visible progress.</h2>
            <div className="metric-stack">
              <div className="metric-card">
                <span>Wellness score</span>
                <strong>72</strong>
                <small>Steady improvement this week</small>
              </div>
              <div className="metric-card">
                <span>Mood streak</span>
                <strong>6 days</strong>
                <small>Consistent daily check-ins</small>
              </div>
            </div>
            <div className="note-card">
              <span className="note-badge">Suggested reset</span>
              <p>
                Your evenings look heavier than usual. Try a guided breathing session before bed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-section">
        <article className="feature-card">
          <div className="feature-icon">🧠</div>
          <h3>Assess with clarity</h3>
          <p>Structured mental health assessments that turn reflection into useful signal.</p>
        </article>
        <article className="feature-card">
          <div className="feature-icon">🌿</div>
          <h3>Stay grounded daily</h3>
          <p>Journal, track habits, and build routines that support your real life rhythm.</p>
        </article>
        <article className="feature-card">
          <div className="feature-icon">📈</div>
          <h3>See your patterns</h3>
          <p>Understand changes over time so your next step feels informed, not random.</p>
        </article>
      </section>
    </main>
  );
}
