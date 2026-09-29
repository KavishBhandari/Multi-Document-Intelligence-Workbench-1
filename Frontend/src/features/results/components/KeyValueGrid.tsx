import { useAppSelector } from "../../../shared/hooks";
import KindBadge from "./KindBadge";
import SourceChip from "./SourceChip";

const KeyValueGrid = () => {
  const result = useAppSelector((s) => s.results.result);

  if (!result || result.keyValues.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4">
        No key-value extractions available.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {result.keyValues.map((kv) => (
        <div
          key={kv.id}
          className="border border-gray-200 rounded-md px-4 py-3 bg-white"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-800">
                  {kv.label}
                </span>
                <KindBadge kind={kv.kind} />
              </div>
              <p className="text-sm text-gray-600">{kv.value}</p>
            </div>
          </div>

          {kv.sourceDocumentIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {kv.sourceDocumentIds.map((docId) => (
                <SourceChip
                  key={docId}
                  documentId={docId}
                  documentName={result.documentNames[docId] ?? docId}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default KeyValueGrid;
