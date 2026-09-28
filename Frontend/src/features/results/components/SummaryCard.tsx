import { useAppSelector } from "../../../shared/hooks";

const SummaryCard = () => {
  const result = useAppSelector((s) => s.results.result);

  if (!result) return null;

  return (
    <div className="space-y-4">
      {/* Prompt used */}
      <div className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
          Analysis Instruction
        </p>
        <p className="text-sm text-gray-700">{result.prompt}</p>
      </div>

      {/* Consolidated summary */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Consolidated Summary
        </h3>
        <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
          {result.summary}
        </div>
      </div>

      {/* Documents analysed */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Documents Analysed
        </h3>
        <ul className="space-y-1">
          {Object.entries(result.documentNames).map(([id, name]) => (
            <li
              key={id}
              className="text-sm text-gray-600 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
              {name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SummaryCard;
