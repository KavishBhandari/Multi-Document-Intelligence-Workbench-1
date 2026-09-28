import { configureStore } from "@reduxjs/toolkit";
import workbenchReducer from "../features/workbench/state/workbench.slice";
import resultsReducer from "../features/results/state/results.slice";

export const store = configureStore({
  reducer: {
    workbench: workbenchReducer,
    results: resultsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // File objects are not serialisable — suppress the check for workbench state
      serializableCheck: {
        ignoredPaths: ["workbench.documents"],
        ignoredActions: ["workbench/addDocuments"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
