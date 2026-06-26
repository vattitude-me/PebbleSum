"use client";

interface PrivacyPageProps {
  onBack: () => void;
}

export default function PrivacyPage({ onBack }: PrivacyPageProps) {
  return (
    <div className="legal-page">
      <div className="legal-page__header">
        <button onClick={onBack} className="legal-page__back">
          <img src="/assets/icons/icon-arrow-left.png" alt="Back" className="legal-page__back-icon" />
        </button>
        <h2 className="legal-page__title">Privacy Policy</h2>
      </div>

      <div className="legal-page__content">
        <p className="legal-page__updated">Last updated: June 2025</p>

        <section className="legal-page__section">
          <h3>1. Information We Collect</h3>
          <p>
            When you create an account, we collect your email address and password (stored securely
            via Firebase Authentication). We also store your learning progress, settings, and
            achievement data to provide the service.
          </p>
        </section>

        <section className="legal-page__section">
          <h3>2. How We Use Your Information</h3>
          <p>
            Your data is used solely to provide and improve the PebbleSum learning experience.
            This includes syncing your progress across devices, tracking achievements, and
            personalizing difficulty levels.
          </p>
        </section>

        <section className="legal-page__section">
          <h3>3. Data Storage &amp; Security</h3>
          <p>
            Your data is stored securely using Google Firebase infrastructure. We use industry-standard
            security measures to protect your information, including encryption in transit and at rest.
          </p>
        </section>

        <section className="legal-page__section">
          <h3>4. Children&apos;s Privacy</h3>
          <p>
            PebbleSum is designed for use by children. We do not knowingly collect personal
            information from children without parental consent. Parents may review, modify, or
            delete their child&apos;s data by deleting the account from the app settings.
          </p>
        </section>

        <section className="legal-page__section">
          <h3>5. Data Sharing</h3>
          <p>
            We do not sell, rent, or share your personal data with third parties for advertising
            or marketing purposes. We may use anonymized, aggregated data to improve the service.
          </p>
        </section>

        <section className="legal-page__section">
          <h3>6. Your Rights</h3>
          <p>
            You have the right to access, modify, or delete your data at any time. You can delete
            your account and all associated data from the app settings. Upon deletion, your data
            is permanently removed from our servers.
          </p>
        </section>

        <section className="legal-page__section">
          <h3>7. Cookies &amp; Analytics</h3>
          <p>
            PebbleSum uses Vercel Web Analytics to understand general usage patterns.
            No personally identifiable information is collected through analytics.
          </p>
        </section>

        <section className="legal-page__section">
          <h3>8. Changes to This Policy</h3>
          <p>
            We may update this privacy policy from time to time. We will notify users of significant
            changes via the application.
          </p>
        </section>

        <section className="legal-page__section">
          <h3>9. Contact</h3>
          <p>
            For privacy-related questions, please visit{" "}
            <a href="https://vattitude.ca" target="_blank" rel="noopener noreferrer">vattitude.ca</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
