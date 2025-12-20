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
  const percentile25 = -0.674; // 하위 25th percentile
  const percentile75 = 0.674; // 상위 25th percentile (75th percentile)

  // 선택된 블록체인의 rawMetrics 찾기
  const selectedRawMetrics = rawMetrics.find(
    (m) => m.name === selectedBlockchainName
  );

  // Tooltip 정보 생성 함수
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
    const uptime = metrics["uptime"] ?? null; // Uptime 데이터 (없을 수 있음)
    const activeAddressesTrend = metrics["active_addresses_trend"] ?? null; // Active Addresses 추세 (없을 수 있음, "increase" | "stable" | "decrease")

    // 개발자 활동 색상 및 텍스트 결정 (원형 이모지)
    let devActivityText = "";
    if (govTurnout * 100 >= 50) {
      devActivityText = "🟢꾸준함";
    } else if (govTurnout * 100 >= 10) {
      devActivityText = "🟡보통";
    } else {
      devActivityText = "🔴활동 없음";
    }

    // 사용자 지분 비율 계산 (capital과 totalStaked가 모두 존재하고 0보다 큰 경우에만 계산)
    // capital과 totalStaked는 같은 단위(토큰)로 가정
    const userShare =
      totalStaked > 0 && capital && capital > 0
        ? (capital / totalStaked) * 100
        : 0;
    const votingPower =
      totalStaked > 0 && capital && capital > 0
        ? (capital / totalStaked) * 100
        : 0;

    // Cutoff 상태 텍스트 결정 (사용자 자본과 cutoff 비교)
    let cutoffText = "";
    const cutoffNum = Number(cutoff) || 0;
    const capitalNum = Number(capital) || 0;

    if (cutoffNum > 0) {
      // 사용자 자본과 cutoff 비교
      if (capitalNum > cutoffNum) {
        cutoffText = "🟢가능"; // C > Cutoff
      } else if (capitalNum < cutoffNum) {
        cutoffText = "🔴진입불가"; // C < Cutoff
      } else {
        cutoffText = "🟡주의"; // C ≈ Cutoff
      }
    }

    // Block Miss Ratio 상태 결정
    const missRatioPercent = missRatio * 100;
    let blockMissRatioStatus = "";
    if (missRatioPercent <= 1) {
      blockMissRatioStatus = "🟢안정";
    } else if (missRatioPercent <= 5) {
      blockMissRatioStatus = "🟡주의";
    } else {
      blockMissRatioStatus = "🔴위험";
    }

    // HHI 상태 결정
    let hhiStatus = "";
    if (hhi < 0.1) {
      hhiStatus = "🟢분산 양호";
    } else if (hhi <= 0.18) {
      hhiStatus = "🟡중간";
    } else {
      hhiStatus = "🔴고집중";
    }

    // Uptime 상태 결정
    let uptimeStatus = "";
    if (uptime !== null && uptime !== undefined) {
      if (uptime >= 99) {
        uptimeStatus = "🟢안정";
      } else if (uptime >= 97) {
        uptimeStatus = "🟡주의";
      } else {
        uptimeStatus = "🔴위험";
      }
    }

    // Active Addresses 추세 상태 결정
    let activeAddressesStatus = "";
    if (activeAddressesTrend !== null && activeAddressesTrend !== undefined) {
      const trend = String(activeAddressesTrend).toLowerCase();
      if (trend === "increase" || trend === "stable") {
        activeAddressesStatus = "🟢분산 양호";
      } else if (trend === "stable" || trend === "stagnant") {
        activeAddressesStatus = "🟡주의";
      } else if (trend === "decrease" || trend === "decline") {
        activeAddressesStatus = "🔴위험";
      }
    }

    // 연간 예상 수익 계산
    const annualProfit = capital * apr;

    let info = "";

    // 각 지표별로 해당하는 정보만 표시
    if (indicatorName === "Influence") {
      // 영향력: TotalStaked, Top-k, Nakamoto Coefficient, VotingPower
      info += `TotalStaked ${totalStaked.toLocaleString()}<br/>`;
      // userShare가 매우 작을 수 있으므로 소수점 6자리까지 표시
      const userShareFormatted =
        userShare > 0 && userShare < 0.0001
          ? userShare.toFixed(6)
          : userShare.toFixed(4);
      info += `Top-k ${(top10Share * 100).toFixed(
        2
      )}%/${userShareFormatted}%<br/>`;
      info += `Nakamoto Coefficient 🛡${nakamoto33} validators<br/>`;
      // votingPower가 매우 작을 수 있으므로 소수점 6자리까지 표시
      const votingPowerFormatted =
        votingPower > 0 && votingPower < 0.01
          ? votingPower.toFixed(6)
          : votingPower.toFixed(2);
      info += `VotingPower 🔈${votingPowerFormatted}%`;
    } else if (indicatorName === "Entry") {
      // 진입장벽: Cutoff, Active set size
      info += `Cutoff ${cutoffText}<br/>`;
      info += `Active set size ${nact.toLocaleString()}/${nact.toLocaleString()}`;
    } else if (indicatorName === "Profit") {
      // 수익: 연간 예상 수익
      info += `연간 예상 수익 약 ${annualProfit.toLocaleString()} USD`;
    } else if (indicatorName === "Network") {
      // 안정성: Block Miss Ratio, Uptime, HHI, Active Addresses
      info += `Block Miss Ratio ${blockMissRatioStatus}<br/>`;
      if (uptimeStatus) {
        info += `Uptime ${uptimeStatus}<br/>`;
      }
      info += `HHI ${hhiStatus}<br/>`;
      if (activeAddressesStatus) {
        info += `Active Addresses ${activeAddressesStatus}`;
      }
    } else if (indicatorName === "GovDev") {
      // 개발 거버넌스: Governance Participation, 개발자 활동 상태
      info += `Governance Participation 🗳️${(govTurnout * 100).toFixed(
        0
      )}%<br/>`;
      info += `개발자 활동 ${devActivityText}`;
    }

    return info;
  };

  // 정규분포 곡선 시리즈 생성
  const distributionSeries = {
    name: "Normal Distribution",
    type: "line",
    data: normalDistributionData.map((y, idx) => [xRange[idx], y]),
    smooth: true,
    showSymbol: false, // 점 표시 안 함
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
      silent: true, // 호버 이벤트 비활성화
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
            triggerEvent: false, // label 호버 시 이벤트 발생 안 함
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
            triggerEvent: false, // label 호버 시 이벤트 발생 안 함
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
            triggerEvent: false, // label 호버 시 이벤트 발생 안 함
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
            triggerEvent: false, // label 호버 시 이벤트 발생 안 함
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
            triggerEvent: false, // label 호버 시 이벤트 발생 안 함
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
          const indicatorName = params.seriesName;
          const tooltipInfo = getTooltipInfo(indicatorName);
          return `${indicatorName}<br/><br/>${tooltipInfo}`;
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
