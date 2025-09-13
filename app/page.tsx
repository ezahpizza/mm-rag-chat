import { Hero } from "@/components/home/Hero";
import { CardNav } from "@/components/global/CardNav";
import Pixels from "@/components/home/Pixels";
import { items } from "@/constants/home-items";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen overflow-hidden bg-obsidian">
      <div className="h-screen overflow-hidden bg-obsidian"
      style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Pixels
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
      <CardNav
      logo="/logo.svg"
      logoAlt="Company Logo"
      items={items}
      menuColor="#000"
      ease="power3.out"
    />

      <Hero />
    </div>
      
    </main>
  );
}

