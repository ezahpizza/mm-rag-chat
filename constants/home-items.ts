import {
  FiSearch,
  FiArrowRightCircle,
  FiHeart,
  FiMessageCircle,
  FiMic,
  FiLock,

} from "react-icons/fi";
import { FeatureType } from "@/components/home/types";

export const footerTopLinks = [
  { label: "TERMS OF SERVICE", href: "/terms" },
  { label: "PRIVACY POLICY", href: "/privacy" },
];

export const footerBottomLinks = [
  { label: "ACCOUNT", href: "/dashboard" },
  { label: "CONTACT", href: "/contact" },
  { label: "ABOUT", href: "/about" },
];

export const items = [
  {
      label: "Cool Stuff", 
      bgColor: "#122c4f",
      textColor: "#fbf9e4",
      links: [
        { label: "Lexi", href: "/chat", ariaLabel: "Chatbot" },
        { label: "Compare", href: "/compare", ariaLabel: "Document Comparison" },
        { label: "Analyze", href: "/genZAnalyze", ariaLabel: "Gen-Z Analysis" },
        { label: "Know VRDCT", href: "/product", ariaLabel: "Product page" },
      ]
    },
    {
      label: "Meh Stuff",
      bgColor: "#0b1215",
      textColor: "#fbf9e4",
      links: [
        { label: "Your Account", href: "/dashboard", ariaLabel: "User Account" },
        { label: "Contact Us", href: "/contact", ariaLabel: "Contact" },
        { label: "Meet Us", href: "/about", ariaLabel: "About" }
      ]
    },
    {
      label: "Boooring",
      bgColor: "#191265",
      textColor: "#fbf9e4",
      links: [
        { label: "Terms of Service", href: "/terms", ariaLabel: "terms of service" },
        { label: "Privacy Policy", href: "/privacy", ariaLabel: "privacy policy" }
      ]
    }
  ];

  export const features: FeatureType[] = [
  {
    title: "Multimodal AI Analysis",
    Icon: FiSearch,
    description:
      "Process text, images, and speech inputs with our intelligent AI to get a comprehensive understanding of your legal documents.",
  },
  {
    title: "Document Comparison",
    Icon: FiArrowRightCircle,
    description:
      "Quickly analyze two legal documents side-by-side to identify differences, risks, and key legal implications.",
  },
  {
    title: "Document Analysis",
    Icon: FiHeart,
    description:
      "Transform complex legal jargon into simple, understandable explanations using pop culture references and contemporary slang.",
  },
  {
    title: "Conversational Interface",
    Icon: FiMessageCircle,
    description:
      "Interact with your legal documents using natural language through our conversational chat assistant, 'Lexi'.",
  },
  {
    title: "Real-time Speech Processing",
    Icon: FiMic,
    description:
      "Use your voice to ask questions and get real-time analysis of your documents with our voice-based query feature.",
  },
  {
    title: "Secure & Private",
    Icon: FiLock,
    description:
      "Your sensitive documents are processed locally, and we never store your files permanently, ensuring your data remains private and secure.",
  },
];

export const TESTIMONIAL_DATA = [
  {
    tempId: 0,
    testimonial:
      "My favorite solution in the market. We work 5x faster with COMPANY.",
    by: "Alex, CEO at COMPANY",
    imgSrc: "/imgs/head-shots/1.jpg",
  },
  {
    tempId: 1,
    testimonial:
      "I'm confident my data is safe with COMPANY. I can't say that about other providers.",
    by: "Dan, CEO at COMPANY",
    imgSrc: "/imgs/head-shots/2.jpg",
  },
  {
    tempId: 2,
    testimonial:
      "I know it's cliche, but we were lost before we found COMPANY. Can't thank you guys enough!",
    by: "Stephanie, CEO at COMPANY",
    imgSrc: "/imgs/head-shots/3.jpg",
  },
  {
    tempId: 3,
    testimonial:
      "COMPANY's products make planning for the future seamless. Can't recommend them enough!",
    by: "Marie, CEO at COMPANY",
    imgSrc: "/imgs/head-shots/4.jpg",
  },
  {
    tempId: 4,
    testimonial: "If I could give 11 stars, I'd give 12.",
    by: "Andre, CEO at COMPANY",
    imgSrc: "/imgs/head-shots/5.jpg",
  },
  {
    tempId: 5,
    testimonial:
      "SO SO SO HAPPY WE FOUND YOU GUYS!!!! I'd bet you've saved me 100 hours so far.",
    by: "Jeremy, CEO at COMPANY",
    imgSrc: "/imgs/head-shots/6.jpg",
  },
  {
    tempId: 6,
    testimonial:
      "Took some convincing, but now that we're on COMPANY, we're never going back.",
    by: "Pam, CEO at COMPANY",
    imgSrc: "/imgs/head-shots/7.jpg",
  },
  {
    tempId: 7,
    testimonial:
      "I would be lost without COMPANY's in depth analytics. The ROI is EASILY 100X for us.",
    by: "Daniel, CEO at COMPANY",
    imgSrc: "/imgs/head-shots/8.jpg",
  },
  {
    tempId: 8,
    testimonial: "It's just the best. Period.",
    by: "Fernando, CEO at COMPANY",
    imgSrc: "/imgs/head-shots/9.jpg",
  },
  {
    tempId: 9,
    testimonial: "I switched 5 years ago and never looked back.",
    by: "Andy, CEO at COMPANY",
    imgSrc: "/imgs/head-shots/10.jpg",
  },
  {
    tempId: 10,
    testimonial:
      "I've been searching for a solution like COMPANY for YEARS. So glad I finally found one!",
    by: "Pete, CEO at COMPANY",
    imgSrc: "/imgs/head-shots/11.jpg",
  },
  {
    tempId: 11,
    testimonial:
      "It's so simple and intuitive, we got the team up to speed in 10 minutes.",
    by: "Marina, CEO at COMPANY",
    imgSrc: "/imgs/head-shots/12.jpg",
  },
];