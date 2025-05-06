import React, { useState } from "react";

interface CuspalExtChartProps {
  data?: { house: number; sign: string; ruler: string }[]; // Optional data for dynamic rendering
}

const CuspalExtChart: React.FC<CuspalExtChartProps> = ({ data = [] }) => {
  const [filter, setFilter] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredData = data.filter((cusp) =>
    cusp.sign.toLowerCase().includes(filter.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortOrder === "asc") return a.house - b.house;
    return b.house - a.house;
  });

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const resetFilter = () => {
    setFilter("");
  };

  const clearAll = () => {
    setFilter("");
    setSortOrder("asc");
  };

  return (
    <div className="border border-gray-300 p-4">
      <h3 className="text-lg font-bold mb-2">Cuspal Details</h3>
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Filter by sign..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded w-full"
          aria-label="Filter by sign"
        />
        <button
          onClick={toggleSortOrder}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          aria-label={`Sort houses in ${sortOrder === "asc" ? "descending" : "ascending"} order`}
        >
          Sort: {sortOrder === "asc" ? "Ascending" : "Descending"}
        </button>
        <button
          onClick={resetFilter}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          aria-label="Reset filter"
        >
          Reset Filter
        </button>
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          aria-label="Clear all filters and sorting"
        >
          Clear All
        </button>
      </div>
      {data.length === 0 ? (
        <p className="text-center text-gray-500">No data available</p>
      ) : sortedData.length === 0 ? (
        <p className="text-center text-gray-500">No results match your filter</p>
      ) : (
        <table className="w-full border-collapse border border-gray-400 text-sm">
          <thead>
            <tr>
              <th className="border border-gray-400 px-2 py-1">House</th>
              <th className="border border-gray-400 px-2 py-1">Sign</th>
              <th className="border border-gray-400 px-2 py-1">Ruler</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((cusp, index) => (
              <tr key={index}>
                <td className="border border-gray-400 px-2 py-1">{cusp.house}</td>
                <td className="border border-gray-400 px-2 py-1">{cusp.sign}</td>
                <td className="border border-gray-400 px-2 py-1">{cusp.ruler}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CuspalExtChart;
