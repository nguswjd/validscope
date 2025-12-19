import { useEffect, useState } from "react";

import LogoImage from "../assets/logo.svg";

import BlockchainBtn from "./blockchain-btn";
import ProgressBar from "./Progress-bar";
import { Input } from "../components/ui/input";

type Scores = {
  marketBarriers: number;
  networkGovernance: number;
  profitability: number;
};

type AsideProps = {
  onSelect: (selected: { name: string; scores: Scores }[]) => void;
  onAllBlockchainsLoad: (all: { name: string; scores: Scores }[]) => void;
};

export default function Aside({ onSelect, onAllBlockchainsLoad }: AsideProps) {
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

    const top10Share = row["top10_share"] ?? 0;
    const gini = row["gini_token"] ?? 0;
    const hhi = row["hhi_token"] ?? 0;

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

    const apr = row["apr"] ?? 0;
    let profitScore = apr / 0.3;
    if (profitScore > 1) profitScore = 1;
    profitScore = Math.max(0, Math.min(1, profitScore));

    const cat1EntryInfluence = (entryScore + influenceScore) / 2;
    const cat2NetworkGovdev = (networkScore + govdevScore) / 2;
    const cat3Profit = profitScore;

    const thirdScale = 100 / 3;

    return {
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
        return sumB - sumA;
      });

    setBlockchains(updated);
    onAllBlockchainsLoad(updated);
  }, [rawMetrics, sliderValues.capital, onAllBlockchainsLoad]);

  const handleToggle = (name: string) => {
    const newSelected = selected.includes(name)
      ? selected.filter((n) => n !== name)
      : [...selected, name];
    setSelected(newSelected);
    onSelect(blockchains.filter((b) => newSelected.includes(b.name)));
  };
  return (
    <aside className="w-111 h-dvh border-r-2 border-gray-2 flex flex-col fixed left-0 top-0 z-10 bg-white">
      <header className="bg-white px-4 pt-4 pb-3 flex flex-col justify-between w-full gap-2">
        <h1>
          <img src={LogoImage} alt="Validscope 로고" className="max-w-42.5" />
        </h1>
        <div className="flex flex-col gap-1">
          <p>자본</p>
          <div className="flex gap-2 w-full">
            <Input placeholder="$50-$2,000 사이의 자본을 입력하세요." />
            <button className="bg-blue-6 px-3 py-3.5 rounded-xl text-sm text-white">
              Search
            </button>
          </div>
        </div>
        <div className="flex gap-2 w-full">
          <div className="flex flex-col gap-1 w-full">
            <p>수익</p>
            <Input type="number" placeholder="00" />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <p>안전성</p>
            <Input type="number" placeholder="00" />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <p>진입장벽</p>
            <Input type="number" placeholder="00" />
          </div>
        </div>
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
      <footer className="bg-white p-5 flex flex-col gap-4">
        <ProgressBar value={72} label="수익" variant="dollar" />
        <ProgressBar value={20} label="안정성" variant="score" />
        <ProgressBar value={30} label="진입장벽" variant="score" />
      </footer>
    </aside>
  );
}
