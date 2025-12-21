import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import LogoImage from "../assets/logo.svg";

import BlockchainBtn from "./blockchain-btn";
import ProgressBar from "./Progress-bar";
import { Input } from "./ui/input";

type Scores = {
  marketBarriers: number;
  networkGovernance: number;
  profitability: number;
  rawMarketBarriers: number;
  rawProfitability: number;
  rawEntryScore: number;
  rawInfluenceScore: number;
  rawNetworkScore: number;
  rawGovDevScore: number;
  rawProfitScore: number;
};

type AsideProps = {
  onSelect: (selected: { name: string; scores: Scores }[]) => void;
  onAllBlockchainsLoad: (all: { name: string; scores: Scores }[]) => void;
  onRawMetricsLoad?: (
    rawMetrics: { name: string; data: Record<string, number> }[]
  ) => void;
  onCapitalChange?: (capital: number) => void;
  externalHoveredItem?: string | null;
};

export default function Aside({
  onSelect,
  onAllBlockchainsLoad,
  onRawMetricsLoad,
  onCapitalChange,
  externalHoveredItem,
}: AsideProps) {
  const [rawMetrics, setRawMetrics] = useState<
    { name: string; data: Record<string, number> }[]
  >([]);
  const [blockchains, setBlockchains] = useState<
    { name: string; scores: Scores }[]
  >([]);

  const [selected, setSelected] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const [inputValues, setInputValues] = useState({
    capital: "",
    revenue: "",
    stability: "",
    marketBarriers: "",
  });
  const [searchParams, setSearchParams] = useState<{
    capital: number;
    revenue: number;
    stability: number;
    marketBarriers: number;
    isInitial?: boolean;
  }>({
    capital: 50,
    revenue: 50,
    stability: 50,
    marketBarriers: 50,
    isInitial: true,
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
          const res = await fetch(
            `${import.meta.env.BASE_URL}data/${chain.id}_metrics.csv`
          );
          if (!res.ok) continue;
          const text = await res.text();
          const row = parseCsvToRow(text);
          if (!row) continue;
          results.push({ name: chain.name, data: row });
        } catch (e) {}
      }

      setRawMetrics(results);
      if (onRawMetricsLoad) {
        onRawMetricsLoad(results);
      }
    };

    load();
  }, [onRawMetricsLoad]);

  const calculateScoresFromMetrics = (
    row: Record<string, number>,
    C: number,
    weights: { revenue: number; stability: number; marketBarriers: number }
  ): Scores => {
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

    const weightSum =
      weights.revenue + weights.stability + weights.marketBarriers;
    const normalizedWeightRevenue =
      weightSum > 0 ? (weights.revenue / weightSum) * 100 : 33.33;
    const normalizedWeightStability =
      weightSum > 0 ? (weights.stability / weightSum) * 100 : 33.33;
    const normalizedWeightMarketBarriers =
      weightSum > 0 ? (weights.marketBarriers / weightSum) * 100 : 33.33;

    return {
      marketBarriers: cat1EntryInfluence * normalizedWeightMarketBarriers,
      networkGovernance: cat2NetworkGovdev * normalizedWeightStability,
      profitability: cat3Profit * normalizedWeightRevenue,
      rawMarketBarriers: cat1EntryInfluence * 100,
      rawProfitability: cat3Profit * 100,
      rawEntryScore: entryScore * 100,
      rawInfluenceScore: influenceScore * 100,
      rawNetworkScore: networkScore * 100,
      rawGovDevScore: govdevScore * 100,
      rawProfitScore: profitScore * 100,
    };
  };

  useEffect(() => {
    if (rawMetrics.length === 0) return;

    if (searchParams.isInitial) {
      const updated = rawMetrics
        .map(({ name }) => ({
          name,
          scores: {
            marketBarriers: 0,
            networkGovernance: 0,
            profitability: 0,
            rawMarketBarriers: 0,
            rawProfitability: 0,
            rawEntryScore: 0,
            rawInfluenceScore: 0,
            rawNetworkScore: 0,
            rawGovDevScore: 0,
            rawProfitScore: 0,
          },
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setBlockchains(updated);
      onAllBlockchainsLoad(updated);
      return;
    }

    const updated = rawMetrics
      .map(({ name, data }) => ({
        name,
        scores: calculateScoresFromMetrics(data, searchParams.capital, {
          revenue: searchParams.revenue,
          stability: searchParams.stability,
          marketBarriers: searchParams.marketBarriers,
        }),
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
  }, [rawMetrics, searchParams, onAllBlockchainsLoad]);

  const handleToggle = (name: string) => {
    if (searchParams.isInitial) {
      alert("자본을 입력하고 Search 버튼을 눌러주세요.");
      return;
    }

    const newSelected = selected.includes(name)
      ? selected.filter((n) => n !== name)
      : [...selected, name];
    setSelected(newSelected);
    onSelect(blockchains.filter((b) => newSelected.includes(b.name)));
  };

  const handleSearch = () => {
    const onlyNumber = inputValues.capital.replace(/[^\d]/g, "");
    let capital = onlyNumber ? parseInt(onlyNumber, 10) : 50;
    capital = Math.max(50, Math.min(2000, capital));

    const parseValue = (val: string) => (val === "" ? 33 : parseInt(val, 10));

    const revenue = Math.max(0, Math.min(100, parseValue(inputValues.revenue)));
    const stability = Math.max(
      0,
      Math.min(100, parseValue(inputValues.stability))
    );
    const marketBarriers = Math.max(
      0,
      Math.min(100, parseValue(inputValues.marketBarriers))
    );

    setInputValues((prev) => ({
      ...prev,
      capital: capital.toLocaleString(),
      revenue: String(revenue),
      stability: String(stability),
      marketBarriers: String(marketBarriers),
    }));

    setSearchParams({
      capital,
      revenue,
      stability,
      marketBarriers,
      isInitial: false,
    });
    if (onCapitalChange) {
      onCapitalChange(capital);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
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
            <Input
              placeholder="$50-$2,000 사이의 자본을 입력하세요."
              value={inputValues.capital}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                const onlyNumber = e.target.value.replace(/[^\d]/g, "");
                const formatted = onlyNumber
                  ? Number(onlyNumber).toLocaleString()
                  : "";
                setInputValues((prev) => ({
                  ...prev,
                  capital: formatted,
                }));
              }}
              onBlur={() => {
                const onlyNumber = inputValues.capital.replace(/[^\d]/g, "");
                if (!onlyNumber) return;

                let value = Number(onlyNumber);
                value = Math.max(50, Math.min(2000, value));

                setInputValues((prev) => ({
                  ...prev,
                  capital: value.toLocaleString(),
                }));
              }}
            />
            <button
              onClick={handleSearch}
              className="bg-blue-6 px-3 py-3.5 rounded-xl text-sm text-white"
            >
              Search
            </button>
          </div>
        </div>
        <div className="flex gap-2 w-full">
          <div className="flex flex-col gap-1 w-full">
            <p>수익</p>
            <Input
              type="number"
              min={0}
              max={100}
              step={1}
              placeholder="00"
              value={inputValues.revenue}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                const value = Math.max(
                  0,
                  Math.min(100, Number(e.target.value) || 0)
                );
                setInputValues((prev) => ({
                  ...prev,
                  revenue: String(value),
                }));
              }}
            />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <p>안전성</p>
            <Input
              type="number"
              min={0}
              max={100}
              step={1}
              placeholder="00"
              value={inputValues.stability}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                const value = Math.max(
                  0,
                  Math.min(100, Number(e.target.value) || 0)
                );
                setInputValues((prev) => ({
                  ...prev,
                  stability: String(value),
                }));
              }}
            />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <p>진입장벽</p>
            <Input
              type="number"
              min={0}
              max={100}
              step={1}
              placeholder="00"
              value={inputValues.marketBarriers}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                const value = Math.max(
                  0,
                  Math.min(100, Number(e.target.value) || 0)
                );
                setInputValues((prev) => ({
                  ...prev,
                  marketBarriers: String(value),
                }));
              }}
            />
          </div>
        </div>
      </header>
      <section className="flex-1 overflow-y-auto border-y-2 border-gray-2 p-4 hide-scrollbar">
        <nav>
          <ul className="flex flex-col gap-2">
            <AnimatePresence>
              {blockchains.map((item, idx) => (
                <motion.li
                  key={item.name}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    type: "spring",
                    stiffness: 30,
                    damping: 15,
                    mass: 1,
                  }}
                  className="flex items-center bg-white"
                  onMouseEnter={() => {
                    if (!searchParams.isInitial) {
                      setHoveredItem(item.name);
                    }
                  }}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <p className="w-5 text-center text-black mr-2">{idx + 1}</p>
                  <BlockchainBtn
                    name={item.name}
                    scores={item.scores}
                    onClick={() => handleToggle(item.name)}
                    isSelected={selected.includes(item.name)}
                    selectedLength={selected.length}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </nav>
      </section>
      <footer className="bg-white p-5 flex flex-col gap-4">
        {(() => {
          const activeName =
            externalHoveredItem ||
            hoveredItem ||
            (selected.length > 0 ? selected[selected.length - 1] : null);

          const NameDisplay = <p>{activeName || "Blockchain"}</p>;

          if (!activeName) {
            return (
              <>
                {NameDisplay}
                <ProgressBar
                  value={0}
                  max={searchParams.capital}
                  label="수익"
                  variant="dollar"
                  color="#77b4f0"
                />
                <ProgressBar
                  value={0}
                  max={100}
                  label="안정성"
                  variant="score"
                  color="#4896ec"
                />
                <ProgressBar
                  value={0}
                  max={100}
                  label="진입장벽"
                  variant="score"
                  color="#3776cb"
                />
              </>
            );
          }

          const targetBlockchain = blockchains.find(
            (b) => b.name === activeName
          );

          if (!targetBlockchain) {
            return (
              <>
                {NameDisplay}
                <ProgressBar
                  value={0}
                  max={searchParams.capital}
                  label="수익"
                  variant="dollar"
                  color="#77b4f0"
                />
                <ProgressBar
                  value={0}
                  max={100}
                  label="안정성"
                  variant="score"
                  color="#4896ec"
                />
                <ProgressBar
                  value={0}
                  max={100}
                  label="진입장벽"
                  variant="score"
                  color="#3776cb"
                />
              </>
            );
          }

          const weightSum =
            searchParams.revenue +
            searchParams.stability +
            searchParams.marketBarriers;
          const normalizedWeightStability =
            weightSum > 0 ? (searchParams.stability / weightSum) * 100 : 33.33;
          const normalizedWeightMarketBarriers =
            weightSum > 0
              ? (searchParams.marketBarriers / weightSum) * 100
              : 33.33;

          const stability =
            (targetBlockchain.scores.networkGovernance /
              normalizedWeightStability) *
            100;

          const marketBarriers =
            (targetBlockchain.scores.marketBarriers /
              normalizedWeightMarketBarriers) *
            100;

          const targetRawMetric = rawMetrics.find((m) => m.name === activeName);
          const apr = targetRawMetric?.data["apr"] ?? 0;

          const profitAmount = searchParams.capital * apr;

          const roundedProfitAmount = Math.round(profitAmount * 100) / 100;
          const roundedStability = Math.round(stability * 100) / 100;
          const roundedMarketBarriers = Math.round(marketBarriers * 100) / 100;

          return (
            <>
              {NameDisplay}
              <ProgressBar
                value={roundedProfitAmount}
                max={searchParams.capital}
                label="수익"
                variant="dollar"
                color="#77b4f0"
              />
              <ProgressBar
                value={roundedStability}
                max={100}
                label="안정성"
                variant="score"
                color="#4896ec"
              />
              <ProgressBar
                value={roundedMarketBarriers}
                max={100}
                label="진입장벽"
                variant="score"
                color="#3776cb"
              />
            </>
          );
        })()}
      </footer>
    </aside>
  );
}
