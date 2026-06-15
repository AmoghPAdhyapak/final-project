import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="text-center">
        <h1 className="font-playfair text-6xl font-bold gold-text mb-4">404</h1>
        <p className="text-muted-foreground text-lg mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/" className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
