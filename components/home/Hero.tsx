"use client";

import React from "react";
import { FiArrowDownCircle } from "react-icons/fi";

const Copy = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-[999999]">
      <div className="mx-auto flex max-w-7xl items-end justify-between p-4 md:p-8">
        <div>
          <h1 className="mb-6 max-w-4xl text-6xl font-black leading-[1.1] text-slate-900 md:text-8xl">
            The Pros Train with <span className="text-cerulean">Plates</span>
          </h1>
          <p className="max-w-xl text-slate-700 md:text-lg">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto
            optio quam voluptates accusantium unde labore maiores delectus
            tempora velit cum.
          </p>
        </div>
        <FiArrowDownCircle className="hidden text-8xl text-cerulean md:block" />
      </div>
    </div>
  );
};

export const Hero = () => {
  return (
      <section className="h-screen">
        <Copy />
      </section>
  );
};


