import DropZone from "../components/DropZone";
import DocumentList from "../components/DocumentList";
import PromptPanel from "../components/PromptPanel";
import RunAnalysisButton from "../components/RunAnalysisButton";
import { useAppSelector } from "../../../shared/hooks";

const WorkbenchPage = () => {
  const errorMsg = useAppSelector((s) => s.results.error);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold text-gray-900">
            Document Intelligence Workbench
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Upload documents, provide an analysis instruction, and receive
            structured insights.
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Step 1 – Upload */}
        <section>
          <h2 className="text-sm font-medium text-gray-700 mb-3">
            1. Upload Documents
          </h2>
          <DropZone />
          <div className="mt-3">
            <DocumentList />
          </div>
        </section>

        {/* Step 2 – Prompt */}
        <section>
          <h2 className="text-sm font-medium text-gray-700 mb-3">
            2. Describe the Analysis
          </h2>
          <PromptPanel />
        </section>

        {/* Step 3 – Run */}
        <section>
          <RunAnalysisButton />
        </section>

        {/* Global error banner */}
        {errorMsg && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkbenchPage;
