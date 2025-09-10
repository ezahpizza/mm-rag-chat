import React, { useState } from "react";
import {
  FiBarChart,
  FiChevronDown,
  FiChevronsRight,
  FiDollarSign,
  FiHome,
  FiMonitor,
  FiShoppingCart,
  FiTag,
  FiUsers,
} from "react-icons/fi";
import { motion } from "framer-motion";

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

export const NavSection = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex bg-elec-purple min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <Content />
    </div>
  );
};

const Sidebar = ({ isOpen, setIsOpen }:SidebarProps) => {
  const [selected, setSelected] = useState("Dashboard");

  return (
    <motion.nav
      layout
      className="sticky top-0 h-screen shrink-0 border-r border-gray-200 bg-mid-navy p-2"
      style={{
        width: isOpen ? "280px" : "fit-content",
      }}
    >
      <TitleSection open={isOpen} />

      <div className="space-y-1">
        <Option
          Icon={FiHome}
          title="Home"
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
  return (
    <motion.button
      layout
      onClick={() => setSelected(title)}
      className={`relative flex h-10 w-full items-center rounded-md transition-colors ${
        selected === title 
          ? "bg-lavenda/20 text-lavenda" 
          : "text-gray-300 hover:bg-elec-purple/10 hover:text-lavenda"
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
          className="text-xs font-medium"
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
          className="absolute right-2 top-1/2 size-4 rounded bg-hot-pink text-xs text-white flex items-center justify-center"
        >
          {notifs}
        </motion.span>
      )}
    </motion.button>
  );
};

const TitleSection = ({ open }:TitleSectionProps) => {
  return (
    <div className="mb-3 border-b border-gray-600 pb-3">
      <div className="flex cursor-pointer items-center justify-between rounded-md transition-colors hover:bg-elec-purple/10">
        <div className="flex items-center gap-2">
          <Logo />
          {open && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.125 }}
            >
              <span className="block text-xs font-semibold text-lavenda">LegalAssist</span>
              <span className="block text-xs text-gray-400">AI Powered</span>
            </motion.div>
          )}
        </div>
        {open && <FiChevronDown className="mr-2 text-gray-400" />}
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <motion.div
      layout
      className="grid size-10 shrink-0 place-content-center rounded-md bg-elec-purple"
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
      className="absolute bottom-0 left-0 right-0 border-t border-gray-600 transition-colors hover:bg-elec-purple/10"
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
            className="text-xs font-medium text-gray-300"
          >
            Hide
          </motion.span>
        )}
      </div>
    </motion.button>
  );
};

const Content = () => <div className="max-h-screen w-full"></div>;