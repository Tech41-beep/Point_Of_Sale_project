import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  useActiveTooltipDataPoints,
  usePlotArea,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 5800 },
  { month: "Mar", revenue: 7200 },
  { month: "Apr", revenue: 6100 },
  { month: "May", revenue: 8900 },
  { month: "Jun", revenue: 7400 },
];

function PlotAreaFrame() {
  const plotArea = usePlotArea();

  if (!plotArea) return null;

  return (
    <rect
      {...plotArea}
      fill="none"
      stroke="#64748b"
      strokeDasharray="4 4"
    />
  );
}

function ActiveReadout() {
  const plotArea = usePlotArea();
  const activePoints = useActiveTooltipDataPoints();
  const point = activePoints?.[0];

  if (!plotArea || !point) return null;

  return (
    <text
      x={plotArea.x + 10}
      y={plotArea.y + 22}
      fill="#0ea5e9"
      fontSize={16}
      fontWeight={700}
    >
      {point.month}: {point.revenue}
    </text>
  );
}
export default function CustomElement() {
  return (
    <BarChart
      style={{
        width: "100%",
        maxWidth: 600,
        maxHeight: "70vh",
        aspectRatio: 1.618,
      }}
      responsive
      data={data}
      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip defaultIndex={4} />
      <Bar dataKey="revenue" fill="#0ea5e9" />
      <PlotAreaFrame />
      <ActiveReadout />
    </BarChart>
  );
}
