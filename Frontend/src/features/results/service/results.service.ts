import axios from "axios";
import type { AnalysisResult, EvaluateApiResponse } from "../../../shared/types";
import { normalizeEvaluateResponse } from "./results.schemas";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

/**
 * Fetch and evaluate an analysis session by its ID.
 * POST http://localhost:4000/api/evaluate/:sessionId
 * Body: {}
 */
export async function getAnalysisById(sessionId: string): Promise<AnalysisResult> {
  const { data } = await axios.post<EvaluateApiResponse>(
    `${API_BASE}/evaluate/${sessionId}`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 120_000,
    },
  );

  if (data?.data) {
    return normalizeEvaluateResponse(data.data);
  }

  throw new Error(data?.message || "Failed to retrieve evaluation results.");
}