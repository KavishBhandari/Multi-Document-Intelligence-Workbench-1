import { useAppSelector } from "../../../shared/hooks";
import SourceChip from "./SourceChip";

/** Map severity to visual style */
const severityConfig: Record<string, { bg: string; border: string; text: string; label: string }> = {
  info: {
    bg: "bg-blue-50/60",
    border: "border-blue-200",
    text: "text-blue-700",
    label: "Info",
  },
  warning: {
    bg: "bg-amber-50/60",
    border: "border-amber-200",
    text: "text-amber-700",
    label: "Warning",
  },
  critical: {
    bg: "bg-red-50/60",
    border: "border-red-200",
    text: "text-red-700",
    label: "Critical",
  },
};

const defaultSeverity = severityConfig.info;

const MissingInfoReport = () => {
  const result = useAppSelector((s) => s.results.result);

  if (!result || result.missingItems.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4">
        No missing information detected.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {result.missingItems.map((m) => {
        const style = severityConfig[m.severity] ?? defaultSeverity;

        return (
          <li
            key={m.id}
            className={`border rounded-lg px-4 py-3 ${style.bg} ${style.border}`}
          >
            {/* Header row: icon + title + severity badge */}
            <div className="flex items-start gap-3">
              <svg
                className={`w-4 h-4 mt-0.5 shrink-0 ${style.text}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>

              <div className="flex-1 min-w-0">
                {/* Title */}
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-gray-800">{m.field}</p>
                  <span
                    className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${style.text} ${style.bg} border ${style.border}`}
                  >
                    {style.label}
                  </span>
                  {m.classification && (
                    <span className="text-[10px] text-gray-400 font-medium">
                      {m.classification === "ai_interpretation"
                        ? "AI Interpretation"
                        : m.classification}
                    </span>
                  )}
                </div>

                {/* Description / Reason */}
                {m.reason && (
                  <p className="text-sm text-gray-600 mt-1">{m.reason}</p>
                )}

                {/* Evidence quotes */}
                {m.evidences && m.evidences.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {m.evidences.map((ev, idx) => (
                      <div
                        key={`${m.id}-ev-${idx}`}
                        className="bg-white/70 border border-gray-200 rounded-md px-3 py-2"
                      >
                        <p className="text-xs text-gray-500 italic leading-relaxed">
                          "{ev.quote}"
                        </p>
                        <div className="mt-1.5">
                          <SourceChip
                            documentId={ev.documentId}
                            documentName={ev.documentName}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Fallback: show single source chip if no evidences but documentId exists */}
                {(!m.evidences || m.evidences.length === 0) && m.documentId && (
                  <div className="mt-1.5">
                    <SourceChip
                      documentId={m.documentId}
                      documentName={m.documentName}
                    />
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default MissingInfoReport;
