import cosmosHubImg from "../assets/blockchains/cosmos_hub.png";

const blockchainImages: Record<string, string> = {
  "COSMOS HUB": cosmosHubImg,
};

type Scores = {
  //진입장벽, 영향력
  marketBarriers: number;
  //네트워크 난이도, 거버넌스 및 개발
  networkGovernance: number;
  //수익성
  profitability: number;
};

type BlockchainBtnProps = {
  onClick?: () => void;
  name: string;
  scores: Scores;
  isSelected?: boolean;
  selectedLength: number;
};

export default function BlockchainBtn({
  onClick,
  name,
  scores,
  isSelected = false,
  selectedLength,
}: BlockchainBtnProps) {
  const { marketBarriers, networkGovernance, profitability } = scores;
  const imgSrc = blockchainImages[name] || "";
  const altText = name || "blockchain";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex gap-2 w-full transition-opacity duration-200 ${
        selectedLength === 0 || isSelected ? "opacity-100" : "opacity-25"
      }`}
    >
      <img
        src={imgSrc}
        alt={altText}
        className="w-6 h-6 rounded-full bg-gray-3"
      />
      <div className="w-[85%] h-[25px] bg-[#F1F1F5] rounded flex overflow-hidden">
        <div
          className="bg-gradient-blue-3"
          style={{ width: `${marketBarriers}%` }}
        ></div>
        <div
          className="bg-gradient-blue-2"
          style={{ width: `${networkGovernance}%` }}
        ></div>
        <div
          className="bg-gradient-blue-1"
          style={{ width: `${profitability}%` }}
        ></div>
      </div>
    </button>
  );
}
