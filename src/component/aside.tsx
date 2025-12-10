import { useState } from "react";
import LogoImage from "../assets/logo.svg";
import BlockchainBtn from "./blockchain-btn";

type Scores = {
  marketBarriers: number;
  networkGovernance: number;
  profitability: number;
};

export default function Aside() {
  const recommendations: { name: string; scores: Scores }[] = [
    {
      name: "COSMOS HUB",
      scores: { marketBarriers: 20, networkGovernance: 30, profitability: 10 },
    },
    {
      name: "COSMOS HUB",
      scores: { marketBarriers: 20, networkGovernance: 30, profitability: 10 },
    },
    {
      name: "COSMOS HUB",
      scores: { marketBarriers: 20, networkGovernance: 30, profitability: 10 },
    },
    {
      name: "COSMOS HUB",
      scores: { marketBarriers: 20, networkGovernance: 30, profitability: 10 },
    },
    {
      name: "COSMOS HUB",
      scores: { marketBarriers: 20, networkGovernance: 30, profitability: 10 },
    },
    {
      name: "COSMOS HUB",
      scores: { marketBarriers: 20, networkGovernance: 30, profitability: 10 },
    },
    {
      name: "COSMOS HUB",
      scores: { marketBarriers: 20, networkGovernance: 30, profitability: 10 },
    },
    {
      name: "COSMOS HUB",
      scores: { marketBarriers: 20, networkGovernance: 30, profitability: 10 },
    },
    {
      name: "COSMOS HUB",
      scores: { marketBarriers: 20, networkGovernance: 30, profitability: 10 },
    },
    {
      name: "COSMOS HUB",
      scores: { marketBarriers: 20, networkGovernance: 30, profitability: 10 },
    },
    {
      name: "COSMOS HUB",
      scores: { marketBarriers: 20, networkGovernance: 30, profitability: 10 },
    },
    {
      name: "COSMOS HUB",
      scores: { marketBarriers: 20, networkGovernance: 30, profitability: 10 },
    },
    {
      name: "COSMOS HUB",
      scores: { marketBarriers: 20, networkGovernance: 30, profitability: 10 },
    },
    {
      name: "COSMOS HUB",
      scores: { marketBarriers: 20, networkGovernance: 30, profitability: 10 },
    },
    {
      name: "COSMOS HUB",
      scores: { marketBarriers: 20, networkGovernance: 30, profitability: 10 },
    },
    {
      name: "COSMOS HUB",
      scores: { marketBarriers: 20, networkGovernance: 30, profitability: 10 },
    },
    {
      name: "COSMOS HUB",
      scores: { marketBarriers: 20, networkGovernance: 30, profitability: 10 },
    },
  ];

  const [selected, setSelected] = useState<string[]>([]);

  const handleToggle = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  return (
    <aside className="w-[29.37vw] max-w-111 h-screen border-r-2 border-gray-2 flex flex-col">
      <header className="bg-white px-4 pt-4 pb-3 flex flex-col justify-between h-31">
        <h1>
          <img src={LogoImage} alt="Validscope 로고" className="max-h-11" />
        </h1>
        <h2 className="text-xl text-black">Top Recommendations</h2>
        <span className="text-gray-4 text-base font-light">Select the bar</span>
      </header>

      <section className="flex-1 overflow-y-auto border-y-2 border-gray-2 p-4 hide-scrollbar">
        <h2 className="hidden">바 차트 네비게이션</h2>
        <nav>
          <ul className="flex flex-col gap-2">
            {recommendations.map((item, idx) => (
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

      <footer className="bg-white h-48">자본, 수익, 안정성, 진입장벽</footer>
    </aside>
  );
}
