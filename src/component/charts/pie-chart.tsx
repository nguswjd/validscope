type Scores = {
  // 진입장벽
  marketBarriers: number;
  // 영향력
  influence: number;
  // 네트워크 난이도, 거버넌스
  networkGovernance: number;
  // 네트워크 건강도
  networkHealth: number;
  // 수익성
  profitability: number;
};

type PieChartProps = {
  data: {
    name: string;
    scores: Scores;
  }[];
};

import ReactECharts from "echarts-for-react";

function PieChart({ data }: PieChartProps) {
  if (!data || data.length === 0) return null;

  const chartData = [
    { name: "진입장벽", value: data[0].scores.marketBarriers },
    { name: "영향력", value: data[0].scores.influence },
    {
      name: "거버넌스",
      value: data[0].scores.networkGovernance,
    },
    {
      name: "네트워크 건강도",
      value: data[0].scores.networkHealth,
    },
    { name: "수익성", value: data[0].scores.profitability },
  ];

  const option = {
    tooltip: { trigger: "item" },
    legend: { top: "5%", left: "center" },
    series: [
      {
        name: data[0].name,
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 2 },
        label: { show: false, position: "center" },
        emphasis: { label: { show: true, fontSize: 20, fontWeight: "bold" } },
        labelLine: { show: false },
        data: chartData,
      },
    ],
  };

  return (
    <ReactECharts option={option} style={{ height: "400px", width: "100%" }} />
  );
}

export default PieChart;
