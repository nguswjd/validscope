import { useEffect, useState } from "react";

import LogoImage from "../assets/logo.svg";

import BlockchainBtn from "./blockchain-btn";
import { Input } from "../components/ui/input";

type Scores = {
  marketBarriers: number;
  networkGovernance: number;
  profitability: number;
};

type AsideProps = {
  onSelect: (selected: { name: string; scores: Scores }[]) => void;
};

export default function Aside({ onSelect }: AsideProps) {
  const [rawMetrics, setRawMetrics] = useState<
    { name: string; data: Record<string, number> }[]
  >([]);
  const [blockchains, setBlockchains] = useState<
    { name: string; scores: Scores }[]
  >([]);

  const [selected, setSelected] = useState<string[]>([]);
  const [sliderValues] = useState({
    capital: 50,
    revenue: 50,
    stability: 50,
    marketBarriers: 50,
  });

  useEffect(() => {
    const chains = [
      { id: "cosmos", name: "COSMOS HUB" },
      { id: "atomone", name: "ATOMONE" },
      { id: "osmosis", name: "OSMOSIS" },
      { id: "akash", name: "AKASH" },
      { id: "agoric", name: "AGORIC" },
      { id: "althea", name: "ALTHEA" },
      { id: "archway", name: "ARCHWAY" },
      { id: "axelar", name: "AXELAR" },
      { id: "band", name: "BAND" },
      { id: "celestia", name: "CELESTIA" },
      { id: "chihuahua", name: "CHIHUAHUA" },
      { id: "coreum", name: "COREUM" },
      { id: "dydx", name: "DYDX" },
      { id: "gravity-bridge", name: "GRAVITY BRIDGE" },
      { id: "humans", name: "HUMANS" },
      { id: "injective", name: "INJECTIVE" },
      { id: "kava", name: "KAVA" },
      { id: "mantra", name: "MANTRA" },
      { id: "medibloc", name: "MEDIBLOC" },
      { id: "milkyway", name: "MILKYWAY" },
      { id: "nillion", name: "NILLION" },
      { id: "persistence", name: "PERSISTENCE" },
      { id: "regen", name: "REGEN" },
      { id: "secret", name: "SECRET" },
      { id: "shentu", name: "SHENTU" },
      { id: "stargaze", name: "STARGAZE" },
      { id: "terra", name: "TERRA" },
      { id: "xion", name: "XION" },
      { id: "xpla", name: "XPLA" },
    ];

    const parseCsvToRow = (csv: string): Record<string, number> | null => {
      const [headerLine, dataLine] = csv.trim().split("\n");
      if (!headerLine || !dataLine) {
        return null;
      }

      const headers = headerLine.split(",");
      const values = dataLine.split(",");
      const row: Record<string, number> = {};

      headers.forEach((h, idx) => {
        const v = values[idx];
        const num = v && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : 0;
        row[h] = num;
      });

      return row;
    };

    const load = async () => {
      const results: { name: string; data: Record<string, number> }[] = [];

      for (const chain of chains) {
        try {
          const res = await fetch(`/data/${chain.id}_metrics.csv`);
          if (!res.ok) continue;
          const text = await res.text();
          const row = parseCsvToRow(text);
          if (!row) continue;
          results.push({ name: chain.name, data: row });
        } catch (e) {
          // 네트워크 에러 등은 무시하고 계속 진행
          // console.error(e);
        }
      }

      setRawMetrics(results);
    };

    load();
  }, []);

  const calculateScoresFromMetrics = (
    row: Record<string, number>,
    capitalSliderValue: number
  ): Scores => {
    // 자본 슬라이더(0~100)를 실제 C 값으로 매핑
    // 필요에 따라 1000 배수 등은 조정 가능
    const C = capitalSliderValue * 1000;

    const cutoff = row["cutoff_token"] ?? 0;

    let entryScore = 0;
    if (cutoff > 0) {
      if (C < cutoff) {
        entryScore = 0;
      } else {
        entryScore = C / (2 * cutoff);
        if (entryScore > 1) entryScore = 1;
      }
    }

    const top10Share = row["top10_share"] ?? 0; // 0~1
    const gini = row["gini_token"] ?? 0; // 0~1
    const hhi = row["hhi_token"] ?? 0; // 0~1

    const inflTop10 = 1 - top10Share;
    const inflGini = 1 - gini;
    const inflHhi = 1 - hhi;

    let influenceScore = 0.5 * inflTop10 + 0.25 * inflGini + 0.25 * inflHhi;
    influenceScore = Math.max(0, Math.min(1, influenceScore));

    const missRatio = row["miss_ratio"] ?? 0;
    let networkScore = 1 - missRatio;
    networkScore = Math.max(0, Math.min(1, networkScore));

    const proposalPassRate = row["proposal_pass_rate"] ?? 0;
    const govTurnoutRatio = row["gov_turnout_ratio_est"] ?? 0;
    const devCommits30d = row["dev_commits_30d"] ?? 0;

    const devScore =
      devCommits30d > 0 ? devCommits30d / (devCommits30d + 100) : 0;

    let govdevScore =
      0.4 * proposalPassRate + 0.3 * govTurnoutRatio + 0.3 * devScore;
    govdevScore = Math.max(0, Math.min(1, govdevScore));

    const apr = row["apr"] ?? 0; // 0.171 같은 값
    let profitScore = apr / 0.3; // 30%를 1점으로 가정
    if (profitScore > 1) profitScore = 1;
    profitScore = Math.max(0, Math.min(1, profitScore));

    const cat1EntryInfluence = (entryScore + influenceScore) / 2;
    const cat2NetworkGovdev = (networkScore + govdevScore) / 2;
    const cat3Profit = profitScore;

    // 각 값의 최대를 33.33% 정도로 표현하기 위한 스케일 (1 → 33.33)
    const thirdScale = 100 / 3;

    return {
      // 세 값은 서로 독립적으로 0~33.33% 범위로만 스케일링됨 (합은 얼마든지 가능)
      marketBarriers: cat1EntryInfluence * thirdScale,
      networkGovernance: cat2NetworkGovdev * thirdScale,
      profitability: cat3Profit * thirdScale,
    };
  };

  useEffect(() => {
    if (rawMetrics.length === 0) return;

    const updated = rawMetrics
      .map(({ name, data }) => ({
        name,
        scores: calculateScoresFromMetrics(data, sliderValues.capital),
      }))
      .sort((a, b) => {
        const sumA =
          a.scores.marketBarriers +
          a.scores.networkGovernance +
          a.scores.profitability;
        const sumB =
          b.scores.marketBarriers +
          b.scores.networkGovernance +
          b.scores.profitability;
        return sumB - sumA; // 합이 큰 것부터(내림차순)
      });

    setBlockchains(updated);
  }, [rawMetrics, sliderValues.capital]);

  const handleToggle = (name: string) => {
    const newSelected = selected.includes(name)
      ? selected.filter((n) => n !== name)
      : [...selected, name];
    setSelected(newSelected);
    onSelect(blockchains.filter((b) => newSelected.includes(b.name)));
  };

  return (
    <aside className="w-[29.37vw] max-w-111 h-screen border-r-2 border-gray-2 flex flex-col">
      <header className="bg-white px-4 pt-4 pb-3 flex flex-col justify-between">
        <h1>
          <img src={LogoImage} alt="Validscope 로고" className="max-w-42.5" />
        </h1>
        <Input type="number" />
      </header>
      <section className="flex-1 overflow-y-auto border-y-2 border-gray-2 p-4 hide-scrollbar">
        <nav>
          <ul className="flex flex-col gap-2">
            {blockchains.map((item, idx) => (
              <li key={idx} className="flex items-center">
                <p className="w-5 text-center text-black">{idx + 1}</p>
                <BlockchainBtn
                  name={item.name}
                  scores={item.scores}
                  onClick={() => handleToggle(item.name)}
                  isSelected={selected.includes(item.name)}
                  selectedLength={selected.length}
                />
              </li>
            ))}
          </ul>
        </nav>
      </section>
      <footer className="bg-white px-5 py-2 flex gap-5"></footer>
    </aside>
  );
}
