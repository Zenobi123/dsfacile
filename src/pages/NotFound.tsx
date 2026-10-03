import { Link, useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-2">Cette page n'existe pas.</p>
        <p className="text-sm text-gray-500 mb-6 break-all">{location.pathname}</p>
        <Link to="/" className="text-secondary hover:text-primary underline">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
