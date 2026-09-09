import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import use30DaysReport from "../auth/hooks/use30daysReport";
import { useEffect } from "react";





function Rechart() {
  const { data, fetchReport, isLoading, error } = use30DaysReport();

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (isLoading) {
    return <p>Loading sales report...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }
  return (
   <div className="rechart-container w-full max-w-2xl">
     <LineChart
      style={{ width: "100%", aspectRatio: 1.618, maxWidth: 600 }}
      responsive
      data={data}
      margin={{ top: 20, right: 20, bottom: 5, left: 0 }}
    >
      <CartesianGrid strokeDasharray="5 5" />
      <Line
        type="monotone"
        dataKey="totalCost"
        stroke="#2563eb"
        strokeWidth={2}
        name="Sales"

      />
      <XAxis
        dataKey="saleDate"
        tickFormatter={(value) =>
          new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        }
      />
      <YAxis width="auto" />
      <Legend verticalAlign="bottom" align="right" />
      <Tooltip />
    </LineChart>
   </div>
  );
}

export default Rechart;
