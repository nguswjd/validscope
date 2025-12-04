import LogoImage from "../assets/logo.svg";

function Aside() {
  return (
    <>
      <aside className="w-[29.37vw] max-w-111 h-screen border-r-2 border-gray-2 flex flex-col justify-between">
        <header className="bg-white px-4 pt-4 pb-3 flex flex-col justify-between h-31">
          <h1>
            <img src={LogoImage} alt="Validscope 로고" className="max-h-11" />
          </h1>

          <h2 className="text-xl text-black ">Top Recommendations</h2>
          <span className="text-gray-4 text-base font-light">
            Select the bar
          </span>
        </header>

        <section className="flex flex-col h-full border-y-2 border-gray-2">
          <h2 className="hidden">nav</h2>
        </section>

        <footer className="bg-white h-48">자본, 수익, 안정성, 진입장벽</footer>
      </aside>
    </>
  );
}

export default Aside;
