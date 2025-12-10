import ReactECharts from "echarts-for-react";

type RadarData = {
  name: string;
  value: number[];
  color: string;
};

type RadarChartProps = {
  data: RadarData[];
};

function RadarChart({ data }: RadarChartProps) {
  const option = {
    radar: {
      shape: "circle",
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
        data: data.map((item) => ({
          name: item.name,
          value: item.value,
          lineStyle: { width: 2, color: item.color },
          areaStyle: {
            color: item.color + "40",
          },
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
    <ReactECharts option={option} style={{ height: "400px", width: "100%" }} />
  );
}

export default RadarChart;
