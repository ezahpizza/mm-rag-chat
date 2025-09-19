"use client";


import { motion } from "framer-motion";
import Image from 'next/image';

export const PingIcon = () => {
  return (
    <div className="grid place-content-center px-4 py-36">
      <Ping />
    </div>
  );
};

const LOOP_DURATION = 4;

const Ping = () => {
  return (
    <div className="relative">
      <Logo />
      <Band delay={0} />
      <Band delay={LOOP_DURATION * 0.25} />
      <Band delay={LOOP_DURATION * 0.5} />
      <Band delay={LOOP_DURATION * 0.75} />
    </div>
  );
};

const Logo = () => {
  return (
    <motion.div
      className="relative z-10"
      initial={{
        opacity: 0,
        scale: 0.85,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 1,
        ease: "easeOut",
      }}
    >
      <Image
        src="/logo-w.svg"
        alt="Logo"
        width={50}
        height={39}
        className="fill-violet-100"
      />
    </motion.div>
  );
};

const Band = ({ delay }: { delay: number }) => {
  return (
    <motion.span
      style={{
        translateX: "-50%",
        translateY: "-50%",
      }}
      initial={{
        opacity: 0,
        scale: 0.25,
      }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: 1,
      }}
      transition={{
        repeat: Infinity,
        repeatType: "loop",
        times: [0, 0.5, 0.75, 1],
        duration: LOOP_DURATION,
        ease: "linear",
        delay,
      }}
      className="absolute left-[50%] top-[50%] z-0 h-56 w-56 rounded-full border-[1px] border-persian bg-gradient-to-br from-persian/50 to-razza/30 shadow-xl shadow-electric/40"
    />
  );
};

