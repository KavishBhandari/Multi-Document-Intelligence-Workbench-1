import type {
  AnalysisResult,
  ComparisonRow,
  Discrepancy,
  EvaluateApiResponse,
  Finding,
  FindingKind,
  MissingItem,
} from "../../../shared/types";

/**
 * Normalizes the raw backend evaluate API response into the internal AnalysisResult format
 */
export function normalizeEvaluateResponse(
  raw: EvaluateApiResponse["data"],
): AnalysisResult {
  const documentNames: Record<string, string> = {};
  (raw.documentsAnalyzed ?? []).forEach((doc) => {
    documentNames[String(doc.id)] = doc.name;
  });

  const comparisonRows: ComparisonRow[] = (raw.comparisonTable ?? []).map(
    (row) => {
      const values: Record<string, string> = { ...row.values };
      (raw.documentsAnalyzed ?? []).forEach((doc) => {
        if (row.values[doc.name] !== undefined) {
          values[String(doc.id)] = row.values[doc.name];
        }
      });

      const statusLower = (row.status ?? "").toLowerCase();
      const hasDiscrepancy =
        statusLower === "discrepant" || statusLower === "partial";

      return {
        field: row.field,
        values,
        hasDiscrepancy,
      };
    },
  );

  const discrepancies: Discrepancy[] = (raw.discrepancies ?? []).map((d) => ({
    id: String(d.id),
    field: d.title || "Discrepancy",
    details: d.description || "",
    conflictingValues: (d.evidences ?? []).map((ev) => ({
      documentId: String(ev.document_id ?? ev.document?.id ?? ""),
      documentName:
        ev.document?.original_name ??
        documentNames[String(ev.document_id)] ??
        `Document ${ev.document_id}`,
      value: ev.quote ?? "",
    })),
  }));

  const keyValues: Finding[] = (raw.keyValues ?? []).map((kv) => {
    let kind: FindingKind = "fact";
    if (kv.classification === "ai_interpretation") {
      kind = "interpretation";
    } else if (kv.classification === "extracted_fact") {
      kind = "fact";
    }

    const sourceIds = Array.from(
      new Set(
        (kv.evidences ?? [])
          .map((e) => String(e.document_id ?? e.document?.id ?? ""))
          .filter(Boolean),
      ),
    );

    return {
      id: String(kv.id),
      kind,
      label: kv.title,
      value: kv.description,
      sourceDocumentIds: sourceIds,
    };
  });

  const missingItems: MissingItem[] = (raw.missingInformation ?? []).map(
    (m, idx) => ({
      id: String(m.id ?? `missing-${idx + 1}`),
      field: m.field ?? "Missing Field",
      documentId: String(m.documentId ?? ""),
      documentName: m.documentName ?? "Unknown Document",
      reason: m.reason ?? "Information not found",
    }),
  );

  return {
    id: String(raw.sessionId),
    prompt: raw.prompt,
    summary: raw.summary,
    keyValues,
    comparisonRows,
    discrepancies,
    missingItems,
    documentNames,
    createdAt: new Date().toISOString(),
    model: raw.model,
    processingTimeMs: raw.processingTimeMs,
    allFindingsCount: raw.allFindingsCount,
    markdownOutput: raw.markdownOutput,
  };
}

/**
 * Zod-like runtime validation for the analysis response shape.
 * Ensures the result matches our expected structure before we trust it.
 */
export function isValidAnalysisResult(data: unknown): data is AnalysisResult {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  if (typeof obj.id !== "string") return false;
  if (typeof obj.prompt !== "string") return false;
  if (typeof obj.summary !== "string") return false;
  if (typeof obj.createdAt !== "string") return false;

  if (!Array.isArray(obj.keyValues)) return false;
  if (!Array.isArray(obj.comparisonRows)) return false;
  if (!Array.isArray(obj.discrepancies)) return false;
  if (!Array.isArray(obj.missingItems)) return false;
  if (!obj.documentNames || typeof obj.documentNames !== "object") return false;

  return true;
}

/** Type guard for Finding */
export function isFinding(item: unknown): item is Finding {
  if (!item || typeof item !== "object") return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.kind === "string" &&
    typeof obj.label === "string" &&
    typeof obj.value === "string" &&
    Array.isArray(obj.sourceDocumentIds)
  );
}

/** Type guard for ComparisonRow */
export function isComparisonRow(item: unknown): item is ComparisonRow {
  if (!item || typeof item !== "object") return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.field === "string" &&
    typeof obj.values === "object" &&
    typeof obj.hasDiscrepancy === "boolean"
  );
}

/** Type guard for Discrepancy */
export function isDiscrepancy(item: unknown): item is Discrepancy {
  if (!item || typeof item !== "object") return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.field === "string" &&
    typeof obj.details === "string" &&
    Array.isArray(obj.conflictingValues)
  );
}

/** Type guard for MissingItem */
export function isMissingItem(item: unknown): item is MissingItem {
  if (!item || typeof item !== "object") return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.field === "string" &&
    typeof obj.documentId === "string" &&
    typeof obj.reason === "string"
  );
}
