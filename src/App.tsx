import { useState } from "react";

import Aside from "./component/aside";
import Contents from "./component/contents";

import BubbleChart from "./component/charts/bubble-chart";
import RadarChart from "./component/charts/radar-chart";
import LineChart from "./component/charts/line-chart";
import PieChart from "./component/charts/pie-chart";

type Scores = {
  marketBarriers: number;
  networkGovernance: number;
  profitability: number;
};

export default function App() {
  const [selectedBlockchains, setSelectedBlockchains] = useState<
    { name: string; scores: Scores }[]
  >([]);

  return (
    <div className="flex h-screen w-screen">
      <Aside onSelect={(blockchains) => setSelectedBlockchains(blockchains)} />
      <main className="flex flex-col gap-5 p-5 w-full">
        <div className="flex h-full gap-5">
          <Contents label="Bubble chart for blockchains" className="w-full">
            <BubbleChart data={selectedBlockchains} />
          </Contents>
          <Contents label="Comparison between elements" className="w-[60%]">
            <RadarChart />
          </Contents>
        </div>
        <div className="flex h-full gap-5">
          <Contents
            label="Normal distribution table for [blockchain]"
            className="w-full"
          >
            <LineChart />
          </Contents>
          <Contents label="Ratio between elements" className="w-[40%]">
            <PieChart />
          </Contents>
        </div>
      </main>
    </div>
  );
}
