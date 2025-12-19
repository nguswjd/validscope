import { CircleAlert } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ContentsProps {
  className: string;
  label: string;
  children: React.ReactNode;
  description?: string;
}

function Contents({ className, label, children, description }: ContentsProps) {
  const [showDescription, setShowDescription] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        descriptionRef.current &&
        buttonRef.current &&
        !descriptionRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDescription(false);
      }
    }

    if (showDescription) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDescription]);

  return (
    <section
      className={`bg-white border-2 border-gray-2 rounded-xl flex flex-col ${
        className || ""
      }`}
    >
      <h2 className="text-base text-black ml-4 mt-3 flex gap-2 items-center">
        {label}
        <div className="relative flex">
          <button
            ref={buttonRef}
            onClick={() => setShowDescription(!showDescription)}
            className="cursor-pointer hover:opacity-70 transition-opacity"
            aria-label="설명 보기"
          >
            <CircleAlert className="w-4 h-4" />
          </button>
          {showDescription && description && (
            <div
              ref={descriptionRef}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 py-2.5 px-[13px] bg-white border-2 border-gray-2 rounded-lg text-sm text-[#1D2641] z-10 w-max"
              style={{
                boxShadow:
                  "0px 0px 0px 0px #3130400D, 0px 2px 4px 0px #3130400D, -1px 8px 8px 0px #3130400A, -2px 18px 11px 0px #31304008, -4px 32px 13px 0px #31304003, -6px 50px 14px 0px #31304000",
              }}
            >
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-gray-2 rotate-45"></div>
              <div className="relative whitespace-pre-line z-10 text-[8px] font-light">
                {description}
              </div>
            </div>
          )}
        </div>
      </h2>
      <div className="w-full h-full">{children}</div>
    </section>
  );
}

export default Contents;
