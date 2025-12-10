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
            <RadarChart
              data={[
                {
                  name: "COSMOS HUB",
                  value: [4200, 3000, 20000, 35000, 50000],
                  color: "#f24949",
                },
                {
                  name: "ATOMONE",
                  value: [5000, 14000, 28000, 26000, 42000],
                  color: "#64b875",
                },
                {
                  name: "OSMOSIS",
                  value: [500, 1400, 30000, 6000, 21000],
                  color: "#f09436",
                },
              ]}
            />
          </Contents>
        </div>
        <div className="flex h-full gap-5">
          <Contents
            label="Normal distribution table for [blockchain]"
            className="w-full"
          >
            <LineChart
              data={[
                {
                  name: "COSMOS HUB",
                  value: [4, 3, 1, 2, 3, 1, 2],
                },
              ]}
            />
          </Contents>
          <Contents label="Ratio between elements" className="w-[40%]">
            <PieChart
              data={[
                {
                  name: "COSMOS HUB",
                  scores: {
                    marketBarriers: 20,
                    influence: 20,
                    networkGovernance: 20,
                    networkHealth: 30,
                    profitability: 10,
                  },
                },
              ]}
            />
          </Contents>
        </div>
      </main>
    </div>
  );
}
