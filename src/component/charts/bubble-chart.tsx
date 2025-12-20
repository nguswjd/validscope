import { useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

type Scores = {
  marketBarriers: number;
  networkGovernance: number;
  profitability: number;
  rawMarketBarriers?: number; // 원본 점수 (0~100)
  rawProfitability?: number; // 원본 점수 (0~100)
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

  // X축 데이터의 최소값과 최대값 계산 (min-max 정규화용)
  const xValues = data.map(
    (b) => b.scores.rawMarketBarriers ?? b.scores.marketBarriers
  );
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const rangeX = maxX - minX || 1; // 0으로 나누는 것 방지

  // Y축 데이터의 최소값과 최대값 계산 (min-max 정규화용)
  const yValues = data.map(
    (b) => b.scores.rawProfitability ?? b.scores.profitability
  );
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const rangeY = maxY - minY || 1; // 0으로 나누는 것 방지

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

    // 원본 점수 (0~100 범위)
    const xRaw = b.scores.rawMarketBarriers ?? b.scores.marketBarriers;
    const yRaw = b.scores.rawProfitability ?? b.scores.profitability;

    // X축과 Y축에 min-max 정규화 적용 (0~100 범위로 스케일링)
    const xValue = ((xRaw - minX) / rangeX) * 100;
    const yValue = ((yRaw - minY) / rangeY) * 100;

    // 버블 크기는 2배로 표시하되, hint에는 원래 값 표시
    const bubbleSize = b.scores.networkGovernance * 100; // 2배로 표시
    const bubbleOriginalValue = b.scores.networkGovernance; // 원래 값 (hint용)

    return [
      xValue, // X축 min-max 정규화된 값
      yValue, // Y축 min-max 정규화된 값
      bubbleSize, // 버블 scale (2배)
      b.name,
      color,
      xRaw, // 원본 X값 (hint 표시용)
      yRaw, // 원본 Y값 (hint 표시용)
      bubbleOriginalValue, // 원본 버블 값 (hint 표시용)
    ];
  });

  const [hintValues, setHintValues] = useState({
    x: "0.00",
    y: "0.00",
    bubble: "0.00",
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
    grid: { left: 40, right: 40, top: 60, bottom: 40 },
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
      min: 0,
      max: 100,
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
      min: 0,
      max: 100,
    },
    series: [
      {
        type: "scatter",
        data: chartData,
        symbolSize: (d: any[]) => Math.sqrt(d[2]),
        label: {
          show: false,
        },
        emphasis: {
          focus: "series",
          label: {
            show: false,
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
      const [x, y, bubble, , , originalX, originalY, originalBubble] =
        params.data;
      // hint에는 원래 값 표시
      setHintValues({
        x: originalX !== undefined ? originalX.toFixed(2) : x.toFixed(2),
        y: originalY !== undefined ? originalY.toFixed(2) : y.toFixed(2),
        bubble:
          originalBubble !== undefined
            ? originalBubble.toFixed(2)
            : bubble.toFixed(2),
      });
    },
    mouseout: () => {
      setHintValues({ x: "0.00", y: "0.00", bubble: "0.00" });
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
