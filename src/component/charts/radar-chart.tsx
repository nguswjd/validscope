import ReactECharts from "echarts-for-react";

type Scores = {
  marketBarriers: number;
  networkGovernance: number;
  profitability: number;
};

type RadarChartProps = {
  selectedBlockchains: { name: string; scores: Scores }[];
};

function RadarChart({ selectedBlockchains }: RadarChartProps) {
  const colors = ["#5da4ef", "#64b875", "#785bbc", "#f24949"];

  const radarData = selectedBlockchains.slice(0, 4).map((blockchain, index) => {
    const scores = blockchain.scores;
    return {
      name: blockchain.name,
      value: [
        scores.marketBarriers * 100,
        scores.marketBarriers * 200,
        scores.networkGovernance * 400,
        scores.networkGovernance * 500,
        scores.profitability * 600,
      ],
      color: colors[index],
    };
  });

  const option = {
    radar: {
      shape: "circle",
      radius: "70%",
      indicator: [
        { name: "진입장벽", max: 6500 },
        { name: "영향력", max: 16000 },
        { name: "네트워크 난이도", max: 30000 },
        { name: "거버넌스", max: 38000 },
        { name: "수익성", max: 52000 },
      ],
      axisName: { fontWeight: 400, fontSize: 11, color: "#111111" },
      splitLine: { lineStyle: { color: "#c2ddf8", width: 1 } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: "#c2ddf8" } },
    },
    series: [
      {
        type: "radar",
        data: radarData.map((item) => ({
          name: item.name,
          value: item.value,
          lineStyle: { width: 2, color: item.color },
          areaStyle: { color: item.color + "40" },
          symbol: "circle",
          symbolSize: 6,
          itemStyle: {
            color: "#ffffff",
            borderColor: item.color,
            borderWidth: 2,
          },
        })),
      },
    ],
  };

  return (
    <ReactECharts option={option} style={{ width: "100%", height: "100%" }} />
  );
}

export default RadarChart;
