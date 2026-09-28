import { useAppDispatch, useAppSelector } from "../../../shared/hooks";
import { closeDrawer } from "../state/results.slice";

const SourceDrawer = () => {
  const dispatch = useAppDispatch();
  const drawerDocumentId = useAppSelector((s) => s.results.drawerDocumentId);
  const result = useAppSelector((s) => s.results.result);

  if (!drawerDocumentId || !result) return null;

  const docName = result.documentNames[drawerDocumentId] ?? "Unknown Document";

  // Gather all findings from this document
  const relatedFindings = result.keyValues.filter((kv) =>
    kv.sourceDocumentIds.includes(drawerDocumentId),
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={() => dispatch(closeDrawer())}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-lg z-50 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Document Source
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{docName}</p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(closeDrawer())}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Findings from this document
          </p>

          {relatedFindings.length === 0 ? (
            <p className="text-sm text-gray-400">
              No extracted findings linked to this document.
            </p>
          ) : (
            <ul className="space-y-2">
              {relatedFindings.map((f) => (
                <li
                  key={f.id}
                  className="border border-gray-100 rounded-md px-3 py-2 text-sm"
                >
                  <span className="font-medium text-gray-800">{f.label}:</span>{" "}
                  <span className="text-gray-600">{f.value}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Comparison rows mentioning this document */}
          {result.comparisonRows.length > 0 && (
            <>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mt-4">
                Comparison values
              </p>
              <ul className="space-y-1">
                {result.comparisonRows
                  .filter((row) => drawerDocumentId in row.values)
                  .map((row) => (
                    <li key={row.field} className="text-sm text-gray-700">
                      <span className="font-medium">{row.field}:</span>{" "}
                      {row.values[drawerDocumentId]}
                      {row.hasDiscrepancy && (
                        <span className="text-amber-600 text-xs ml-1">
                          ⚠ discrepancy
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SourceDrawer;
