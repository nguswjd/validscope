import { useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

type Scores = {
  marketBarriers: number;
  networkGovernance: number;
  profitability: number;
};

type BubbleChartProps = {
  data: { name: string; scores: Scores }[];
  onSelectBlockchain: (name: string) => void;
  selectedBlockchains: { name: string; scores: Scores }[];
};

type BubbleChartHintProps = {
  label: string;
  value: string | number;
};

function BubbleChartHint({ label, value }: BubbleChartHintProps) {
  return (
    <div className="h-9 border border-gray-2 text-gray-2 flex justify-between items-center px-2 py-3 rounded-sm">
      <p className="font-light text-[10px] text-black">{label}</p>
      <span className="text-blue-8">{value}</span>
    </div>
  );
}

export default function BubbleChart({
  data,
  onSelectBlockchain,
  selectedBlockchains,
}: BubbleChartProps) {
  const colors = ["#5da4ef", "#64b875", "#785bbc", "#f24949"];

  const chartData = data.map((b) => {
    const selectedIndex = selectedBlockchains.findIndex(
      (selected) => selected.name === b.name
    );
    let color;

    if (selectedBlockchains.length === 0) {
      color = "#5da4ef";
    } else {
      color =
        selectedIndex !== -1
          ? colors[selectedIndex]
          : "rgba(93, 164, 239, 0.3)";
    }

    return [
      b.scores.marketBarriers * 2,
      b.scores.profitability * 2,
      b.scores.networkGovernance * 50,
      b.name,
      color,
    ];
  });

  const [hintValues, setHintValues] = useState({
    x: "00",
    y: "00",
    bubble: "00",
  });

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
        symbolSize: (d: any[]) => Math.sqrt(d[2]),
        emphasis: {
          focus: "series",
          label: {
            show: true,
            formatter: (param: any) => param.data[3],
            position: "top",
          },
        },
        itemStyle: {
          color: (params: any) => params.data[4],
        },
      },
    ],
  };

  const onEvents = {
    click: (params: any) => {
      if (!params?.data) return;
      const blockchainName = params.data[3];
      onSelectBlockchain(blockchainName);
    },
    mouseover: (params: any) => {
      if (!params?.data) return;
      const [x, y, bubble] = params.data;
      setHintValues({
        x: x.toFixed(0),
        y: y.toFixed(0),
        bubble: bubble.toFixed(0),
      });
    },
    mouseout: () => {
      setHintValues({ x: "00", y: "00", bubble: "00" });
    },
  };

  return (
    <div className="h-full">
      <ReactECharts
        echarts={echarts}
        option={option}
        onEvents={onEvents}
        style={{ height: "320px", width: "100%" }}
      />
      <div className="grid grid-cols-3 mx-10 gap-3">
        <BubbleChartHint label="X-axis : gevDov Score" value={hintValues.x} />
        <BubbleChartHint label="Y-axis : Health Score" value={hintValues.y} />
        <BubbleChartHint
          label="Bubble Scale : Influence Score"
          value={hintValues.bubble}
        />
      </div>
    </div>
  );
}
