import { Hero } from "@/components/home/Hero";
import { CardNav } from "@/components/global/CardNav";


const items = [
  {
      label: "Explore", 
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Lexi", href: "/chat", ariaLabel: "Chatbot" },
        { label: "Case Studies", href: "#", ariaLabel: "Project Case Studies" }
      ]
    },
    {
      label: "About",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Company", href: "#", ariaLabel: "About Company" },
        { label: "Careers", href: "#", ariaLabel: "About Careers" }
      ]
    }
  ];


export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen overflow-hidden">
      <CardNav
      logo="/logo.svg"
      logoAlt="Company Logo"
      items={items}
      baseColor="#fff"
      menuColor="#000"
      buttonBgColor="#111"
      buttonTextColor="#fff"
      ease="power3.out"
    />

      <Hero />
    </main>
  );
}

