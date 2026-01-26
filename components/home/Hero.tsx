"use client";

import { FiArrowDownCircle } from "react-icons/fi";
import { Zalando_Sans_Expanded } from "next/font/google";

const zalando = Zalando_Sans_Expanded ({ subsets: ['latin'] });

export const Hero = () => {
  return (
      <section className="h-screen">
        <div className="absolute bottom-0 left-0 right-0 z-[80]">
            <div className="mx-auto flex max-w-7xl items-end justify-between p-4 md:p-8">
              <div className="flex-1">
                <h1 className="max-w-4xl text-xl md:text-3xl leading-[1.1] text-skye">
                  consults are so passé
                </h1>
                <h1 className="mb-4 max-w-4xl text-4xl md:text-8xl font-medium leading-[1.1] text-pearl italic">
                  Better Call<br /> <span className={`${zalando.className} text-razza text-[12rem]`}>VRDCT</span>
                </h1>  
                <p className="max-w-xl text-sm md:text-lg text-obsidian bg-electric p-3 md:p-4">
                  Navigate the complexities of legal documents with unprecedented ease. Seamless and ever-accessible legal legerdemain.
                </p>
              </div>
              <FiArrowDownCircle className="hidden md:block text-6xl xl:text-8xl text-razza flex-shrink-0 ml-4" />
            </div>
        </div>
      </section>
  );
};


