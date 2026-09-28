import { PRESET_PROMPTS } from "../../../shared/types";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks";
import { setPrompt } from "../state/workbench.slice";

const PresetChips = () => {
  const dispatch = useAppDispatch();
  const currentPrompt = useAppSelector((s) => s.workbench.prompt);

  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_PROMPTS.map((preset) => {
        const isActive = currentPrompt === preset;
        return (
          <button
            key={preset}
            type="button"
            onClick={() => dispatch(setPrompt(preset))}
            className={`
              text-xs px-3 py-1.5 rounded-full border transition-colors
              ${
                isActive
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }
            `}
          >
            {preset.length > 55 ? preset.slice(0, 55) + "…" : preset}
          </button>
        );
      })}
    </div>
  );
};

export default PresetChips;
