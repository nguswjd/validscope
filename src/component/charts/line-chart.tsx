import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

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

// 정규분포 밀도 함수 (표준 정규분포: μ=0, σ=1)
function normalDistribution(x: number): number {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

// 평균 계산
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

// 표준편차 계산
function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / values.length;
  return Math.sqrt(variance);
}

// Z-score 계산
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

    // Step 1: 각 블록체인별 5가지 점수 배열화
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

    // Step 2: 각 점수 배열에서 평균과 표준편차 계산
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

    // Step 3 & 4: 선택한 블록체인의 Z-score 계산 및 방향 처리
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

    // 각 지표별 Z-score (순서: 영향력, 진입장벽, 수익, 안정성, 개발 거버넌스)
    const indicatorZScores = {
      influence: influenceZ,
      entry: -entryZ,
      profit: profitZ,
      network: networkZ,
      govDev: govDevZ,
    };

    // Step 5: 정규분포 데이터 가공 (x_range = [-3, +3])
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

  if (!allBlockchains || allBlockchains.length === 0) return null;

  const hasSelectedBlockchain =
    selectedBlockchainName && selectedBlockchainName.trim() !== "";

  const percentile25 = -0.674;
  const percentile75 = 0.674;

  const selectedRawMetrics = rawMetrics.find(
    (m) => m.name === selectedBlockchainName
  );

  const getTooltipInfo = (indicatorName: string) => {
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
      return `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="color: #666; margin-right: 8px;">${label}</span>
        <span style="font-weight: 500; color: #000; text-align: right;">${value}</span>
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

  const dotSeries = hasSelectedBlockchain
    ? [
        {
          name: "Influence",
          type: "scatter",
          data: [
            [
              indicatorZScores.influence,
              normalDistribution(indicatorZScores.influence),
            ],
          ],
          symbolSize: 30,
          itemStyle: {
            color: "transparent",
            borderColor: "transparent",
          },
          z: 1,
        },
        {
          name: "Influence_visible",
          type: "scatter",
          data: [
            [
              indicatorZScores.influence,
              normalDistribution(indicatorZScores.influence),
            ],
          ],
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
            formatter: "Influence",
            fontSize: 10,
            color: "#1f489b",
            fontWeight: "normal",
            padding: [10, 15],
          },
          tooltip: {
            show: false,
          },
          z: 2,
        },
        {
          name: "Entry",
          type: "scatter",
          data: [
            [
              indicatorZScores.entry,
              normalDistribution(indicatorZScores.entry),
            ],
          ],
          symbolSize: 30,
          itemStyle: {
            color: "transparent",
            borderColor: "transparent",
          },
          z: 1,
        },
        {
          name: "Entry_visible",
          type: "scatter",
          data: [
            [
              indicatorZScores.entry,
              normalDistribution(indicatorZScores.entry),
            ],
          ],
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
            formatter: "Entry",
            fontSize: 10,
            color: "#1f489b",
            fontWeight: "normal",
            padding: [10, 15],
          },
          tooltip: {
            show: false,
          },
          z: 2,
        },
        {
          name: "Profit",
          type: "scatter",
          data: [
            [
              indicatorZScores.profit,
              normalDistribution(indicatorZScores.profit),
            ],
          ],
          symbolSize: 30,
          itemStyle: {
            color: "transparent",
            borderColor: "transparent",
          },
          z: 1,
        },
        {
          name: "Profit_visible",
          type: "scatter",
          data: [
            [
              indicatorZScores.profit,
              normalDistribution(indicatorZScores.profit),
            ],
          ],
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
            formatter: "Profit",
            fontSize: 10,
            color: "#1f489b",
            fontWeight: "normal",
            padding: [10, 15],
          },
          tooltip: {
            show: false,
          },
          z: 2,
        },
        {
          name: "Network",
          type: "scatter",
          data: [
            [
              indicatorZScores.network,
              normalDistribution(indicatorZScores.network),
            ],
          ],
          symbolSize: 30,
          itemStyle: {
            color: "transparent",
            borderColor: "transparent",
          },
          z: 1,
        },
        {
          name: "Network_visible",
          type: "scatter",
          data: [
            [
              indicatorZScores.network,
              normalDistribution(indicatorZScores.network),
            ],
          ],
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
            formatter: "Network",
            fontSize: 10,
            color: "#1f489b",
            fontWeight: "normal",
            padding: [10, 15],
          },
          tooltip: {
            show: false,
          },
          z: 2,
        },
        {
          name: "GovDev",
          type: "scatter",
          data: [
            [
              indicatorZScores.govDev,
              normalDistribution(indicatorZScores.govDev),
            ],
          ],
          symbolSize: 30,
          itemStyle: {
            color: "transparent",
            borderColor: "transparent",
          },
          z: 1,
        },
        {
          name: "GovDev_visible",
          type: "scatter",
          data: [
            [
              indicatorZScores.govDev,
              normalDistribution(indicatorZScores.govDev),
            ],
          ],
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
            formatter: "GovDev",
            fontSize: 10,
            color: "#1f489b",
            fontWeight: "normal",
            padding: [10, 15],
          },
          tooltip: {
            show: false,
          },
          z: 2,
        },
      ]
    : [];

  const option = {
    grid: { left: 50, right: 50, top: 50, bottom: 50 },
    xAxis: {
      type: "value",
      min: -3,
      max: 3,
      name: "Z-score",
      nameLocation: "middle",
      nameGap: 30,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        fontSize: 10,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: "value",
      name: "Density",
      nameLocation: "middle",
      nameGap: 40,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        fontSize: 10,
      },
      splitLine: {
        show: false,
      },
    },
    tooltip: {
      trigger: "item",
      backgroundColor: "transparent",
      borderColor: "transparent",
      borderWidth: 0,
      padding: 0,
      extraCssText: "box-shadow: none;",
      position: (point: any, _params: any, _dom: any, rect: any, size: any) => {
        if (!rect) {
          return point;
        }
        const tooltipWidth = size.contentSize[0];
        const tooltipHeight = size.contentSize[1];

        const x = rect.x + rect.width / 2 - tooltipWidth / 2;
        const y = rect.y - tooltipHeight;

        return [x, y];
      },
      formatter: (params: any) => {
        if (params.seriesType === "scatter") {
          const indicatorKey = params.seriesName.replace("_visible", "");

          let dynamicWidth = "200px";
          if (indicatorKey === "Influence") {
            dynamicWidth = "240px";
          } else if (indicatorKey === "GovDev") {
            dynamicWidth = "220px";
          }

          const tooltipInfo = getTooltipInfo(indicatorKey);

          const titleMap: Record<string, string> = {
            GovDev: "거버넌스/개발",
            Entry: "진입장벽",
            Network: "네트워크 난이도",
            Profit: "수익성",
            Influence: "영향력",
          };

          const displayTitle = titleMap[indicatorKey] || indicatorKey;

          const titleHtml = `<div style="
            font-size: 16px; 
            font-weight: 500; 
            margin-bottom: 8px; 
            color: #000000;
            display: flex; 
            justify-content: space-between; 
            align-items: center;">
            ${displayTitle}
            <span style="font-size: 16px; cursor: pointer; color: #999; margin-left: 10px;">&times;</span>
          </div>`;

          const contentHtml = `<div style="font-size: 12px; color: #333; line-height: 1.5;">
            ${tooltipInfo}
          </div>`;

          return `
            <div style="position: relative; padding: 10px;">
              <div style="
                width: ${dynamicWidth};
                background: white;
                padding: 15px 20px;
                border-radius: 12px;
                box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.15);
                position: relative;
                z-index: 10;
              ">
                ${titleHtml}
                ${contentHtml}
              </div>
              
              <div style="
                position: absolute;
                bottom: 4px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 8px solid white;
                z-index: 11;
                filter: drop-shadow(0px 2px 1px rgba(0,0,0,0.05));
              "></div>
            </div>
          `;
        }
        return "";
      },
    },
    legend: { show: false },
    series: [distributionSeries, ...dotSeries],
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
