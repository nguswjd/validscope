import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

type LineData = {
  name: string;
  value: number[];
};

type LineChartProps = {
  data: LineData[];
};
// 세로축 값 확인 필요
function LineChart({ data }: LineChartProps) {
  if (!data || data.length === 0) return null;

  const xAxisData = data[0].value.map((_, idx) => idx + 1);

  const series = data.map((d) => {
    const seriesData = d.value.map((v, idx, arr) => {
      const isOverlap = idx > 0 && arr[idx - 1] === v;
      return {
        value: v,
        symbol: isOverlap ? "circle" : "none",
        symbolSize: isOverlap ? 8 : 0,
      };
    });

    return {
      name: d.name,
      type: "line",
      data: seriesData,
      smooth: true,
      lineStyle: { color: "#4896ec", width: 2 },
      showSymbol: true,
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "#4896ec52" },
            { offset: 1, color: "transparent" },
          ],
        },
      },
    };
  });

  const option = {
    grid: { left: 40, right: 40, top: 40, bottom: 40 },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: xAxisData,
      axisLine: { show: true, lineStyle: { color: "#1f489b", width: 2 } },
      axisTick: { show: false },
      axisLabel: { fontSize: 10 },
      splitLine: {
        show: true,
        lineStyle: { color: "#DBDBDB", type: "dashed" },
      },
    },
    yAxis: {
      type: "value",
      axisLine: { show: true, lineStyle: { color: "#1f489b", width: 2 } },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    tooltip: { trigger: "axis" },
    legend: { show: false },
    series,
  };

  return (
    <ReactECharts
      echarts={echarts}
      option={option}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export default LineChart;
