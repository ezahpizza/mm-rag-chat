"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";
import Image from 'next/image';
import { Zalando_Sans_Expanded } from "next/font/google";
import DotExpandButton from "../dotExpand";
import { footerTopLinks, footerBottomLinks } from "@/constants/home-items";

const zalando = Zalando_Sans_Expanded ({ subsets: ['latin'] });

export function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: false, 
    margin: "-50px 0px"
  });

  const letters = "VRDCT".split("");
  const year = new Date().getFullYear();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const letterVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 100,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <footer className={`${zalando.className} flex items-center justify-center relative overflow-hidden`}>

      <div ref={ref} className="relative z-10 text-center w-7xl h-60 md:h-90 bg-razza m-4 text-left">

        <p className={`text-white/12 text-[10rem] top-0 left-0 absolute tracking-wider leading-none`}>
          30.9625&deg; N<br />
          46.1027&deg; E
        </p>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex space-x-4 md:space-x-8 bottom-12 left-2 px-8 absolute"
        >
          {letters.map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              variants={letterVariants}
              className={`text-8xl font-medium text-persian drop-shadow-2xl`}
              style={{
                transformOrigin: "50% 50%",
                textShadow: "0 0 30px rgba(139, 103, 255, 0.3)",
              }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>

        <p className="text-cerulean text-sm md:text-base px-8 absolute left-2 top-2">
          <span className="block">
            Billable hours, minus the hours. <br/> Get started today.
          </span>
          <span className="block mt-24">
            All Brains. No Suits.
          </span>
        </p>

        <Image
          src="/logo/black-no-text.svg"
          alt="Logo"
          width={50}
          height={39}
          className="bottom-34 right-12 absolute"
        />

        <div className="absolute top-4 right-2 flex flex-col items-end gap-3 px-6">
          {footerTopLinks.map((item) => (
            <DotExpandButton
              key={item.label}
              label={item.label}
              href={item.href}
            />
          ))}
        </div>

        <div className="absolute bottom-4 right-2 flex flex-col items-end gap-3 px-6">
          {footerBottomLinks.map((item) => (
            <DotExpandButton
              key={item.label}
              label={item.label}
              href={item.href}
            />
          ))}
        </div>

        <p className={`text-cerulean/70 text-sm md:text-base px-8 bottom-2 left-2 absolute`}>
          &copy; {year} VRDCT. All Rights Reserved.
        </p>

      </div>

    </footer>
  );
}