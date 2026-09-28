import type { FindingKind } from "../../../shared/types";

interface KindBadgeProps {
  kind: FindingKind;
}

const KIND_STYLES: Record<
  FindingKind,
  { bg: string; text: string; label: string }
> = {
  fact: { bg: "bg-green-100", text: "text-green-700", label: "Fact" },
  comparison: { bg: "bg-blue-100", text: "text-blue-700", label: "Comparison" },
  discrepancy: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    label: "Discrepancy",
  },
  missing: { bg: "bg-red-100", text: "text-red-700", label: "Missing" },
  interpretation: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    label: "AI Interpretation",
  },
};

const KindBadge = ({ kind }: KindBadgeProps) => {
  const style = KIND_STYLES[kind] ?? KIND_STYLES.fact;

  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
};

export default KindBadge;
