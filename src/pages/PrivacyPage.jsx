export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <h1>Privacy Policy</h1>
      <div className="last-updated">Last updated: May 2026</div>

      <h2>Overview</h2>
      <p>
        CDCracker is a student-facing academic reference tool. We take a minimal-data approach
        by design — students can browse and use the platform entirely without creating an account
        or providing any personal information.
      </p>

      <h2>What Data We Collect</h2>
      <p>
        For <strong>students</strong> (public users): <strong>nothing</strong>. No cookies, no tracking,
        no analytics beyond what your browser and host provider log automatically (IP address, browser type).
        We do not store, sell, or process any student personal data.
      </p>
      <p>
        For <strong>administrators</strong>: We store a username and a hashed password on the server
        to authenticate admin access. This data is used solely for access control.
      </p>

      <h2>Authentication & Tokens</h2>
      <p>
        Admin sessions use JSON Web Tokens (JWT). Upon successful login, a signed token is stored in
        your browser's <code>localStorage</code>. This token is valid for the session and is used to
        authenticate write operations against the API. You can remove it at any time by logging out.
      </p>

      <h2>Third-Party Services</h2>
      <ul>
        <li><strong>Google Fonts</strong> — used for typography (Inter, Syne, JetBrains Mono). Google may log font requests.</li>
        <li>No advertising networks, no analytics services, no social tracking pixels.</li>
      </ul>

      <h2>Data Retention</h2>
      <p>
        Course, assessment, and question content is retained until an admin deletes it. No user browsing
        history is stored. No student session data is persisted beyond the current browser tab.
      </p>

      <h2>Your Rights</h2>
      <p>
        If you are an admin user and wish to have your credentials removed from the system, contact
        the platform operator directly.
      </p>

      <h2>Contact</h2>
      <p>
        If you have questions about this privacy policy, reach out to the admin of this CDCracker instance.
        This is a community-run tool, not a commercial product.
      </p>
    </div>
  );
}
