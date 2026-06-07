import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Planning Poker',
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen items-start justify-center bg-slate-950 px-6 py-16">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-slate-200"
        >
          ← Back
        </Link>

        <h1 className="mb-2 text-3xl font-black text-white">Terms of Service</h1>
        <p className="mb-10 text-sm text-slate-500">Last updated: June 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-slate-400">
          <section>
            <h2 className="mb-3 text-base font-bold text-slate-200">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Planning Poker you agree to be bound by these Terms of Service.
              If you do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-slate-200">2. Acceptable Use</h2>
            <p>
              You may use Planning Poker for lawful purposes only. You agree not to misuse the
              service, attempt to disrupt its operation, or use it to transmit harmful or unlawful
              content.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-slate-200">3. No Warranty</h2>
            <p>
              Planning Poker is provided &quot;as is&quot; without warranties of any kind. We do not
              guarantee uninterrupted or error-free operation of the service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-slate-200">4. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Planning Poker and its operators shall not be
              liable for any indirect, incidental, or consequential damages arising from your use of
              the service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-slate-200">5. Right to Suspend Service</h2>
            <p>
              We reserve the right to suspend or terminate access to the service at any time, with
              or without notice, for any reason including violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-slate-200">6. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the service after
              changes are posted constitutes your acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-slate-200">7. Contact</h2>
            <p>
              Questions about these terms? Contact us at{' '}
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
