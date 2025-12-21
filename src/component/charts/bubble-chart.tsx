import { useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

import agoricImg from "../../assets/blockchains/agoric.png";
import akashImg from "../../assets/blockchains/akash.png";
import altheaImg from "../../assets/blockchains/althea.png";
import archwayImg from "../../assets/blockchains/archway.png";
import atomoneImg from "../../assets/blockchains/atomone.png";
import axelarImg from "../../assets/blockchains/axelar.png";
import bandImg from "../../assets/blockchains/band.png";
import celestiaImg from "../../assets/blockchains/celestia.png";
import chihuahuaImg from "../../assets/blockchains/chihuahua.png";
import coreumImg from "../../assets/blockchains/coreum.png";
import cosmosHubImg from "../../assets/blockchains/cosmos_hub.png";
import dydxImg from "../../assets/blockchains/dydx.png";
import gravityBridgeImg from "../../assets/blockchains/gravity_bridge.png";
import humansAiImg from "../../assets/blockchains/humans_ai.png";
import injectiveImg from "../../assets/blockchains/injective.png";
import kavaImg from "../../assets/blockchains/kava.png";
import mantraImg from "../../assets/blockchains/mantra.png";
import mediblocImg from "../../assets/blockchains/medibloc.png";
import milkywayImg from "../../assets/blockchains/milkyway.png";
import nillionImg from "../../assets/blockchains/nillion.png";
import osmosisImg from "../../assets/blockchains/osmosis.png";
import persistenceImg from "../../assets/blockchains/persistence.png";
import regenImg from "../../assets/blockchains/regen.png";
import secretImg from "../../assets/blockchains/secret.png";
import shentuImg from "../../assets/blockchains/shentu.png";
import stargazeImg from "../../assets/blockchains/stargaze.png";
import terraImg from "../../assets/blockchains/terra.png";
import xionImg from "../../assets/blockchains/xion.png";
import xplaImg from "../../assets/blockchains/xpla.png";

const blockchainImages: Record<string, string> = {
  "COSMOS HUB": cosmosHubImg,
  ATOMONE: atomoneImg,
  OSMOSIS: osmosisImg,
  AKASH: akashImg,
  AGORIC: agoricImg,
  ALTHEA: altheaImg,
  ARCHWAY: archwayImg,
  AXELAR: axelarImg,
  BAND: bandImg,
  CELESTIA: celestiaImg,
  CHIHUAHUA: chihuahuaImg,
  COREUM: coreumImg,
  DYDX: dydxImg,
  "GRAVITY BRIDGE": gravityBridgeImg,
  HUMANS: humansAiImg,
  INJECTIVE: injectiveImg,
  KAVA: kavaImg,
  MANTRA: mantraImg,
  MEDIBLOC: mediblocImg,
  MILKYWAY: milkywayImg,
  NILLION: nillionImg,
  PERSISTENCE: persistenceImg,
  REGEN: regenImg,
  SECRET: secretImg,
  SHENTU: shentuImg,
  STARGAZE: stargazeImg,
  TERRA: terraImg,
  XION: xionImg,
  XPLA: xplaImg,
};

type Scores = {
  marketBarriers: number;
  networkGovernance: number;
  profitability: number;
  rawMarketBarriers?: number;
  rawProfitability?: number;
};

type BubbleChartProps = {
  data: { name: string; scores: Scores }[];
  onSelectBlockchain: (name: string) => void;
  selectedBlockchains: { name: string; scores: Scores }[];
  onHover: (name: string | null) => void;
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
  onHover,
}: BubbleChartProps) {
  const colors = ["#5da4ef", "#64b875", "#785bbc", "#f24949"];

  const xValues = data.map(
    (b) => b.scores.rawMarketBarriers ?? b.scores.marketBarriers
  );
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const rangeX = maxX - minX || 1;

  const yValues = data.map(
    (b) => b.scores.rawProfitability ?? b.scores.profitability
  );
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const rangeY = maxY - minY || 1;

  const chartData = data.map((b) => {
    const selectedIndex = selectedBlockchains.findIndex(
      (selected) => selected.name === b.name
    );
    const isSelected = selectedIndex !== -1;
    const isAnySelected = selectedBlockchains.length > 0;

    let borderColor;
    if (isSelected) {
      borderColor = colors[selectedIndex];
    } else if (isAnySelected) {
      borderColor = "rgba(0,0,0,0.1)";
    } else {
      borderColor = "#5da4ef";
    }

    const opacity = !isAnySelected || isSelected ? 1 : 0.25;
    const borderWidth = isSelected ? 3 : 1;

    const xRaw = b.scores.rawMarketBarriers ?? b.scores.marketBarriers;
    const yRaw = b.scores.rawProfitability ?? b.scores.profitability;

    const xValue = ((xRaw - minX) / rangeX) * 100;
    const yValue = ((yRaw - minY) / rangeY) * 100;

    const bubbleSize = b.scores.networkGovernance * 100;
    const bubbleOriginalValue = b.scores.networkGovernance;

    const imgSrc = blockchainImages[b.name];

    return {
      value: [
        xValue,
        yValue,
        bubbleSize,
        b.name,
        borderColor,
        opacity,
        borderWidth,
        xRaw,
        yRaw,
        bubbleOriginalValue,
      ],
      imgSrc: imgSrc,
    };
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
    tooltip: {
      show: true,
      trigger: "item",
      position: "top",
      confine: true,
      formatter: (params: any) => params.data.value[3],
      backgroundColor: "#ffffff",
      padding: [4, 8],
      borderRadius: 4,
      textStyle: {
        color: "#111111",
        fontSize: 12,
        fontWeight: 400,
      },
      borderWidth: 0,
      extraCssText: "box-shadow: none; z-index: 100;",
    },
    grid: { left: 40, right: 40, top: 60, bottom: 40 },
    xAxis: {
      name: "거버넌스/개발",
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
      name: "건강도",
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
        name: "Background Circle",
        type: "scatter",
        data: chartData.map((d) => ({
          value: d.value,
          itemStyle: {
            color: "#ffffff",
            borderColor: d.value[4],
            borderWidth: d.value[6],
            opacity: d.value[5],
          },
        })),
        symbol: "circle",
        symbolSize: (d: any[]) => Math.sqrt(d[2]) * 1.5,
        label: { show: false },
        z: 1,
        animation: true,
      },
      {
        name: "Logo Image",
        type: "scatter",
        data: chartData.map((d) => ({
          value: d.value,
          symbol: d.imgSrc ? `image://${d.imgSrc}` : "circle",
          itemStyle: {
            opacity: d.value[5],
          },
        })),
        symbolSize: (d: any[]) => Math.sqrt(d[2]) * 1.5 * 0.7,
        label: {
          show: false,
        },
        emphasis: {
          scale: true,
          focus: "series",
        },
        z: 2,
      },
    ],
  };

  const onEvents = {
    click: (params: any) => {
      if (!params?.data) return;
      const blockchainName = params.data.value[3];
      onSelectBlockchain(blockchainName);
    },
    mouseover: (params: any) => {
      if (!params?.data) return;
      const values = params.data.value;
      const originalX = values[7];
      const originalY = values[8];
      const originalBubble = values[9];
      const x = values[0];
      const y = values[1];
      const bubble = values[2];
      const name = values[3];

      setHintValues({
        x: originalX !== undefined ? originalX.toFixed(2) : x.toFixed(2),
        y: originalY !== undefined ? originalY.toFixed(2) : y.toFixed(2),
        bubble:
          originalBubble !== undefined
            ? originalBubble.toFixed(2)
            : bubble.toFixed(2),
      });

      if (onHover) {
        onHover(name);
      }
    },
    mouseout: () => {
      setHintValues({ x: "0.00", y: "0.00", bubble: "0.00" });
      if (onHover) {
        onHover(null);
      }
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
        <BubbleChartHint label="X축 : 거버넌스/개발" value={hintValues.x} />
        <BubbleChartHint label="Y축 : 건강도" value={hintValues.y} />
        <BubbleChartHint label="버블 크기 : 영향력" value={hintValues.bubble} />
      </div>
    </div>
  );
}
