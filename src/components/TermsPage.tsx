"use client";

interface TermsPageProps {
  onBack: () => void;
}

export default function TermsPage({ onBack }: TermsPageProps) {
  return (
    <div className="legal-page">
      <div className="legal-page__header">
        <button onClick={onBack} className="legal-page__back">
          <img src="/assets/icons/icon-arrow-left.png" alt="Back" className="legal-page__back-icon" />
        </button>
        <h2 className="legal-page__title">Terms of Service</h2>
      </div>

      <div className="legal-page__content">
        <p className="legal-page__updated">Last updated: June 2025</p>

        <section className="legal-page__section">
          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing or using PebbleSum, you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use the application.
          </p>
        </section>

        <section className="legal-page__section">
          <h3>2. Description of Service</h3>
          <p>
            PebbleSum is an educational math practice application designed for children.
            The service provides interactive math exercises, progress tracking, and achievement systems.
          </p>
        </section>

        <section className="legal-page__section">
          <h3>3. User Accounts</h3>
          <p>
            You may create an account using your email address. You are responsible for maintaining
            the confidentiality of your account credentials. You may delete your account at any time
            from the app settings.
          </p>
        </section>

        <section className="legal-page__section">
          <h3>4. Children&apos;s Privacy</h3>
          <p>
            PebbleSum is designed for use by children under parental supervision. We comply with
            applicable children&apos;s privacy regulations. Parents or guardians are responsible for
            managing their child&apos;s use of the application.
          </p>
        </section>

        <section className="legal-page__section">
          <h3>5. User Data</h3>
          <p>
            We collect minimal data necessary to provide the service, including progress data,
            settings, and account information. Your data is stored securely and is not shared with
            third parties for advertising purposes.
          </p>
        </section>

        <section className="legal-page__section">
          <h3>6. Acceptable Use</h3>
          <p>
            You agree to use PebbleSum only for its intended educational purpose.
            You must not attempt to interfere with the service or access other users&apos; data.
          </p>
        </section>

        <section className="legal-page__section">
          <h3>7. Limitation of Liability</h3>
          <p>
            PebbleSum is provided &ldquo;as is&rdquo; without warranties of any kind.
            We are not liable for any damages arising from your use of the application.
          </p>
        </section>

        <section className="legal-page__section">
          <h3>8. Changes to Terms</h3>
          <p>
            We may update these terms from time to time. Continued use of PebbleSum after
            changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section className="legal-page__section">
          <h3>9. Contact</h3>
          <p>
            For questions about these terms, please visit{" "}
            <a href="https://vattitude.ca" target="_blank" rel="noopener noreferrer">vattitude.ca</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
