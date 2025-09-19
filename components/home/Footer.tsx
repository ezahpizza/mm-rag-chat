"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";
import { Bebas_Neue } from 'next/font/google';

const bebas = Bebas_Neue ({ weight: '400', subsets: ['latin'] });

export function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: false, 
    margin: "-50px 0px"
  });

  const letters = "VRDCT".split("");
  const year = new Date().getFullYear();

  console.log("Footer isInView:", isInView); // Debug log

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
    <footer className="w-full h-60 md:h-90 bg-obsidian flex items-center justify-center relative overflow-hidden rounded-t-3xl">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/95 to-razza/30" />
      
      {/* Main content */}
      <div ref={ref} className="relative z-10 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex items-center justify-center space-x-4 md:space-x-8"
        >
          {letters.map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              variants={letterVariants}
              className={`${bebas.className} text-6xl md:text-[14rem] font-bold text-pearl drop-shadow-2xl`}
              style={{
                transformOrigin: "50% 50%",
                textShadow: "0 0 30px rgba(139, 103, 255, 0.3)",
              }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>

        {/* Subtle accent line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isInView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
          className="h-0.5 bg-gradient-to-r from-transparent via-electric to-transparent mt-4 mx-auto max-w-md"
          style={{ transformOrigin: "center" }}
        />

        {/* Additional text or content can go here */}
        <p

          className={`${bebas.className} text-skye/70 text-sm md:text-base mt-8 max-w-md mx-auto px-4`}
        >
          &copy; {year} VRDCT. All Rights Reserved.
        </p>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-persian/10 to-transparent" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-electric/10 to-transparent rounded-full blur-3xl" />
    </footer>
  );
}