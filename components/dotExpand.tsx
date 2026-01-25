import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

type DotExpandButtonProps = {
  label: string;
  href: string;
};

const DotExpandButton = ({ label, href }: DotExpandButtonProps) => {
  return (
    <Link href={href}>
      <button className="group flex h-4 items-center gap-2 rounded-full bg-transparent pl-3 pr-4 transition-all duration-300 ease-in-out hover:pl-2 text-cerulean hover:text-white">
        <span className="rounded-full bg-cerulean p-1 text-sm transition-colors duration-300 group-hover:bg-white">
          <FiArrowUpRight className="-translate-x-[200%] text-[0px] transition-all duration-300 group-hover:translate-x-0 group-hover:text-lg group-hover:text-cerulean group-active:-rotate-45" />
        </span>
        <span className="whitespace-nowrap">{label}</span>
      </button>
    </Link>
  );
};

export default DotExpandButton;
