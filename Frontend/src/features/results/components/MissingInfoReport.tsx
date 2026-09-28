import { useAppSelector } from "../../../shared/hooks";
import SourceChip from "./SourceChip";

const MissingInfoReport = () => {
  const result = useAppSelector((s) => s.results.result);

  if (!result || result.missingItems.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4">
        No missing information detected.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {result.missingItems.map((m) => (
        <li
          key={m.id}
          className="flex items-start gap-3 border border-red-100 bg-red-50/40 rounded-md px-4 py-3"
        >
          <svg
            className="w-4 h-4 text-red-400 mt-0.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">{m.field}</p>
            <p className="text-sm text-gray-600 mt-0.5">{m.reason}</p>
            <div className="mt-1.5">
              <SourceChip
                documentId={m.documentId}
                documentName={m.documentName}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MissingInfoReport;
