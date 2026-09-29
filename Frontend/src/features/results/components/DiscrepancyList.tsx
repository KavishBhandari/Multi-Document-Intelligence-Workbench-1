import { useAppSelector } from "../../../shared/hooks";
import SourceChip from "./SourceChip";

const DiscrepancyList = () => {
  const result = useAppSelector((s) => s.results.result);

  if (!result || result.discrepancies.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4">No discrepancies found.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {result.discrepancies.map((d) => (
        <li
          key={d.id}
          className="border border-amber-200 bg-amber-50/50 rounded-md px-4 py-3"
        >
          <p className="text-sm font-medium text-gray-800">{d.field}</p>
          <p className="text-sm text-gray-600 mt-1">{d.details}</p>

          <div className="mt-2 space-y-1">
            {d.conflictingValues.map((cv, cvIdx) => (
              <div
                key={`${cv.documentId}-${cvIdx}`}
                className="flex items-center gap-2 text-sm"
              >
                <SourceChip
                  documentId={cv.documentId}
                  documentName={cv.documentName}
                />
                <span className="text-gray-700">{cv.value}</span>
              </div>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default DiscrepancyList;
