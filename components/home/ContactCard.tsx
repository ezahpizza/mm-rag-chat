"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const ContactCard = () => {
  return (
    <div className="flex items-center justify-center px-8 py-24 text-obsidian overflow-hidden">
      <div className="w-full max-w-4xl flex justify-center space-y-12 md:space-y-0 bg-pearl p-8">
          <BlockCard
            tag="/ Support"
            text={
              <>
                <strong>Have questions?</strong> We&apos;d love to help! Contact support
                for any issue you may face.
              </>
            }
            examples={[
              "Does your product work for SMBs?",
              "How is my data handled?",
              "What's the meaning of life?",
            ]}
          />

      </div>
      
    </div>
  );
};

const BlockCard = ({ tag, text, examples }: { tag: string; text: React.ReactNode; examples: string[] }) => {
  return (
    <div className="w-full max-w-xl space-y-6 mx-12">
      <div>
        <p className="mb-1.5 text-sm font-light uppercase">{tag}</p>
        <hr className="border-ocean" />
      </div>
      <p className="max-w-lg text-xl leading-relaxed">{text}</p>
      <div>
        <Typewrite examples={examples} />
        <hr className="border-pearl" />
      </div>
      <button className="w-full rounded-full border border-persian py-2 text-sm font-medium transition-colors hover:bg-cerulean hover:text-skye">
        Contact Support
      </button>
    </div>
  );
};

const LETTER_DELAY = 0.025;
const BOX_FADE_DURATION = 0.125;

const FADE_DELAY = 5;
const MAIN_FADE_DURATION = 0.25;

const SWAP_DELAY_IN_MS = 5500;

const Typewrite = ({ examples }: { examples: string[] }) => {
  const [exampleIndex, setExampleIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setExampleIndex((pv) => (pv + 1) % examples.length);
    }, SWAP_DELAY_IN_MS);

    return () => clearInterval(intervalId);
  }, [examples.length]);

  return (
    <p className="mb-2.5 text-sm font-light uppercase">
      <span className="inline-block size-2 bg-obsidian" />
      <span className="ml-3">
        EXAMPLE:{" "}
        {examples[exampleIndex].split("").map((l: string, i: number) => (
          <motion.span
            initial={{
              opacity: 1,
            }}
            animate={{
              opacity: 0,
            }}
            transition={{
              delay: FADE_DELAY,
              duration: MAIN_FADE_DURATION,
              ease: "easeInOut",
            }}
            key={`${exampleIndex}-${i}`}
            className="relative"
          >
            <motion.span
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: i * LETTER_DELAY,
                duration: 0,
              }}
            >
              {l}
            </motion.span>
            <motion.span
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: [0, 1, 0],
              }}
              transition={{
                delay: i * LETTER_DELAY,
                times: [0, 0.1, 1],
                duration: BOX_FADE_DURATION,
                ease: "easeInOut",
              }}
              className="absolute bottom-[3px] left-[1px] right-0 top-[3px] bg-obsidian"
            />
          </motion.span>
        ))}
      </span>
    </p>
  );
};