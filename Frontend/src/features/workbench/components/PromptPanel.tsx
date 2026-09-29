import { useAppDispatch, useAppSelector } from "../../../shared/hooks";
import { setPrompt } from "../state/workbench.slice";
import PresetChips from "./PresetChips";

const PromptPanel = () => {
  const dispatch = useAppDispatch();
  const prompt = useAppSelector((s) => s.workbench.prompt);

  return (
    <div className="space-y-3">
      <label
        htmlFor="analysis-prompt"
        className="block text-sm font-medium text-gray-700"
      >
        Analysis Instruction
      </label>

      <textarea
        id="analysis-prompt"
        rows={4}
        value={prompt}
        onChange={(e) => dispatch(setPrompt(e.target.value))}
        placeholder="Describe what you want to analyse across the uploaded documents…"
        className="
          w-full rounded-md border border-gray-300 px-3 py-2 text-sm
          placeholder-gray-400 resize-y
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        "
        maxLength={2000}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{prompt.length} / 2000</span>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2">Or pick a preset:</p>
        <PresetChips />
      </div>
    </div>
  );
};

export default PromptPanel;
