import { useState } from "react";
import LogoImage from "../assets/logo.svg";
import BlockchainBtn from "./blockchain-btn";
import { Slider } from "./ui/slider";

type Scores = {
  marketBarriers: number;
  networkGovernance: number;
  profitability: number;
};

export default function Aside() {
  const blockchains: { name: string; scores: Scores }[] = [
    {
      name: "COSMOS HUB",
      scores: { marketBarriers: 20, networkGovernance: 30, profitability: 10 },
    },
  ];

  const [selected, setSelected] = useState<string[]>([]);
  const [sliderValues, setSliderValues] = useState({
    capital: 50,
    revenue: 50,
    stability: 50,
    marketBarriers: 50,
  });

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

      <footer className="bg-white h-48 px-5 py-2 flex gap-5 justify-around">
        <div className="grid gird-cols-1 w-full items-center">
          {/* max 값 수정필요 */}
          <Slider
            label="자본"
            unit={`$${sliderValues.capital}`}
            value={[sliderValues.capital]}
            max={100}
            onValueChange={(val) =>
              setSliderValues((prev) => ({ ...prev, capital: val[0] }))
            }
          />
          <Slider
            label="수익"
            unit={`${sliderValues.revenue}%`}
            value={[sliderValues.revenue]}
            max={100}
            onValueChange={(val) =>
              setSliderValues((prev) => ({ ...prev, revenue: val[0] }))
            }
          />
          <Slider
            label="안정성"
            unit={`${sliderValues.stability}%`}
            value={[sliderValues.stability]}
            max={100}
            onValueChange={(val) =>
              setSliderValues((prev) => ({ ...prev, stability: val[0] }))
            }
          />
          <Slider
            label="진입장벽"
            unit={`${sliderValues.marketBarriers}%`}
            value={[sliderValues.marketBarriers]}
            max={100}
            onValueChange={(val) =>
              setSliderValues((prev) => ({ ...prev, marketBarriers: val[0] }))
            }
          />
        </div>
        <button className="bg-blue-6 px-5 py-2 text-white font-semibold text-base">
          Find
        </button>
      </footer>
    </aside>
  );
}
