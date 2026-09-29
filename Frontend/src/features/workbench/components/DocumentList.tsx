import { useDocuments } from "../hook/useDocuments";
import DocumentCard from "./DocumentCard";

const DocumentList = () => {
  const { documents, remove } = useDocuments();

  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          Uploaded Documents ({documents.length})
        </h3>
      </div>

      <div className="space-y-1.5">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} onRemove={remove} />
        ))}
      </div>
    </div>
  );
};

export default DocumentList;
