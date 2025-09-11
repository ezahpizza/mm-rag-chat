import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Button } from "../ui";
import { Check } from "lucide-react";

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
  selectedValue?: string;
}

export const StaggeredDrop = ({
  buttonIcon: ButtonIcon,
  options,
  buttonClassName = "flex items-center gap-2 px-3 py-2 rounded-md transition-colors ",
  selectedValue,
}: StaggeredDropProps) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      // Use mousedown for reliable click-outside detection
      document.addEventListener('mousedown', handleClickOutside, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [open]);

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <motion.div animate={open ? "open" : "closed"} className="relative">
        <Button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((pv) => !pv);
          }}
          className={buttonClassName}
        >
          <div className="grid place-items-center w-5 h-5">
            <ButtonIcon size={18} />
          </div>
        </Button>

        <motion.ul
          initial={wrapperVariants.closed}
          variants={wrapperVariants}
          style={{ originY: "bottom", translateX: "-50%" }}
          className="flex flex-col gap-2 p-2 rounded-lg bg-desire shadow-xl absolute bottom-[120%] left-[50%] w-64 overflow-hidden z-50"
        >
          {options.map((option, index) => (
            <Option 
              key={index} 
              text={option.text} 
              Icon={option.Icon} 
              onClick={() => { 
                setOpen(false); 
                option.onClick(); 
              }} 
              selected={option.text === selectedValue} 
            />
          ))}
        </motion.ul>
      </motion.div>
    </div>
  );
};

const Option = ({ text, Icon, onClick, selected }: { text: string; Icon: React.ComponentType<{ size?: number }>; onClick: () => void; selected?: boolean }) => {
  return (
    <motion.li
      variants={itemVariants}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex items-center gap-2 w-full p-2 text-xs font-medium whitespace-nowrap rounded-md transition-colors cursor-pointer ${
        selected
          ? 'bg-cerulean text-white'
          : 'hover:bg-indigo-100 text-eriBlack hover:text-cerulean'
      }`}
    >
      <motion.span variants={actionIconVariants}>
        <Icon size={16} />
      </motion.span>
      <span>{text}</span>
      {selected && (
        <motion.span variants={actionIconVariants} className="ml-auto">
          <Check size={16} />
        </motion.span>
      )}
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