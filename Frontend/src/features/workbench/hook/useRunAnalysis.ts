import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks";
import {
  setLoading,
  setResult,
  setError,
} from "../../results/state/results.slice";
import { submitAnalysis } from "../service/workbench.service";
import { validatePrompt } from "../service/workbench.validation";
import { isValidAnalysisResult } from "../../results/service/results.schemas";

/**
 * Hook that orchestrates analysis submission.
 * Validates input, calls the API, and dispatches results to Redux.
 */
export function useRunAnalysis() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const documents = useAppSelector((s) => s.workbench.documents);
  const prompt = useAppSelector((s) => s.workbench.prompt);
  const status = useAppSelector((s) => s.results.status);

  const [validationError, setValidationError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setValidationError(null);

    // Validate documents
    const validDocs = documents.filter((d) => d.status === "done");
    if (validDocs.length === 0) {
      setValidationError(
        "Upload at least one valid document before analysing.",
      );
      return;
    }

    // Validate prompt
    const promptCheck = validatePrompt(prompt);
    if (!promptCheck.valid) {
      setValidationError(promptCheck.error ?? "Invalid prompt.");
      return;
    }

    dispatch(setLoading());

    try {
      const files = validDocs.map((d) => d.file);
      const result = await submitAnalysis(files, prompt);

      if (!isValidAnalysisResult(result)) {
        dispatch(
          setError("Received an unexpected response format from the server."),
        );
        return;
      }

      dispatch(setResult(result));
      navigate(`/analyses/${result.id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Analysis failed. Please try again.";
      dispatch(setError(message));
    }
  }, [documents, prompt, dispatch, navigate]);

  const isRunning = status === "loading";
  const canRun =
    documents.some((d) => d.status === "done") &&
    prompt.trim().length >= 10 &&
    !isRunning;

  return { run, isRunning, canRun, validationError };
}
