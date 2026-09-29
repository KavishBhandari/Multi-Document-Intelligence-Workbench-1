import { useNavigate } from "react-router";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200 mb-2">404</h1>
        <p className="text-sm text-gray-500 mb-4">
          The page you're looking for doesn't exist.
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to Workbench
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
