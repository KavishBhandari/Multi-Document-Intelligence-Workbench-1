import { createBrowserRouter } from "react-router";
import WorkbenchPage from "../features/workbench/pages/WorkbenchPage";
import ResultsPage from "../features/results/pages/ResultsPage";
import NotFoundPage from "../features/results/pages/NotFoundPage";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <WorkbenchPage />,
  },
  {
    path: "/analyses/:id",
    element: <ResultsPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
