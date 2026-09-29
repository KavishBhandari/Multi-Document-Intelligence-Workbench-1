import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  AnalysisResult,
  AnalysisStatus,
  ResultTab,
} from "../../../shared/types";

interface ResultsState {
  result: AnalysisResult | null;
  status: AnalysisStatus;
  error: string | null;
  activeTab: ResultTab;
  drawerDocumentId: string | null;
}

const initialState: ResultsState = {
  result: null,
  status: "idle",
  error: null,
  activeTab: "summary",
  drawerDocumentId: null,
};

const resultsSlice = createSlice({
  name: "results",
  initialState,
  reducers: {
    setLoading(state) {
      state.status = "loading";
      state.error = null;
    },
    setResult(state, action: PayloadAction<AnalysisResult>) {
      state.result = action.payload;
      state.status = "success";
      state.error = null;
    },
    setError(state, action: PayloadAction<string>) {
      state.status = "error";
      state.error = action.payload;
    },
    setActiveTab(state, action: PayloadAction<ResultTab>) {
      state.activeTab = action.payload;
    },
    openDrawer(state, action: PayloadAction<string>) {
      state.drawerDocumentId = action.payload;
    },
    closeDrawer(state) {
      state.drawerDocumentId = null;
    },
    clearResults() {
      return initialState;
    },
  },
});

export const {
  setLoading,
  setResult,
  setError,
  setActiveTab,
  openDrawer,
  closeDrawer,
  clearResults,
} = resultsSlice.actions;

export default resultsSlice.reducer;
