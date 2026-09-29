import { useRunAnalysis } from "../hook/useRunAnalysis";

const RunAnalysisButton = () => {
  const { run, isRunning, canRun, validationError } = useRunAnalysis();

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={run}
        disabled={!canRun}
        className={`
          w-full py-2.5 px-4 rounded-md text-sm font-medium transition-colors
          ${
            canRun
              ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }
        `}
      >
        {isRunning ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Analysing…
          </span>
        ) : (
          "Run Analysis"
        )}
      </button>

      {validationError && (
        <p className="text-xs text-red-600">{validationError}</p>
      )}
    </div>
  );
};

export default RunAnalysisButton;
