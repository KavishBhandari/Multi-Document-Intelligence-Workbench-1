import type { UploadedDocument } from "../../../shared/types";

interface DocumentCardProps {
  doc: UploadedDocument;
  onRemove: (id: string) => void;
}

/** Format file size into a readable string */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Map format to a simple icon/label */
const FORMAT_LABELS: Record<string, string> = {
  pdf: "PDF",
  txt: "TXT",
  csv: "CSV",
  image: "IMG",
};

const DocumentCard = ({ doc, onRemove }: DocumentCardProps) => {
  const isError = doc.status === "error";

  return (
    <div
      className={`
        flex items-center justify-between gap-3 px-3 py-2 rounded-md border text-sm
        ${isError ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}
      `}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`
            shrink-0 text-xs font-medium px-1.5 py-0.5 rounded
            ${isError ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}
          `}
        >
          {FORMAT_LABELS[doc.format] ?? doc.format.toUpperCase()}
        </span>

        <span className="truncate text-gray-800" title={doc.name}>
          {doc.name}
        </span>

        <span className="shrink-0 text-xs text-gray-400">
          {formatSize(doc.sizeBytes)}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isError && (
          <span
            className="text-xs text-red-600 max-w-50 truncate"
            title={doc.errorMessage}
          >
            {doc.errorMessage}
          </span>
        )}

        <button
          type="button"
          onClick={() => onRemove(doc.id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Remove document"
        >
          <svg
            className="w-4 h-4"
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
    </div>
  );
};

export default DocumentCard;
