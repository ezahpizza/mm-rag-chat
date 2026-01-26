import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";

export const CountUpStats = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 md:py-24">
      <div className="flex flex-col items-center justify-center sm:flex-row">
        <Stat
          num={80}
          suffix="%"
          subheading="of all inefficient behavior in delayed cases attributed to counsel, rather than the court."
        />
        <div className="h-[1px] w-12 bg-indigo-200 sm:h-12 sm:w-[1px]" />
          <Stat
            num={6.9}
            suffix="M+"
            subheading=" awarded against legal malpractice, just in Missouri, USA averaging more than $230K"
          />

        <div className="h-[1px] w-12 bg-indigo-200 sm:h-12 sm:w-[1px]" />
          <Stat
            num={54}
            suffix="%"
            subheading="of highly complaint-prone lawyers exhibit low conscientiousness and often missed deadlines."
          />
      </div>
    </div>
  );
};

const Stat = ({ num, suffix, decimals = 0, subheading }: {
  num: number;
  suffix: string;
  decimals?: number;
  subheading: string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (!isInView) return;

    animate(0, num, {
      duration: 2.5,
      onUpdate(value) {
        if (!ref.current) return;

        ref.current.textContent = value.toFixed(decimals);
      },
    });
  }, [num, decimals, isInView]);

  return (
    <div className="flex w-72 flex-col items-center py-8 sm:py-0">
      <p className="mb-2 text-center text-7xl font-semibold sm:text-6xl text-electric">
        <span ref={ref}></span>
        {suffix}
      </p>
      <p className="max-w-48 text-center text-skye bg-razza">{subheading}</p>
    </div>
  );
};