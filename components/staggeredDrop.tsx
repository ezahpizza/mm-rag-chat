import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui";

interface DropdownOption {
  text: string;
  Icon: React.ComponentType<{ size?: number }>;
  onClick: () => void;
}

interface StaggeredDropProps {
  buttonText: string;
  buttonIcon: React.ComponentType<{ size?: number }>;
  options: DropdownOption[];
  buttonClassName?: string;
}

export const StaggeredDrop = ({
  buttonIcon: ButtonIcon,
  options,
  buttonClassName = "flex items-center gap-2 px-3 py-2 rounded-md transition-colors ",
}: StaggeredDropProps) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.div animate={open ? "open" : "closed"} className="relative">
        <Button
          type="button"
          onClick={() => setOpen((pv) => !pv)}
          className={buttonClassName}
        >
          <div className="grid place-items-center w-5 h-5">
            <ButtonIcon size={18} />
          </div>
        </Button>

        <motion.ul
          initial={wrapperVariants.closed}
          variants={wrapperVariants}
          style={{ originY: "top", translateX: "-50%" }}
          className="flex flex-col gap-2 p-2 rounded-lg bg-desire shadow-xl absolute top-[120%] left-[50%] w-64 overflow-hidden"
        >
          {options.map((option, index) => (
            <Option key={index} text={option.text} Icon={option.Icon} onClick={() => { option.onClick(); setOpen(false); }} />
          ))}
        </motion.ul>
      </motion.div>
    </div>
  );
};

const Option = ({ text, Icon, onClick }: { text: string; Icon: React.ComponentType<{ size?: number }>; onClick: () => void }) => {
  return (
    <motion.li
      variants={itemVariants}
      onClick={onClick}
      className="flex items-center gap-2 w-full p-2 text-xs font-medium whitespace-nowrap rounded-md hover:bg-indigo-100 text-eriBlack hover:text-cerulean transition-colors cursor-pointer"
    >
      <motion.span variants={actionIconVariants}>
        <Icon size={16} />
      </motion.span>
      <span>{text}</span>
    </motion.li>
  );
};

const wrapperVariants = {
  open: {
    scaleY: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  closed: {
    scaleY: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
    },
  },
  closed: {
    opacity: 0,
    y: -15,
    transition: {
      when: "afterChildren",
    },
  },
};

const actionIconVariants = {
  open: { scale: 1, y: 0 },
  closed: { scale: 0, y: -7 },
};