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

  const [selectedForRadar, setSelectedForRadar] = useState<
    { name: string; scores: Scores }[]
  >([]);

  const handleSelectBlockchain = (name: string) => {
    const blockchain = selectedBlockchains.find((b) => b.name === name);
    if (!blockchain) return;

    const isAlreadySelected = selectedForRadar.some((b) => b.name === name);

    if (isAlreadySelected) {
      setSelectedForRadar(selectedForRadar.filter((b) => b.name !== name));
    } else if (selectedForRadar.length < 4) {
      setSelectedForRadar([...selectedForRadar, blockchain]);
    } else {
      setSelectedForRadar([...selectedForRadar.slice(1), blockchain]);
    }
  };

  return (
    <div className="w-screen">
      <Aside onSelect={setSelectedBlockchains} />
      <main className="ml-111 flex flex-col gap-5 p-5">
        <div className="flex h-110 gap-5">
          <Contents
            label="Bubble chart for blockchains"
            className="min-w-158 w-full"
            description="검증인이 되기 유리한 조건을 가진 블록체인 지도이다.
            오른쪽 위, 크기가 큰 체인일수록 검증인이 되기 쉽다."
          >
            <BubbleChart
              data={selectedBlockchains}
              onSelectBlockchain={handleSelectBlockchain}
              selectedBlockchains={selectedForRadar}
            />
          </Contents>
          <Contents
            label="Comparison between elements"
            className="min-w-94 w-[60%]"
            description="블록체인 간, 각 지표별 점수의 차이를 비교할 수 있다."
          >
            <RadarChart selectedBlockchains={selectedForRadar} />
          </Contents>
        </div>
        <div className="flex h-102 min-w-5xl w-full gap-5">
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
