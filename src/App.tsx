import Aside from "./component/aside";
import Contents from "./component/contents";

function App() {
  return (
    <div className="flex h-screen w-screen">
      <Aside />
      <main className="flex flex-col gap-5 p-5 w-full">
        {/* contents 너비 수정 필요 */}
        <div className="flex h-full gap-5">
          <Contents
            label="Normal distribution table for [blockchain]"
            className="w-full"
          />
          <Contents label="Comparison between elements" className="w-[60%]" />
        </div>

        <div className="flex h-full gap-5">
          <Contents
            label="Normal distribution table for [blockchain]"
            className="w-full"
          />
          <Contents label="Ratio between elements" className="w-[40%]" />
        </div>
      </main>
    </div>
  );
}

export default App;
