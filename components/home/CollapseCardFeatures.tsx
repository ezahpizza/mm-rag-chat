import { motion } from "framer-motion";
import { useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { FeatureProps } from "@/components/home/types";
import { features } from "@/constants/home-items";

export const CollapseCardFeatures = () => {
  const [position, setPosition] = useState(0);

  const shiftLeft = () => {
    if (position > 0) {
      setPosition((pv) => pv - 1);
    }
  };

  const shiftRight = () => {
    if (position < features.length - 1) {
      setPosition((pv) => pv + 1);
    }
  };

  return (
    <section className="overflow-hidden px-2 py-8 md:px-4 md:py-12 pl-20 md:pl-0">
        <div className="mb-6 md:mb-8 flex flex-col gap-3 md:flex-row md:justify-between max-w-3xl md:max-w-6xl mx-auto pl-6 md:pl-0">
          <h2 className="text-2xl font-bold leading-[1.2] md:text-5xl text-electric">
            We&apos;re good. <span className="text-pearl">Here&apos;s why.</span>
          </h2>
          <div className="flex gap-2 self-start md:self-auto">
            <button
              className="h-fit bg-electric p-2 md:p-4 text-lg md:text-2xl text-pearl transition-colors hover:bg-persian"
              onClick={shiftLeft}
            >
              <FiChevronLeft />
            </button>
            <button
              className="h-fit bg-electric p-2 md:p-4 text-lg md:text-2xl text-pearl transition-colors hover:bg-persian"
              onClick={shiftRight}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
        <div className="flex gap-2 md:gap-4">
          {features.map((feat, index) => (
            <Feature {...feat} key={index} position={position} index={index} />
          ))}
        </div>
    </section>
  );
};

const Feature = ({ position, index, title, description, Icon }: FeatureProps) => {
  const translateAmt =
    position >= index ? index * 100 : index * 100 - 100 * (index - position);

  return (
    <motion.div
      animate={{ x: `${-translateAmt}%` }}
      transition={{
        ease: "easeInOut",
        duration: 0.35,
      }}
      className={`relative flex min-h-[160px] md:min-h-[250px] w-[70%] md:w-3/5 max-w-xs md:max-w-lg shrink-0 flex-col justify-between overflow-hidden p-3 md:p-8 shadow-lg ${
        index % 2 ? "bg-obsidian text-pearl" : " bg-pearl text-obsidian"
      }`}
    >
      <Icon className="absolute right-1 top-1 md:right-2 md:top-2 text-3xl md:text-7xl opacity-20" />
      <h3 className="mb-3 md:mb-8 text-lg md:text-3xl font-bold">{title}</h3>
      <p className="text-xs md:text-base">{description}</p>
    </motion.div>
  );
};

