import agoricImg from "../assets/blockchains/agoric.png";
import akashImg from "../assets/blockchains/akash.png";
import altheaImg from "../assets/blockchains/althea.png";
import archwayImg from "../assets/blockchains/archway.png";
import atomoneImg from "../assets/blockchains/atomone.png";
import axelarImg from "../assets/blockchains/axelar.png";
import bandImg from "../assets/blockchains/band.png";
import celestiaImg from "../assets/blockchains/celestia.png";
import chihuahuaImg from "../assets/blockchains/chihuahua.png";
import coreumImg from "../assets/blockchains/coreum.png";
import cosmosHubImg from "../assets/blockchains/cosmos_hub.png";
import dydxImg from "../assets/blockchains/dydx.png";
import gravityBridgeImg from "../assets/blockchains/gravity_bridge.png";
import humansAiImg from "../assets/blockchains/humans_ai.png";
import injectiveImg from "../assets/blockchains/injective.png";
import kavaImg from "../assets/blockchains/kava.png";
import mantraImg from "../assets/blockchains/mantra.png";
import mediblocImg from "../assets/blockchains/medibloc.png";
import milkywayImg from "../assets/blockchains/milkyway.png";
import nillionImg from "../assets/blockchains/nillion.png";
import osmosisImg from "../assets/blockchains/osmosis.png";
import persistenceImg from "../assets/blockchains/persistence.png";
import regenImg from "../assets/blockchains/regen.png";
import secretImg from "../assets/blockchains/secret.png";
import shentuImg from "../assets/blockchains/shentu.png";
import stargazeImg from "../assets/blockchains/stargaze.png";
import terraImg from "../assets/blockchains/terra.png";
import xionImg from "../assets/blockchains/xion.png";
import xplaImg from "../assets/blockchains/xpla.png";

const blockchainImages: Record<string, string> = {
  "COSMOS HUB": cosmosHubImg,
  ATOMONE: atomoneImg,
  OSMOSIS: osmosisImg,
  AKASH: akashImg,
  AGORIC: agoricImg,
  ALTHEA: altheaImg,
  ARCHWAY: archwayImg,
  AXELAR: axelarImg,
  BAND: bandImg,
  CELESTIA: celestiaImg,
  CHIHUAHUA: chihuahuaImg,
  COREUM: coreumImg,
  DYDX: dydxImg,
  "GRAVITY BRIDGE": gravityBridgeImg,
  HUMANS: humansAiImg,
  INJECTIVE: injectiveImg,
  KAVA: kavaImg,
  MANTRA: mantraImg,
  MEDIBLOC: mediblocImg,
  MILKYWAY: milkywayImg,
  NILLION: nillionImg,
  PERSISTENCE: persistenceImg,
  REGEN: regenImg,
  SECRET: secretImg,
  SHENTU: shentuImg,
  STARGAZE: stargazeImg,
  TERRA: terraImg,
  XION: xionImg,
  XPLA: xplaImg,
};

type Scores = {
  marketBarriers: number;
  networkGovernance: number;
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
      <div className="w-[85%] h-6.25 bg-[#F1F1F5] rounded flex overflow-hidden">
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
