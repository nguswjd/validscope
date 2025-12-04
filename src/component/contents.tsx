interface ContentsProps {
  className: string;
  label: string;
  // children: React.ReactNode;
}

function Contents({ className, label /*, children*/ }: ContentsProps) {
  return (
    <section
      className={`bg-white border-2 border-gray-2 rounded-xl flex flex-col ${
        className || ""
      }`}
    >
      <h2 className="text-bases text-black ml-4 mt-3">{label}</h2>
      {/* <div className="w-full h-full">{children}</div> */}
    </section>
  );
}

export default Contents;
