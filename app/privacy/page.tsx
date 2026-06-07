import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Planning Poker',
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen items-start justify-center bg-slate-950 px-6 py-16">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-slate-200"
        >
          ← Back
        </Link>

        <h1 className="mb-2 text-3xl font-black text-white">Privacy Policy</h1>
        <p className="mb-10 text-sm text-slate-500">Last updated: June 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-slate-400">
          <section>
            <h2 className="mb-3 text-base font-bold text-slate-200">1. What We Collect</h2>
            <p>
              When you use Planning Poker we temporarily hold the display name and role you provide
              for the duration of your session. No account registration or email address is required
              to use the service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-slate-200">2. How It Is Used</h2>
            <p>
              Your name and role are used solely to identify you to other participants in the same
              planning room. This data exists only in memory for the life of the session and is
              permanently deleted when the room closes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-slate-200">3. Data Retention</h2>
            <p>
              We do not persist session data to any database. Once all participants leave a room,
              all associated data (names, votes, ticket history) is gone and cannot be recovered.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-slate-200">4. Third-Party Sharing</h2>
            <p>
              We do not sell, trade, or share your information with third parties. No analytics,
              advertising, or tracking services are used.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-slate-200">5. Cookies</h2>
            <p>
              Planning Poker stores your theme preference (light/dark) in your browser&apos;s local
              storage. No tracking cookies are used.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-slate-200">6. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. The &quot;last updated&quot; date at the
              top of this page will reflect any changes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-slate-200">7. Contact</h2>
            <p>
              Questions about this policy? Contact us at{' '}
              <a
                href="mailto:jonprosser84@gmail.com"
                className="text-slate-300 underline hover:text-white"
              >
                jonprosser84@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
