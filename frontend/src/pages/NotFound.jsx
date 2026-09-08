import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-7xl font-bold text-kisan-700">404</p>
        <h1 className="text-2xl font-bold text-gray-800 mt-4">Page Not Found</h1>
        <p className="text-gray-600 mt-2">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link
            to="/"
            className="px-6 py-2 bg-kisan-700 text-white rounded-lg hover:bg-kisan-800"
          >
            Go Home
          </Link>
          <Link
            to="/marketplace"
            className="px-6 py-2 border border-kisan-700 text-kisan-700 rounded-lg hover:bg-kisan-50"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;