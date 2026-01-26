"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, useAnimate } from "framer-motion";
import { PixelBlast } from '@/components/global';


const NUM_BLOCKS = 5;
const BLOCK_SIZE = 32;

const DURATION_IN_MS = 175;
const DURATION_IN_SECS = DURATION_IN_MS * 0.001;

const TRANSITION = {
  ease: "easeInOut" as const,
  duration: DURATION_IN_SECS,
};

export const Loader = () => {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen overflow-hidden bg-obsidian">
        <div className="absolute inset-0 z-0">
          <PixelBlast
            variant="circle"
            pixelSize={6}
            color="#8b67ff"
            patternScale={3}
            patternDensity={1.6}
            pixelSizeJitter={0.5}
            enableRipples
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            liquid
            liquidStrength={0.12}
            liquidRadius={1.2}
            liquidWobbleSpeed={5}
            speed={0.6}
            edgeFade={0.25}
            transparent
          />
        </div>
        <div className="flex-1 scrollbar-hide p-2 sm:p-4 relative z-10 w-full container-responsive flex items-center justify-center">
          <ShuffleLoader />
        </div>
      </main>
    );
}

const ShuffleLoader = () => {
  const [blocks, setBlocks] = useState(
    Array.from(Array(NUM_BLOCKS).keys()).map((n) => ({ id: n }))
  );
  const [scope, animate] = useAnimate();

  const shuffle = useCallback(async () => {
    while (scope.current) {
      const [first, second] = pickTwoRandom();

      if (!scope.current) return;
      animate(`[data-block-id="${first.id}"]`, { y: -BLOCK_SIZE }, TRANSITION);

      if (!scope.current) return;
      await animate(
        `[data-block-id="${second.id}"]`,
        { y: BLOCK_SIZE },
        TRANSITION
      );

      await delay(DURATION_IN_MS);

      setBlocks((pv) => {
        const copy = [...pv];

        const indexForFirst = copy.indexOf(first);
        const indexForSecond = copy.indexOf(second);

        copy[indexForFirst] = second;
        copy[indexForSecond] = first;

        return copy;
      });

      await delay(DURATION_IN_MS * 2);

      if (!scope.current) return;
      animate(`[data-block-id="${first.id}"]`, { y: 0 }, TRANSITION);

      if (!scope.current) return;
      await animate(`[data-block-id="${second.id}"]`, { y: 0 }, TRANSITION);

      await delay(DURATION_IN_MS);
    }
  }, [scope, animate, blocks]);

  useEffect(() => {
    shuffle();
  }, [shuffle]);

  const pickTwoRandom = () => {
    const index1 = Math.floor(Math.random() * blocks.length);
    let index2 = Math.floor(Math.random() * blocks.length);

    while (index2 === index1) {
      index2 = Math.floor(Math.random() * blocks.length);
    }

    return [blocks[index1], blocks[index2]];
  };

  const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  return (
    <div ref={scope} className="flex divide-x divide-neutral-950">
      {blocks.map((b) => {
        return (
          <motion.div
            layout
            data-block-id={b.id}
            key={b.id}
            transition={TRANSITION}
            style={{
              width: BLOCK_SIZE,
              height: BLOCK_SIZE,
            }}
            className="bg-white"
          />
        );
      })}
    </div>
  );
};