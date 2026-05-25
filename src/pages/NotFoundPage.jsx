import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="not-found-code">404</div>
      <h2>Page not found</h2>
      <p>This page doesn't exist or may have been moved.</p>
      <Link to="/" className="btn btn-primary">
        <ArrowLeft size={15} /> Back to Home
      </Link>
    </div>
  );
}
