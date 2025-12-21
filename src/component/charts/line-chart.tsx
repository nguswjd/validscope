import { useMemo, useState, useRef } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { X } from "lucide-react";

type Scores = {
  marketBarriers: number;
  networkGovernance: number;
  profitability: number;
  rawMarketBarriers?: number;
  rawProfitability?: number;
  rawEntryScore?: number;
  rawInfluenceScore?: number;
  rawNetworkScore?: number;
  rawGovDevScore?: number;
  rawProfitScore?: number;
};

type LineChartProps = {
  allBlockchains: { name: string; scores: Scores }[];
  selectedBlockchainName: string;
  rawMetrics?: { name: string; data: Record<string, number> }[];
  capital?: number;
};

type TooltipItem = {
  title: string;
  content: string;
  indicatorKey: string;
};

type TooltipState = {
  visible: boolean;
  x: number;
  y: number;
  items: TooltipItem[];
} | null;

function normalDistribution(x: number): number {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function zScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

function LineChart({
  allBlockchains,
  selectedBlockchainName,
  rawMetrics = [],
  capital = 50,
}: LineChartProps) {
  const chartRef = useRef<ReactECharts>(null);
  const [tooltipData, setTooltipData] = useState<TooltipState>(null);

  const { normalDistributionData, indicatorZScores, xRange } = useMemo(() => {
    if (!allBlockchains || allBlockchains.length === 0) {
      return {
        normalDistributionData: [],
        indicatorZScores: {
          influence: 0,
          entry: 0,
          profit: 0,
          network: 0,
          govDev: 0,
        },
        xRange: [],
      };
    }

    const entryScores: number[] = [];
    const influenceScores: number[] = [];
    const networkScores: number[] = [];
    const govDevScores: number[] = [];
    const profitScores: number[] = [];

    allBlockchains.forEach((blockchain) => {
      const scores = blockchain.scores;
      entryScores.push(scores.rawEntryScore ?? 0);
      influenceScores.push(scores.rawInfluenceScore ?? 0);
      networkScores.push(scores.rawNetworkScore ?? 0);
      govDevScores.push(scores.rawGovDevScore ?? 0);
      profitScores.push(scores.rawProfitScore ?? 0);
    });

    const stats = {
      entry: {
        mean: mean(entryScores),
        stdDev: standardDeviation(entryScores),
      },
      influence: {
        mean: mean(influenceScores),
        stdDev: standardDeviation(influenceScores),
      },
      network: {
        mean: mean(networkScores),
        stdDev: standardDeviation(networkScores),
      },
      govDev: {
        mean: mean(govDevScores),
        stdDev: standardDeviation(govDevScores),
      },
      profit: {
        mean: mean(profitScores),
        stdDev: standardDeviation(profitScores),
      },
    };

    const selectedBlockchain = allBlockchains.find(
      (b) => b.name === selectedBlockchainName
    );

    let entryZ = 0;
    let influenceZ = 0;
    let networkZ = 0;
    let govDevZ = 0;
    let profitZ = 0;

    if (selectedBlockchain) {
      const scores = selectedBlockchain.scores;
      entryZ = zScore(
        scores.rawEntryScore ?? 0,
        stats.entry.mean,
        stats.entry.stdDev
      );
      influenceZ = zScore(
        scores.rawInfluenceScore ?? 0,
        stats.influence.mean,
        stats.influence.stdDev
      );
      networkZ = zScore(
        scores.rawNetworkScore ?? 0,
        stats.network.mean,
        stats.network.stdDev
      );
      govDevZ = zScore(
        scores.rawGovDevScore ?? 0,
        stats.govDev.mean,
        stats.govDev.stdDev
      );
      profitZ = zScore(
        scores.rawProfitScore ?? 0,
        stats.profit.mean,
        stats.profit.stdDev
      );
    }

    const indicatorZScores = {
      influence: influenceZ,
      entry: -entryZ,
      profit: profitZ,
      network: networkZ,
      govDev: govDevZ,
    };

    const xRange: number[] = [];
    const normalDistributionData: number[] = [];
    const step = 0.1;
    for (let x = -3; x <= 3; x += step) {
      xRange.push(Number(x.toFixed(1)));
      normalDistributionData.push(normalDistribution(x));
    }

    return {
      normalDistributionData,
      indicatorZScores,
      xRange,
    };
  }, [allBlockchains, selectedBlockchainName]);

  const hasSelectedBlockchain =
    selectedBlockchainName && selectedBlockchainName.trim() !== "";

  const percentile25 = -0.674;
  const percentile75 = 0.674;

  const selectedRawMetrics = rawMetrics.find(
    (m) => m.name === selectedBlockchainName
  );

  const getTooltipContentBody = (indicatorName: string) => {
    if (!selectedRawMetrics) return "";

    const metrics = selectedRawMetrics.data;
    const cutoff = Number(metrics["cutoff_token"] ?? 0);
    const nact = metrics["Nact"] ?? 0;
    const totalStaked = metrics["total_staked"] ?? 0;
    const top10Share = metrics["top10_share"] ?? 0;
    const nakamoto33 = metrics["nakamoto33"] ?? 0;
    const govTurnout = metrics["gov_turnout_ratio_est"] ?? 0;
    const missRatio = metrics["miss_ratio"] ?? 0;
    const hhi = metrics["hhi_token"] ?? 0;
    const apr = metrics["apr"] ?? 0;
    const uptime = metrics["uptime"] ?? null;
    const activeAddressesTrend = metrics["active_addresses_trend"] ?? null;

    let devActivityText = "";
    if (govTurnout * 100 >= 50) {
      devActivityText = "🟢 꾸준함";
    } else if (govTurnout * 100 >= 10) {
      devActivityText = "🟡 보통";
    } else {
      devActivityText = "🔴 활동 없음";
    }

    const userShare =
      totalStaked > 0 && capital && capital > 0
        ? (capital / totalStaked) * 100
        : 0;
    const votingPower =
      totalStaked > 0 && capital && capital > 0
        ? (capital / totalStaked) * 100
        : 0;

    let cutoffText = "";
    const cutoffNum = Number(cutoff) || 0;
    const capitalNum = Number(capital) || 0;

    if (cutoffNum > 0) {
      if (capitalNum > cutoffNum) {
        cutoffText = "🟢 가능";
      } else if (capitalNum < cutoffNum) {
        cutoffText = "🔴 진입불가";
      } else {
        cutoffText = "🟡 주의";
      }
    }

    const missRatioPercent = missRatio * 100;
    let blockMissRatioStatus = "";
    if (missRatioPercent <= 1) {
      blockMissRatioStatus = "🟢 안정";
    } else if (missRatioPercent <= 5) {
      blockMissRatioStatus = "🟡 주의";
    } else {
      blockMissRatioStatus = "🔴 위험";
    }

    let hhiStatus = "";
    if (hhi < 0.1) {
      hhiStatus = "🟢 분산 양호";
    } else if (hhi <= 0.18) {
      hhiStatus = "🟡 중간";
    } else {
      hhiStatus = "🔴 고집중";
    }

    let uptimeStatus = "";
    if (uptime !== null && uptime !== undefined) {
      if (uptime >= 99) {
        uptimeStatus = "🟢 안정";
      } else if (uptime >= 97) {
        uptimeStatus = "🟡 주의";
      } else {
        uptimeStatus = "🔴 위험";
      }
    }

    let activeAddressesStatus = "";
    if (activeAddressesTrend !== null && activeAddressesTrend !== undefined) {
      const trend = String(activeAddressesTrend).toLowerCase();
      if (trend === "increase" || trend === "stable") {
        activeAddressesStatus = "🟢 분산 양호";
      } else if (trend === "stable" || trend === "stagnant") {
        activeAddressesStatus = "🟡 주의";
      } else if (trend === "decrease" || trend === "decline") {
        activeAddressesStatus = "🔴 위험";
      }
    }

    const annualProfit = capital * apr;

    const makeRow = (label: string, value: string | number) => {
      return `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 12px; color: #999999; margin-right: 8px;">${label}</span>
        <span style="font-size: 14px; font-weight: 500; color: #111111; text-align: right;">${value}</span>
      </div>`;
    };

    let info = "";

    if (indicatorName === "Influence") {
      info += makeRow("TotalStaked", totalStaked.toLocaleString());
      const userShareFormatted =
        userShare > 0 && userShare < 0.0001
          ? userShare.toFixed(6)
          : userShare.toFixed(4);
      info += makeRow(
        "Top-k",
        `${(top10Share * 100).toFixed(2)}% / ${userShareFormatted}%`
      );
      info += makeRow("Nakamoto Coeff.", `🛡 ${nakamoto33} validators`);
      const votingPowerFormatted =
        votingPower > 0 && votingPower < 0.01
          ? votingPower.toFixed(6)
          : votingPower.toFixed(2);
      info += makeRow("VotingPower", `🔈 ${votingPowerFormatted}%`);
    } else if (indicatorName === "Entry") {
      info += makeRow("Cutoff", cutoffText);
      info += makeRow(
        "Active set size",
        `${nact.toLocaleString()}/${nact.toLocaleString()}`
      );
    } else if (indicatorName === "Profit") {
      info += makeRow(
        "연간 예상 수익",
        `약 ${annualProfit.toLocaleString()} USD`
      );
    } else if (indicatorName === "Network") {
      info += makeRow("Block Miss Ratio", blockMissRatioStatus);
      if (uptimeStatus) {
        info += makeRow("Uptime", uptimeStatus);
      }
      info += makeRow("HHI", hhiStatus);
      if (activeAddressesStatus) {
        info += makeRow("Active Addresses", activeAddressesStatus);
      }
    } else if (indicatorName === "GovDev") {
      info += makeRow(
        "Governance Participation",
        `🗳️ ${(govTurnout * 100).toFixed(0)}%`
      );
      info += makeRow("개발자 활동", devActivityText);
    }

    return info;
  };

  const distributionSeries = {
    name: "Normal Distribution",
    type: "line",
    data: normalDistributionData.map((y, idx) => [xRange[idx], y]),
    smooth: true,
    showSymbol: false,
    lineStyle: { color: "#4896ec", width: 2 },
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
    markLine: {
      silent: true,
      data: [
        {
          xAxis: percentile25,
          lineStyle: { color: "#999", type: "dashed", width: 1 },
          label: { show: false },
        },
        {
          xAxis: percentile75,
          lineStyle: { color: "#999", type: "dashed", width: 1 },
          label: { show: false },
        },
      ],
      symbol: "none",
    },
  };

  const createDotSeries = (name: string, data: number[], label: string) => [
    {
      name: name,
      type: "scatter",
      data: [data],
      symbolSize: 60,
      itemStyle: { color: "transparent", borderColor: "transparent" },
      z: 1,
      cursor: "pointer",
    },
    {
      name: `${name}_visible`,
      type: "scatter",
      data: [data],
      symbolSize: 10,
      itemStyle: {
        color: "#ffffff",
        borderColor: "#4896ec",
        borderWidth: 2,
        shadowBlur: 15,
        shadowColor: "rgba(72, 150, 236, 0.5)",
      },
      label: {
        show: true,
        position: "top",
        formatter: label,
        fontSize: 10,
        color: "#1f489b",
        fontWeight: "normal",
        padding: [10, 15],
      },
      tooltip: { show: false },
      z: 2,
      cursor: "pointer",
    },
  ];

  const dotSeries = hasSelectedBlockchain
    ? [
        ...createDotSeries(
          "Influence",
          [
            indicatorZScores.influence,
            normalDistribution(indicatorZScores.influence),
          ],
          "Influence"
        ),
        ...createDotSeries(
          "Entry",
          [indicatorZScores.entry, normalDistribution(indicatorZScores.entry)],
          "Entry"
        ),
        ...createDotSeries(
          "Profit",
          [
            indicatorZScores.profit,
            normalDistribution(indicatorZScores.profit),
          ],
          "Profit"
        ),
        ...createDotSeries(
          "Network",
          [
            indicatorZScores.network,
            normalDistribution(indicatorZScores.network),
          ],
          "Network"
        ),
        ...createDotSeries(
          "GovDev",
          [
            indicatorZScores.govDev,
            normalDistribution(indicatorZScores.govDev),
          ],
          "GovDev"
        ),
      ]
    : [];

  const option = {
    grid: { left: 50, right: 50, top: 50, bottom: 50 },
    xAxis: {
      type: "value",
      min: -3,
      max: 3,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 10 },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 10 },
      splitLine: { show: false },
    },
    tooltip: { show: false },
    legend: { show: false },
    series: [distributionSeries, ...dotSeries],
  };

  const handleChartClick = (params: any) => {
    if (
      params.componentType === "series" &&
      params.seriesType === "scatter" &&
      (params.seriesName.endsWith("_visible") ||
        ["Influence", "Entry", "Profit", "Network", "GovDev"].includes(
          params.seriesName
        ))
    ) {
      const clickedXValue = params.data[0];

      const VISUAL_OVERLAP_THRESHOLD = 0.3;

      const keyMapping: Record<string, string> = {
        influence: "Influence",
        entry: "Entry",
        profit: "Profit",
        network: "Network",
        govDev: "GovDev",
      };

      const titleMap: Record<string, string> = {
        govDev: "거버넌스/개발",
        entry: "진입장벽",
        network: "네트워크 난이도",
        profit: "수익성",
        influence: "영향력",
      };

      const overlappingKeys = Object.entries(indicatorZScores)
        .filter(
          ([_, score]) =>
            Math.abs(score - clickedXValue) < VISUAL_OVERLAP_THRESHOLD
        )
        .map(([key]) => key);

      const items: TooltipItem[] = overlappingKeys.map((key) => {
        const upperKey = keyMapping[key];
        return {
          indicatorKey: key,
          title: titleMap[key] || upperKey,
          content: getTooltipContentBody(upperKey),
        };
      });

      if (items.length === 0) return;

      const echartsInstance = chartRef.current?.getEchartsInstance();
      if (echartsInstance) {
        const pointPixel = echartsInstance.convertToPixel(
          { seriesIndex: params.seriesIndex },
          params.data
        ) as unknown as [number, number];

        if (pointPixel) {
          setTooltipData({
            visible: true,
            x: pointPixel[0],
            y: pointPixel[1],
            items: items,
          });
        }
      }
    }
  };

  if (!allBlockchains || allBlockchains.length === 0) return null;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ReactECharts
        ref={chartRef}
        echarts={echarts}
        option={option}
        style={{ width: "100%", height: "100%" }}
        onEvents={{
          click: handleChartClick,
        }}
      />

      {tooltipData && tooltipData.visible && (
        <div
          style={{
            position: "absolute",
            left: tooltipData.x,
            top: tooltipData.y,
            transform: "translate(-50%, -100%)",
            marginTop: "-15px",
            zIndex: 100,
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              width: "260px",
              background: "white",
              padding: "0",
              borderRadius: "12px",
              boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.15)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 10,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTooltipData(null);
                }}
                style={{
                  background: "rgba(255,255,255,0.8)",
                  border: "none",
                  cursor: "pointer",
                  color: "#999",
                  padding: "4px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {tooltipData.items.map((item, index) => (
                <div
                  key={item.indicatorKey}
                  style={{
                    padding: "15px 20px",
                    borderBottom:
                      index < tooltipData.items.length - 1
                        ? "1px solid #f0f0f0"
                        : "none",
                    background: index % 2 === 0 ? "#fff" : "#fafafa",
                  }}
                >
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#000",
                      marginBottom: "8px",
                      paddingRight: "20px",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#333",
                      lineHeight: "1.5",
                    }}
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "-8px",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid white",
              filter: "drop-shadow(0px 2px 1px rgba(0,0,0,0.05))",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default LineChart;
