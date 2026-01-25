"use client";

import { useEffect, useState } from "react";
import { Hero,
   CollapseCardFeatures, 
   ContactCard, 
   PingIcon, 
   CountUpStats,
   StaggerTestimonials, 
   Footer } from "@/components/home";
import { CardNav, PixelBlast, Loader } from "@/components/global";
import { items } from "@/constants/home-items";

export default function HomePage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000); // 2 second delay for loading screen

        return () => clearTimeout(timer);
    }, []);

     if (loading) {
        return( <Loader /> );
    }
  

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-obsidian">
      <div className="fixed inset-0 w-full h-full z-0">
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

      <div className="flex-1 scrollbar-hide relative z-10 items-center w-full container-responsive">
        <CardNav
          logo="/logo/black-no-text.svg"
          logoAlt="Company Logo"
          items={items}
          menuColor="#000"
          ease="power3.out"
        />

        {/* Mobile layout: PingIcon centered, then Hero below */}
        <div className="md:hidden flex flex-col h-screen">
          <div className="flex-1 flex items-center justify-center mt-64">
            <PingIcon />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Hero />
          </div>
        </div>

        {/* Desktop layout: Just Hero */}
        <div className="hidden md:block">
          <Hero />
        </div>

      </div>
      <div className="z-20">
        <CollapseCardFeatures />
        <CountUpStats />
        <div className="hidden md:block">
          <PingIcon />
        </div>
        <StaggerTestimonials />
        <ContactCard />
      </div>

      <Footer />
    </main>
  );
}

