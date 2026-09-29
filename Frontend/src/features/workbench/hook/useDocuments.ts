import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks";
import {
  addDocuments,
  removeDocument,
  setDocumentStatus,
} from "../state/workbench.slice";
import { validateFile } from "../service/workbench.validation";
import type { UploadedDocument } from "../../../shared/types";

/**
 * Hook for managing document uploads.
 * Handles validation, adding to store, and removing.
 */
export function useDocuments() {
  const dispatch = useAppDispatch();
  const documents = useAppSelector((s) => s.workbench.documents);

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const validDocs: UploadedDocument[] = [];

      for (const file of files) {
        const result = validateFile(file);
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        if (result.valid && result.format) {
          validDocs.push({
            id,
            file,
            name: file.name,
            format: result.format,
            sizeBytes: file.size,
            status: "done",
            addedAt: Date.now(),
          });
        } else {
          // Still add it so the user sees the error inline
          validDocs.push({
            id,
            file,
            name: file.name,
            format: "txt", // fallback
            sizeBytes: file.size,
            status: "error",
            errorMessage: result.error,
            addedAt: Date.now(),
          });
        }
      }

      if (validDocs.length > 0) {
        dispatch(addDocuments(validDocs));
      }
    },
    [dispatch],
  );

  const remove = useCallback(
    (id: string) => {
      dispatch(removeDocument(id));
    },
    [dispatch],
  );

  const updateStatus = useCallback(
    (id: string, status: UploadedDocument["status"], errorMessage?: string) => {
      dispatch(setDocumentStatus({ id, status, errorMessage }));
    },
    [dispatch],
  );

  const validDocuments = documents.filter((d) => d.status === "done");
  const hasErrors = documents.some((d) => d.status === "error");

  return {
    documents,
    validDocuments,
    hasErrors,
    handleFiles,
    remove,
    updateStatus,
  };
}
