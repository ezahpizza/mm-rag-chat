import {
  FiChevronDown,
  FiHome 
} from "react-icons/fi";
import { MdCompare } from "react-icons/md";
import { motion } from "framer-motion";
import { useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { wrapperVariants, itemVariants, actionIconVariants, iconVariants } from "./dropVariants";

const MenuDrop = () => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.125 }}
      className="relative rounded-md"
    >
      <motion.div animate={open ? "open" : "closed"} >
        <button
          onClick={() => setOpen((pv) => !pv)}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-indigo-50"
        >
          <span className="font-medium text-2xl">Vrdct</span>
          <motion.span variants={iconVariants}>
            <FiChevronDown />
          </motion.span>
        </button>

        <motion.ul
          initial={wrapperVariants.closed}
          variants={wrapperVariants}
          style={{ originY: "top", translateX: "-50%" }}
          className="flex flex-col gap-2 p-2 rounded-lg bg-pearl shadow-xl absolute top-[120%] left-[50%] w-48 overflow-hidden z-50"
        >
          <Option setOpen={setOpen} Icon={FiHome} text="Home" />
          <Option setOpen={setOpen} Icon={MdCompare} text="Compare" />
        </motion.ul>
      </motion.div>
    </motion.div>
  );
};

interface MenuProps {
  text: string;
  Icon: React.ComponentType;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Option = ({ text, Icon, setOpen }: MenuProps) => {
  const router = useRouter();
  return (
    <motion.li
      variants={itemVariants}
      onClick={() => {
        setOpen(false);
        const route = text.toLowerCase() === 'home' ? '/' : `/${text.toLowerCase()}`;
        router.push(route);
      }}
      className="flex items-center gap-2 w-full p-2 text-md font-medium whitespace-nowrap rounded-md hover:bg-electric text-cerulean hover:text-pearl transition-colors cursor-pointer"
    >
      <motion.button variants={actionIconVariants}>
        <Icon />
      </motion.button>
      <span>{text}</span>
    </motion.li>
  );
};

export default MenuDrop;

