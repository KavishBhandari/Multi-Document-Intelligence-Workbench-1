import { useCallback, useState } from "react";
import { useAppSelector } from "../../../shared/hooks";
import { formatResultForCopy, copyToClipboard } from "../service/copyOutput";

/**
 * Hook for copying analysis output to clipboard.
 */
export function useCopyOutput() {
  const result = useAppSelector((s) => s.results.result);
  const activeTab = useAppSelector((s) => s.results.activeTab);
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    if (!result) return;

    const text = formatResultForCopy(result, activeTab);
    const success = await copyToClipboard(text);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result, activeTab]);

  return { copy, copied };
}
