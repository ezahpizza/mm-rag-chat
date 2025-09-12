import React, { useState } from "react";
import {
  FiChevronsRight,
  FiHome,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import MenuDrop from "./MenuDrop";

interface OptionProps {
  Icon: React.ComponentType;
  title: string;
  selected: string;
  setSelected: (title: string) => void;
  open: boolean;
  notifs?: number;
}

interface TitleSectionProps {
  open: boolean;
}

interface ToggleCloseProps {
  open: boolean;
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

interface NavSectionProps {
  children: React.ReactNode;
}

export const NavSection = ({ children }: NavSectionProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-persian min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <Content>{children}</Content>
    </div>
  );
};

const Sidebar = ({ isOpen, setIsOpen }:SidebarProps) => {
  const [selected, setSelected] = useState("Dashboard");

  return (
    <motion.nav
      layout
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="sticky top-0 h-screen shrink-0 bg-persian p-4"
      style={{
        width: isOpen ? "280px" : "fit-content",
      }} 
    >
      <TitleSection open={isOpen} />

      <div className="space-y-1">
        <Option
          Icon={FiHome}
          title="demo"
          selected={selected}
          setSelected={setSelected}
          open={isOpen}
        />
      </div>

      <ToggleClose open={isOpen} setOpen={setIsOpen} />
    </motion.nav>
  );
};

const Option = ({ Icon, title, selected, setSelected, open, notifs }:OptionProps) => {
  const router = useRouter();

  return (
    <motion.button
      layout
      onClick={() => {
        if (title === "Home") {
          router.push("/");
        } else {
          setSelected(title);
        }
      }}
      className={`relative flex h-10 w-full items-center rounded-md transition-colors text-lavenda font-bold text-lg ${
        selected === title 
          ? "bg-lavenda/20" 
          : "hover:bg-cerulean"
      }`}
    >
      <motion.div
        layout
        className="grid h-full w-10 place-content-center text-lg"
      >
        <Icon />
      </motion.div>
      {open && (
        <motion.span
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.125 }}
          className="text-md font-medium"
        >
          {title}
        </motion.span>
      )}

      {notifs && open && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          style={{ y: "-50%" }}
          transition={{ delay: 0.5 }}
          className="absolute right-2 top-1/2 size-4 rounded bg-razza text-md text-white flex items-center justify-center"
        >
          {notifs}
        </motion.span>
      )}
    </motion.button>
  );
};

const TitleSection = ({ open }:TitleSectionProps) => {
  return (
    <div className="mb-3 border-b-2 border-eriBlack pb-3">
      <div className="flex cursor-pointer items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo />
          {open && (
              <MenuDrop />
          )}
        </div>
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <motion.div
      layout
      className="grid size-10 shrink-0 place-content-center rounded-md bg-razza"
    >
      <svg
        width="24"
        height="auto"
        viewBox="0 0 50 39"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="fill-white"
      >
        <path
          d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z"
          stopColor="#000000"
        ></path>
        <path
          d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z"
          stopColor="#000000"
        ></path>
      </svg>
    </motion.div>
  );
};

const ToggleClose = ({ open, setOpen }:ToggleCloseProps) => {
  return (
    <motion.button
      layout
      onClick={() => setOpen((pv) => !pv)}
      className="absolute bottom-0 left-0 right-0 border-t-2 border-cerulean transition-colors hover:bg-electric rounded-lg m-2  focus:outline-none"
    >
      <div className="flex items-center p-2">
        <motion.div
          layout
          className="grid size-10 place-content-center text-lg text-gray-300"
        >
          <FiChevronsRight
            className={`transition-transform ${open && "rotate-180"}`}
          />
        </motion.div>
        {open && (
          <motion.span
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.125 }}
            className="text-md font-medium text-gray-300"
          >
            Hide
          </motion.span>
        )}
      </div>
    </motion.button>
  );
};

const Content = ({ children }: { children: React.ReactNode }) => <div className="flex-1 h-screen overflow-hidden">{children}</div>;