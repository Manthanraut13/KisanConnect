import { Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <Sprout className="h-16 w-16 text-kisan-700" />
      <h1 className="text-4xl font-bold text-kisan-800 mt-4">Kisan Connect</h1>
      <p className="text-gray-600 mt-2 text-center max-w-md">
        Direct farm-to-consumer AI-powered marketplace.
      </p>
      <div className="flex gap-4 mt-8">
        <Link
          to="/login"
          className="px-6 py-2 bg-kisan-700 text-white rounded-lg hover:bg-kisan-800"
        >
          Login
        </Link>
        <Link
          to="/admin"
          className="px-6 py-2 border border-kisan-700 text-kisan-700 rounded-lg hover:bg-kisan-50"
        >
          Admin
        </Link>
        <Link
          to="/driver"
          className="px-6 py-2 border border-kisan-700 text-kisan-700 rounded-lg hover:bg-kisan-50"
        >
          Driver
        </Link>
      </div>
    </div>
  );
};

export default Home;
