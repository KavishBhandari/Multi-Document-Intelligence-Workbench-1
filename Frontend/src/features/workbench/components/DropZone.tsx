import { useCallback, useRef, useState, type DragEvent } from "react";
import { useDocuments } from "../hook/useDocuments";

const DropZone = () => {
  const { handleFiles } = useDocuments();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const onBrowse = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
        e.target.value = "";
      }
    },
    [handleFiles],
  );

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200
        ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
        }
      `}
      onClick={onBrowse}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.csv,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={onFileChange}
      />

      <div className="flex flex-col items-center gap-2">
        <svg
          className="w-10 h-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-sm text-gray-600">
          <span className="font-medium text-blue-600">Click to browse</span> or
          drag & drop files here
        </p>
        <p className="text-xs text-gray-400">
          PDF, TXT, CSV, PNG, JPEG, WEBP — up to 10 MB each
        </p>
      </div>
    </div>
  );
};

export default DropZone;
