import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/dashboard");
  }

  return (
    <main className="auth-page dashboard-dark-theme" data-theme="dark">
      <div className="auth-glow" />
      <section className="auth-shell">
        <section className="auth-stage">
          <header className="auth-stage-topbar">
            <Link className="brand" href="/">
              <span className="brand-mark">M</span>
              MindCare
            </Link>
            <nav className="auth-stage-nav">
              <Link href="/">Home</Link>
              <Link href="/register">Create account</Link>
            </nav>
          </header>

          <div className="auth-hero-grid">
            <div className="auth-hero-copy">
              <div className="eyebrow">Member access</div>
              <h1>Step back into your dashboard with yesterday&apos;s momentum intact.</h1>
              <p>
                Resume mood tracking, revisit your latest reflection, and keep your wellness rhythm
                moving without friction.
              </p>
            </div>

            <div className="auth-preview-card">
              <div className="auth-preview-head">
                <span className="auth-preview-title">Today&apos;s overview</span>
                <span className="auth-preview-pill">Live snapshot</span>
              </div>

              <div className="auth-preview-metrics">
                <article>
                  <strong>72</strong>
                  <span>Wellness score</span>
                </article>
                <article>
                  <strong>6</strong>
                  <span>Day check-in streak</span>
                </article>
                <article>
                  <strong>18m</strong>
                  <span>Calm practice total</span>
                </article>
              </div>

              <div className="auth-preview-panel">
                <div>
                  <span className="auth-preview-label">Suggested focus</span>
                  <strong>Breathing reset before bed</strong>
                </div>
                <span className="auth-preview-trend positive">Improving</span>
              </div>
            </div>
          </div>

          <div className="auth-benefit-grid">
            <article>
              <strong>Private by default</strong>
              <span>Your reflections and assessment history remain protected.</span>
            </article>
            <article>
              <strong>Designed for continuity</strong>
              <span>Pick up exactly where you left your care routine.</span>
            </article>
          </div>
        </section>

        <aside className="auth-card auth-card-rail">
          <div className="auth-card-top">
            <span className="auth-kicker">Login</span>
            <h2>Sign in to MindCare</h2>
            <p>Use your account to access your wellness dashboard.</p>
          </div>

          <div className="auth-card-switch">
            <span>New to MindCare?</span>
            <Link className="auth-card-switch-link" href="/register">
              Create an account
            </Link>
          </div>

          <LoginForm />
        </aside>
      </section>
    </main>
  );
}
