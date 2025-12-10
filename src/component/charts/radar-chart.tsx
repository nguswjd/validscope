import ReactECharts from "echarts-for-react";

function RadarChart() {
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
      axisName: {
        fontWeight: 400,
        fontSize: 11,
        color: "#111111",
      },
      splitLine: {
        lineStyle: {
          color: "#c2ddf8",
          width: 1,
        },
      },
      splitArea: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: "#c2ddf8",
        },
      },
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: [4200, 3000, 20000, 35000, 50000],
            name: "Allocated Budget",
            lineStyle: { width: 2 },
            areaStyle: { opacity: 0 },
          },
          {
            value: [5000, 14000, 28000, 26000, 42000],
            name: "Actual Spending",
            lineStyle: { width: 2 },
            areaStyle: { opacity: 0 },
          },
        ],
      },
    ],
  };

  return (
    <ReactECharts option={option} style={{ height: "400px", width: "100%" }} />
  );
}

export default RadarChart;
