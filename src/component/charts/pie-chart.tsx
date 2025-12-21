import { useMemo } from "react";
import ReactECharts from "echarts-for-react";

type Scores = {
  entryScore: number;
  influenceScore: number;
  networkScore: number;
  govDevScore: number;
  profitScore: number;
};

type PieChartProps = {
  data: {
    name: string;
    scores: Scores;
  }[];
};

export default function PieChart({ data }: PieChartProps) {
  const { normalizedChartData, isEmpty, option } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        chartData: [],
        normalizedChartData: [],
        isEmpty: true,
        option: {},
      };
    }

    const chartData = [
      {
        name: "진입장벽",
        value: data[0].scores.entryScore,
        color: "#c2ddf8",
      },
      {
        name: "영향력",
        value: data[0].scores.influenceScore,
        color: "#77b4f0",
      },
      {
        name: "네트워크 난이도",
        value: data[0].scores.networkScore,
        color: "#4896ec",
      },
      {
        name: "거버넌스 개발",
        value: data[0].scores.govDevScore,
        color: "#3776cb",
      },
      {
        name: "수익성",
        value: data[0].scores.profitScore,
        color: "#1f489b",
      },
    ];

    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    const isEmpty = total === 0;

    const normalizedChartData = chartData.map((item) => ({
      ...item,
      normalizedValue: total > 0 ? (item.value / total) * 100 : 0,
    }));

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
            : normalizedChartData.map((item) => ({
                name: item.name,
                value: item.normalizedValue,
                itemStyle: { color: item.color },
              })),
        },
      ],
    };

    return { chartData, normalizedChartData, isEmpty, option };
  }, [data]);

  if (!data || data.length === 0) return null;

  return (
    <div>
      <ReactECharts
        option={option}
        style={{ height: "184px", width: "100%" }}
      />
      <div className="flex flex-col gap-3">
        {" "}
        {normalizedChartData.map((item, index) => {
          const percentage = isEmpty ? "0.00" : item.normalizedValue.toFixed(2);
          const borderClass =
            index < normalizedChartData.length - 1
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
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
