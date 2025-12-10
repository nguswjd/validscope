type BlockchainBtnProps = {
  onClick?: () => void;
  name: string;
  scores: {
    marketBarriers: number;
    networkGovernance: number;
    profitability: number;
  };
};

function BlockchainBtn({ onClick, scores }: BlockchainBtnProps) {
  const { marketBarriers, networkGovernance, profitability } = scores;

  return (
    <button type="button" onClick={onClick} className="flex gap-2 w-full">
      <img src="" alt="" className="w-6 h-6 rounded-full bg-gray-3" />

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

export default BlockchainBtn;
