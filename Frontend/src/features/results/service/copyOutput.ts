import type { AnalysisResult, ResultTab } from "../../../shared/types";

/**
 * Serialise analysis result to plain text for clipboard copy.
 * Format depends on the active tab.
 */
export function formatResultForCopy(
  result: AnalysisResult,
  tab: ResultTab,
): string {
  const lines: string[] = [];
  const divider = "─".repeat(50);

  lines.push(`Analysis: ${result.prompt}`);
  lines.push(`Date: ${new Date(result.createdAt).toLocaleString()}`);
  lines.push(divider);

  switch (tab) {
    case "summary":
      lines.push("CONSOLIDATED SUMMARY");
      lines.push(divider);
      lines.push(result.summary);
      break;

    case "comparison": {
      lines.push("COMPARISON TABLE");
      lines.push(divider);
      const docIds = Object.keys(result.documentNames);
      const header = [
        "Field",
        ...docIds.map((id) => result.documentNames[id]),
      ].join(" | ");
      lines.push(header);
      lines.push("─".repeat(header.length));
      for (const row of result.comparisonRows) {
        const vals = docIds.map((id) => row.values[id] ?? "—");
        const flag = row.hasDiscrepancy ? " ⚠" : "";
        lines.push(`${row.field} | ${vals.join(" | ")}${flag}`);
      }
      break;
    }

    case "discrepancies":
      lines.push("DISCREPANCIES");
      lines.push(divider);
      for (const d of result.discrepancies) {
        lines.push(`• ${d.field}: ${d.details}`);
        for (const c of d.conflictingValues) {
          lines.push(`    ${c.documentName}: ${c.value}`);
        }
      }
      break;

    case "missing":
      lines.push("MISSING INFORMATION");
      lines.push(divider);
      for (const m of result.missingItems) {
        lines.push(`• ${m.field} — ${m.documentName}: ${m.reason}`);
      }
      break;

    case "keyValues":
      lines.push("KEY-VALUE EXTRACTION");
      lines.push(divider);
      for (const kv of result.keyValues) {
        const sources = kv.sourceDocumentIds
          .map((id) => result.documentNames[id])
          .join(", ");
        lines.push(`${kv.label}: ${kv.value}  [${sources}]`);
      }
      break;
  }

  return lines.join("\n");
}

/**
 * Copy text to clipboard.
 * Returns true on success, false on failure.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
