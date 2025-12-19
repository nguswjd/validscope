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
    <div className="flex w-screen">
      <Aside onSelect={(blockchains) => setSelectedBlockchains(blockchains)} />
      <main className="flex flex-col gap-5 p-5 ml-[33vw] flex-1 overflow-auto">
        <div className="flex h-110 gap-5">
          <Contents
            label="Bubble chart for blockchains"
            className="w-full"
            description="검증인이 되기 유리한 조건을 가진 블록체인 지도이다.
            오른쪽 위, 크기가 큰 체인일수록 검증인이 되기 쉽다."
          >
            <BubbleChart data={selectedBlockchains} />
          </Contents>
          <Contents
            label="Comparison between elements"
            className="w-[60%]"
            description="블록체인 간, 각 지표별 점수의 차이를 비교할 수 있다."
          >
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
        <div className="flex h-102 w-full gap-5">
          <Contents
            variant="twochart"
            label="Ratio between elements"
            label2="Normal distribution table for [blockchain]"
            className="w-[40%]"
            description="당신이 선택한 가중치에 따른 점수의 비율이다."
            description2="각 지표별 상대 점수를 정규분표로 도식화하였다.
              왼쪽에 가까울수록 부정적, 오른쪽에 가까울수록 긍정적으로 주목할 수 있는 지표이다."
          >
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

            <LineChart
              data={[
                {
                  name: "COSMOS HUB",
                  value: [4, 3, 1, 2, 3, 1, 2],
                },
              ]}
            />
          </Contents>
        </div>
      </main>
    </div>
  );
}
