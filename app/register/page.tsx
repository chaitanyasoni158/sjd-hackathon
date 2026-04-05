import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { createClient } from "@/lib/supabase/server";

export default async function RegisterPage() {
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
              <Link href="/login">Sign in</Link>
            </nav>
          </header>

          <div className="auth-hero-grid">
            <div className="auth-hero-copy">
              <div className="eyebrow">New account</div>
              <h1>Create a space for calmer routines, clearer patterns, and better check-ins.</h1>
              <p>
                Start tracking how you feel, see your trends over time, and build a more grounded
                mental wellness practice from day one.
              </p>
            </div>

            <div className="auth-preview-card">
              <div className="auth-preview-head">
                <span className="auth-preview-title">What unlocks next</span>
                <span className="auth-preview-pill">Starter flow</span>
              </div>

              <div className="auth-preview-steps">
                <article>
                  <span>01</span>
                  <div>
                    <strong>Set your baseline</strong>
                    <p>Take a quick assessment and understand your current stress signals.</p>
                  </div>
                </article>
                <article>
                  <span>02</span>
                  <div>
                    <strong>Track daily mood</strong>
                    <p>Log emotional patterns in seconds and build consistency over time.</p>
                  </div>
                </article>
                <article>
                  <span>03</span>
                  <div>
                    <strong>Act on insights</strong>
                    <p>Get suggestions shaped around your habits, trends, and reflection history.</p>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <div className="auth-benefit-grid">
            <article>
              <strong>Personal wellness hub</strong>
              <span>Assessments, habits, journaling, and trends in one place.</span>
            </article>
            <article>
              <strong>Support that adapts</strong>
              <span>Suggestions become more relevant as your routine grows.</span>
            </article>
          </div>
        </section>

        <aside className="auth-card auth-card-rail">
          <div className="auth-card-top">
            <span className="auth-kicker">Register</span>
            <h2>Create your MindCare account</h2>
            <p>Join with a few details and begin building your wellness routine.</p>
          </div>

          <div className="auth-card-switch">
            <span>Already have an account?</span>
            <Link className="auth-card-switch-link" href="/login">
              Go to login
            </Link>
          </div>

          <RegisterForm />
        </aside>
      </section>
    </main>
  );
}
