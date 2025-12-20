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
  const { normalDistributionData, averageZScore, xRange } = useMemo(() => {
    if (!allBlockchains || allBlockchains.length === 0) {
      return {
        normalDistributionData: [],
        averageZScore: 0,
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

    let zScores: number[] = [];
    if (selectedBlockchain) {
      const scores = selectedBlockchain.scores;
      const entryZ = zScore(
        scores.rawEntryScore ?? 0,
        stats.entry.mean,
        stats.entry.stdDev
      );
      const influenceZ = zScore(
        scores.rawInfluenceScore ?? 0,
        stats.influence.mean,
        stats.influence.stdDev
      );
      const networkZ = zScore(
        scores.rawNetworkScore ?? 0,
        stats.network.mean,
        stats.network.stdDev
      );
      const govDevZ = zScore(
        scores.rawGovDevScore ?? 0,
        stats.govDev.mean,
        stats.govDev.stdDev
      );
      const profitZ = zScore(
        scores.rawProfitScore ?? 0,
        stats.profit.mean,
        stats.profit.stdDev
      );

      // Step 4: 부정적 지표는 Z-score 부호 반전
      // Entry_score는 높을수록 나쁨 (진입장벽이 높음) -> 부정적 지표
      zScores = [
        -entryZ, // Entry_score는 부정적 지표
        influenceZ, // Influence_score는 긍정적 지표
        networkZ, // Network_score는 긍정적 지표
        govDevZ, // GovDev_score는 긍정적 지표
        profitZ, // Profit_score는 긍정적 지표
      ];
    } else {
      zScores = [0, 0, 0, 0, 0];
    }

    // 종합 Z-score 계산 (5개 지표의 평균)
    const averageZScore =
      zScores.length > 0
        ? zScores.reduce((sum, z) => sum + z, 0) / zScores.length
        : 0;

    // Step 5: 정규분포 데이터 가공 (x_range = [-2, +2])
    const xRange: number[] = [];
    const normalDistributionData: number[] = [];
    const step = 0.1;
    for (let x = -2; x <= 2; x += step) {
      xRange.push(Number(x.toFixed(1)));
      normalDistributionData.push(normalDistribution(x));
    }

    return {
      normalDistributionData,
      averageZScore,
      xRange,
    };
  }, [allBlockchains, selectedBlockchainName]);

  if (!allBlockchains || allBlockchains.length === 0) return null;

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

  // 종합 점 시리즈 생성 (선택한 블록체인의 종합 위치)
  const dotSeries = {
    name: selectedBlockchainName || "Selected",
    type: "scatter",
    data: [[averageZScore, normalDistribution(averageZScore)]],
    symbolSize: 15,
    itemStyle: {
      color: "#1f489b",
    },
    label: {
      show: true,
      position: "top",
      formatter: selectedBlockchainName || "",
      fontSize: 12,
      color: "#1f489b",
      fontWeight: "bold",
    },
  };

  const option = {
    grid: { left: 50, right: 50, top: 50, bottom: 50 },
    xAxis: {
      type: "value",
      min: -2,
      max: 2,
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
          return `${
            params.seriesName
          }<br/>종합 Z-score: ${averageZScore.toFixed(2)}`;
        }
        return "";
      },
    },
    legend: { show: false },
    series: [distributionSeries, dotSeries],
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
