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

function LineChart({ allBlockchains, selectedBlockchainName }: LineChartProps) {
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
      influence: influenceZ, // 영향력
      entry: -entryZ, // 진입장벽 (부정적 지표이므로 부호 반전)
      profit: profitZ, // 수익
      network: networkZ, // 안정성
      govDev: govDevZ, // 개발 거버넌스
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

  // 선택된 블록체인이 없으면 점을 표시하지 않음
  const hasSelectedBlockchain =
    selectedBlockchainName && selectedBlockchainName.trim() !== "";

  // 표준 정규분포의 백분위수 값
  // 25th percentile ≈ -0.674
  // 75th percentile ≈ 0.674
  const percentile25 = -0.674;
  const percentile75 = 0.674;

  // 정규분포 곡선 시리즈 생성
  const distributionSeries = {
    name: "Normal Distribution",
    type: "line",
    data: xRange.map((x, index) => [x, normalDistributionData[index]]),
    smooth: true,
    lineStyle: {
      color: "#4896ec",
      width: 2,
    },
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
    showSymbol: false,
    silent: true,
    markLine: {
      data: [
        {
          xAxis: percentile25,
          lineStyle: { color: "#DBDBDB", width: 1 },
          label: {
            show: false,
          },
        },
        {
          xAxis: percentile75,
          lineStyle: { color: "#DBDBDB", width: 1 },
          label: {
            show: false,
          },
        },
      ],
      symbol: "none",
    },
  };

  // 5개 지표별 점 시리즈 생성
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
          },
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
          },
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
          },
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
          },
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
          },
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
      formatter: (params: any) => {
        if (params.seriesType === "scatter") {
          const zScoreValue = params.data[0];
          return `${params.seriesName}<br/>Z-score: ${zScoreValue.toFixed(2)}`;
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
