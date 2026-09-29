import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UploadedDocument } from "../../../shared/types";

interface WorkbenchState {
  documents: UploadedDocument[];
  prompt: string;
}

const initialState: WorkbenchState = {
  documents: [],
  prompt: "",
};

const workbenchSlice = createSlice({
  name: "workbench",
  initialState,
  reducers: {
    addDocuments(state, action: PayloadAction<UploadedDocument[]>) {
      state.documents.push(...action.payload);
    },
    removeDocument(state, action: PayloadAction<string>) {
      state.documents = state.documents.filter((d) => d.id !== action.payload);
    },
    setDocumentStatus(
      state,
      action: PayloadAction<{
        id: string;
        status: UploadedDocument["status"];
        errorMessage?: string;
      }>,
    ) {
      const doc = state.documents.find((d) => d.id === action.payload.id);
      if (doc) {
        doc.status = action.payload.status;
        doc.errorMessage = action.payload.errorMessage;
      }
    },
    setPrompt(state, action: PayloadAction<string>) {
      state.prompt = action.payload;
    },
    clearWorkbench(state) {
      state.documents = [];
      state.prompt = "";
    },
  },
});

export const {
  addDocuments,
  removeDocument,
  setDocumentStatus,
  setPrompt,
  clearWorkbench,
} = workbenchSlice.actions;

export default workbenchSlice.reducer;
