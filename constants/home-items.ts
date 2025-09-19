import {
  FiSearch,
  FiArrowRightCircle,
  FiHeart,
  FiMessageCircle,
  FiMic,
  FiLock,

} from "react-icons/fi";
import { FeatureType } from "@/components/home/types";

export const items = [
  {
      label: "Cool Stuff", 
      bgColor: "#122c4f",
      textColor: "#fbf9e4",
      links: [
        { label: "Lexi", href: "/chat", ariaLabel: "Chatbot" },
        { label: "Diffex", href: "/compare", ariaLabel: "Document Comparison" },
        { label: "PopLegal", href: "/genZAnalyze", ariaLabel: "Gen-Z Analysis" },
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
    title: "Slay Document Analysis",
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