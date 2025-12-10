import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

type Scores = {
  marketBarriers: number;
  networkGovernance: number;
  profitability: number;
};

type BubbleChartProps = {
  data: { name: string; scores: Scores }[];
};

export default function BubbleChart({ data }: BubbleChartProps) {
  // chartDate 수정필요, 현재 상위에서 데이터를 받아와서 표시해주고 있음
  const chartData = data.map((b) => [
    b.scores.marketBarriers * 2,
    b.scores.profitability * 2,
    b.scores.networkGovernance * 50,
    b.name,
  ]);

  const option = {
    title: {
      text: "Select Bubble for more information",
      left: "12px",
      top: "0",
      textStyle: {
        fontSize: 12,
        fontWeight: 300,
        color: "#111111",
      },
    },
    grid: { left: 40, right: 40, top: 40, bottom: 40 },
    xAxis: {
      name: "gevDovScore",
      nameLocation: "center",
      nameGap: 10,
      nameTextStyle: { color: "#111111", fontSize: 10, fontWeight: 300 },
      type: "value",
      axisLine: { show: true, lineStyle: { color: "#1f489b", width: 2 } },
      splitLine: { show: false },
      axisLabel: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      name: "Health Score",
      nameLocation: "center",
      nameGap: 10,
      nameRotate: 90,
      nameTextStyle: { color: "#111111", fontSize: 10, fontWeight: 300 },
      type: "value",
      axisLine: { show: true, lineStyle: { color: "#1f489b", width: 2 } },
      splitLine: { show: false },
      axisLabel: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: "scatter",
        data: chartData,
        symbolSize: (d: number[]) => Math.sqrt(d[2]),
        emphasis: {
          focus: "series",
          label: {
            show: true,
            formatter: (param: any) => param.data[3],
            position: "top",
          },
        },
        itemStyle: { color: "#5da4ef" },
      },
    ],
  };

  return (
    <ReactECharts
      echarts={echarts}
      option={option}
      style={{ height: "100%", width: "100%" }}
    />
  );
}
