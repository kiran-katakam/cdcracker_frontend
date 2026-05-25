import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Brand */}
        <div>
          <div className="footer-brand-name">📚 CDCracker</div>
          <p className="footer-tagline">The smarter way to study. Find answers fast.</p>
          <p className="footer-disclaimer">
            Not affiliated with, endorsed by, or connected to VIT-AP University or any
            university portal. Content is user-submitted for educational reference only.
          </p>
        </div>

        {/* Navigate */}
        <div>
          <div className="footer-col-title">Navigate</div>
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/courses" className="footer-link">Browse Courses</Link>
          <Link to="/admin/login" className="footer-link">Admin Login</Link>
        </div>

        {/* Legal */}
        <div>
          <div className="footer-col-title">Legal</div>
          <Link to="/privacy" className="footer-link">Privacy Policy</Link>
          <Link to="/terms" className="footer-link">Terms &amp; Disclaimer</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} CDCracker. All rights reserved.</span>
        <span>Not affiliated with VIT-AP University.</span>
      </div>
    </footer>
  );
}
