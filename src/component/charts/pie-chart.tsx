import ReactECharts from "echarts-for-react";

type Scores = {
  marketBarriers: number;
  influence: number;
  networkGovernance: number;
  networkHealth: number;
  profitability: number;
};

type PieChartProps = {
  data: {
    name: string;
    scores: Scores;
  }[];
};

export default function PieChart({ data }: PieChartProps) {
  if (!data || data.length === 0) return null;

  const chartData = [
    {
      name: "진입장벽",
      value: data[0].scores.marketBarriers,
      color: "#c2ddf8",
    },
    { name: "영향력", value: data[0].scores.influence, color: "#77b4f0" },
    {
      name: "거버넌스",
      value: data[0].scores.networkGovernance,
      color: "#4896ec",
    },
    {
      name: "네트워크 건강도",
      value: data[0].scores.networkHealth,
      color: "#3776cb",
    },
    { name: "수익성", value: data[0].scores.profitability, color: "#1f489b" },
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const isEmpty = total === 0;

  const option = {
    tooltip: { show: false },
    legend: { show: false },
    series: [
      {
        name: data[0].name,
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: false } },
        labelLine: { show: false },
        silent: true,
        data: isEmpty
          ? [
              {
                name: "empty",
                value: 1,
                itemStyle: {
                  color: "rgba(0, 0, 0, 0.02)",
                  borderColor: "#fff",
                  borderWidth: 2,
                  borderRadius: 10,
                  shadowBlur: 2,
                  shadowColor: "rgba(0, 0, 0, 0.11)",
                  shadowOffsetX: 1,
                  shadowOffsetY: 1,
                },
              },
            ]
          : chartData.map((item) => ({
              name: item.name,
              value: item.value,
              itemStyle: { color: item.color },
            })),
      },
    ],
  };

  return (
    <div>
      <ReactECharts
        option={option}
        style={{ height: "184px", width: "100%" }}
      />
      <div className="flex flex-col gap-3">
        {" "}
        {chartData.map((item) => {
          const percent = isEmpty
            ? "00%"
            : ((item.value / total) * 100).toFixed(0) + "%";
          const borderClass =
            item.name === "영향력" || item.name === "네트워크 건강도"
              ? "border-b border-gray-2 pb-2"
              : "";
          return (
            <div
              key={item.name}
              className={`flex justify-between mx-10 ${borderClass}`}
            >
              <div className="flex items-center">
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-light text-black">
                  {item.name}
                </span>
              </div>
              <span className="text-sm text-black font-normal ml-2">
                {percent}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
