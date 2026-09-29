import { useAppSelector } from "../../../shared/hooks";

const ComparisonTable = () => {
  const result = useAppSelector((s) => s.results.result);

  if (!result || result.comparisonRows.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4">
        No comparison data available.
      </p>
    );
  }

  const docIds = Object.keys(result.documentNames);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left px-3 py-2 font-medium text-gray-600 border-b border-gray-200">
              Field
            </th>
            {docIds.map((id) => (
              <th
                key={id}
                className="text-left px-3 py-2 font-medium text-gray-600 border-b border-gray-200"
              >
                {result.documentNames[id]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.comparisonRows.map((row, idx) => (
            <tr
              key={row.field}
              className={`
                ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                ${row.hasDiscrepancy ? "bg-amber-50" : ""}
              `}
            >
              <td className="px-3 py-2 font-medium text-gray-800 border-b border-gray-100">
                {row.field}
                {row.hasDiscrepancy && (
                  <span
                    className="ml-1 text-amber-600 text-xs"
                    title="Discrepancy detected"
                  >
                    ⚠
                  </span>
                )}
              </td>
              {docIds.map((id) => (
                <td
                  key={id}
                  className="px-3 py-2 text-gray-600 border-b border-gray-100"
                >
                  {row.values[id] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
