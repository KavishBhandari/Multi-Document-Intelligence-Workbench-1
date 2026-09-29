import axios from "axios";
import type {
  AnalysisResult,
  UploadApiResponse,
} from "../../../shared/types";
import { getAnalysisById } from "../../results/service/results.service";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

/**
 * Upload documents + prompt to the backend.
 * POST http://localhost:4000/api/upload
 * Body: FormData with "prompt" and "files"
 */
export async function uploadDocuments(
  files: File[],
  prompt: string,
): Promise<UploadApiResponse> {
  const formData = new FormData();
  formData.append("prompt", prompt);
  files.forEach((file) => formData.append("files", file));

  const { data } = await axios.post<UploadApiResponse>(
    `${API_BASE}/upload`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120_000,
    },
  );

  return data;
}

/**
 * Submit documents + prompt to backend:
 * 1. POST http://localhost:4000/api/upload (FormData: prompt, files)
 * 2. POST http://localhost:4000/api/evaluate/:sessionId (Body: {})
 */
export async function submitAnalysis(
  files: File[],
  prompt: string,
): Promise<AnalysisResult> {
  const uploadResponse = await uploadDocuments(files, prompt);

  if (!uploadResponse.success || !uploadResponse.data?.sessionId) {
    throw new Error(
      uploadResponse.message || "Document upload failed. No session created.",
    );
  }

  const sessionId = String(uploadResponse.data.sessionId);
  return getAnalysisById(sessionId);
}

/**
 * Fetch a previously computed analysis by session ID.
 */
export async function fetchAnalysis(id: string): Promise<AnalysisResult> {
  return getAnalysisById(id);
}