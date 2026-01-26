import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import { gifMap } from "@/constants/gifMap";

const IMG_PADDING = 12;

const getRandomGif = (category: string): string => {
  const gifs = gifMap[category as keyof typeof gifMap];
  return gifs[Math.floor(Math.random() * gifs.length)];
};

interface TextParallaxContentProps {
  category: string;
  summary: string;
  onLearnMore: () => void;
  index: number;
}

export const TextParallaxContent = ({ category, summary, onLearnMore, index: _index }: TextParallaxContentProps) => {
  const imgUrl = getRandomGif(category);

  return (
    <div
      style={{
        paddingLeft: IMG_PADDING,
        paddingRight: IMG_PADDING,
      }}
    >
      <div className="relative h-[150vh]">
        <StickyImage imgUrl={imgUrl} />
        <OverlayCopy heading={category} subheading="" />
      </div>
      <GenZContent summary={summary} onLearnMore={onLearnMore} />
    </div>
  );
};

const StickyImage = ({ imgUrl }: { imgUrl: string }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.div
      style={{
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: `calc(100vh - ${IMG_PADDING * 2}px)`,
        top: IMG_PADDING,
        scale,
      }}
      ref={targetRef}
      className="sticky z-0 overflow-hidden rounded-3xl"
    >
      <motion.div
        className="absolute inset-0 bg-obsidian/70"
        style={{
          opacity,
        }}
      />
    </motion.div>
  );
};

const OverlayCopy = ({ subheading, heading }: { subheading: string; heading: string }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);

  return (
    <motion.div
      style={{
        y,
        opacity,
      }}
      ref={targetRef}
      className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center text-white"
    >
      <p className="mb-2 text-center text-xl md:mb-4 md:text-3xl">
        {subheading}
      </p>
      <p className="text-center text-4xl font-bold md:text-7xl">{heading}</p>
    </motion.div>
  );
};

const GenZContent = ({ summary, onLearnMore }: { summary: string; onLearnMore: () => void }) => (
  <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
    <div className="col-span-1 md:col-span-8">
      <p className="mb-4 text-xl text-pearl md:text-2xl">
        {summary}
      </p>
      <button
        onClick={onLearnMore}
        className="w-full rounded bg-persian px-9 py-4 text-xl text-pearl transition-colors hover:bg-skye hover:text-razza md:w-fit"
      >
        Learn more <FiArrowUpRight className="inline" />
      </button>
    </div>
  </div>
);