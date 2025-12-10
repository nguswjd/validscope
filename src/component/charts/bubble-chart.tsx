import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

function BubbleChart() {
  const data = [
    [
      [28604, 77, 17096869, "Australia", 1990],
      [31163, 77.4, 27662440, "Canada", 1990],
      [1516, 68, 1154605773, "China", 1990],
    ],
    [
      [44056, 81.8, 23968973, "Australia", 2015],
      [43294, 81.7, 35939927, "Canada", 2015],
      [13334, 76.9, 1376048943, "China", 2015],
    ],
  ];

  const option = {
    backgroundColor: "#f7f8fa",
    title: {
      text: "Life Expectancy and GDP by Country",
      left: "5%",
      top: "3%",
    },
    legend: {
      right: "10%",
      top: "3%",
      data: ["1990", "2015"],
    },
    xAxis: {
      splitLine: { lineStyle: { type: "dashed" } },
    },
    yAxis: {
      splitLine: { lineStyle: { type: "dashed" } },
      scale: true,
    },
    series: [
      {
        name: "1990",
        type: "scatter",
        data: data[0],
        symbolSize: (d: number[]) => Math.sqrt(d[2]) / 5e2,
        emphasis: {
          focus: "series",
          label: {
            show: true,
            formatter: (param: { data: any[] }) => param.data[3],
            position: "top",
          },
        },
        itemStyle: {
          color: "rgba(100, 149, 237, 0.8)",
          shadowBlur: 10,
          shadowColor: "rgba(0, 0, 0, 0.2)",
          shadowOffsetY: 5,
        },
      },
      {
        name: "2015",
        type: "scatter",
        data: data[1],
        symbolSize: (d: number[]) => Math.sqrt(d[2]) / 5e2,
        emphasis: {
          focus: "series",
          label: {
            show: true,
            formatter: (param: { data: any[] }) => param.data[3],
            position: "top",
          },
        },
        itemStyle: {
          color: "rgba(65, 105, 225, 0.8)",
          shadowBlur: 10,
          shadowColor: "rgba(0, 0, 0, 0.2)",
          shadowOffsetY: 5,
        },
      },
    ],
  };

  return (
    <ReactECharts
      echarts={echarts}
      option={option}
      style={{ height: "500px", width: "100%" }}
    />
  );
}

export default BubbleChart;
