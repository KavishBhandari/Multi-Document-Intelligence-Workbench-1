import { useAppDispatch } from "../../../shared/hooks";
import { openDrawer } from "../state/results.slice";

interface SourceChipProps {
  documentId: string;
  documentName: string;
}

const SourceChip = ({ documentId, documentName }: SourceChipProps) => {
  const dispatch = useAppDispatch();

  return (
    <button
      type="button"
      onClick={() => dispatch(openDrawer(documentId))}
      className="
        inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full
        bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors
        cursor-pointer
      "
      title={`Source: ${documentName}`}
    >
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {documentName}
    </button>
  );
};

export default SourceChip;
