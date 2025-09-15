import React, { useState } from "react";
import {
  FiChevronsRight,
  FiSave,
  FiDownload,
  FiTrash2,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import MenuDrop from "./MenuDrop";
import { Message } from 'ai/react';
import { handleSummarizeAndSave, handleSummarizeAndExport } from '@/lib/summary/chatSummaryUtils';

interface OptionProps {
  Icon: React.ComponentType;
  title: string;
  selected: string;
  setSelected: (title: string) => void;
  open: boolean;
  notifs?: number;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
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
  messages: Message[];
  onClearChat?: () => void;
}

interface NavSectionProps {
  children: React.ReactNode;
  messages?: Message[];
  onClearChat?: () => void;
}

export const NavSection = ({ children, messages = [], onClearChat }: NavSectionProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-persian min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} messages={messages} onClearChat={onClearChat} />
      <Content>{children}</Content>
    </div>
  );
};

const Sidebar = ({ isOpen, setIsOpen, messages, onClearChat }:SidebarProps) => {
  const [selected, setSelected] = useState("Dashboard");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] = useState<'save' | 'export' | null>(null);

  const hasMessages = messages && messages.length > 0;

  const handleSummarizeAndSaveClick = async () => {
    if (!hasMessages || isProcessing) return;
    
    setIsProcessing(true);
    setProcessingType('save');
    
    try {
      const result = await handleSummarizeAndSave(messages);
      if (result.success) {
        console.log('✅ Summary saved successfully:', result.chatId);
        // You could show a toast notification here
      } else {
        console.error('❌ Failed to save summary:', result.message);
      }
    } catch (error) {
      console.error('❌ Error during summarize and save:', error);
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
    }
  };

  const handleSummarizeAndExportClick = async () => {
    if (!hasMessages || isProcessing) return;
    
    setIsProcessing(true);
    setProcessingType('export');
    
    try {
      const result = await handleSummarizeAndExport(messages);
      if (result.success) {
        console.log('✅ Summary saved and exported successfully:', result.chatId);
        // You could show a toast notification here
      } else {
        console.error('❌ Failed to save and export summary:', result.message);
      }
    } catch (error) {
      console.error('❌ Error during summarize and export:', error);
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
    }
  };

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
          Icon={FiSave}
          title="Summarise & Save"
          selected={selected}
          setSelected={setSelected}
          open={isOpen}
          onClick={handleSummarizeAndSaveClick}
          disabled={!hasMessages || isProcessing}
          isLoading={isProcessing && processingType === 'save'}
        />
        <Option
          Icon={FiDownload}
          title="Summarise & Export"
          selected={selected}
          setSelected={setSelected}
          open={isOpen}
          onClick={handleSummarizeAndExportClick}
          disabled={!hasMessages || isProcessing}
          isLoading={isProcessing && processingType === 'export'}
        />
        <Option
          Icon={FiTrash2}
          title="Clear Chat"
          selected={selected}
          setSelected={setSelected}
          open={isOpen}
          onClick={onClearChat}
          disabled={!hasMessages || isProcessing}
        />
      </div>

      <ToggleClose open={isOpen} setOpen={setIsOpen} />
    </motion.nav>
  );
};

const Option = ({ Icon, title, selected, setSelected, open, notifs, onClick, disabled = false, isLoading = false }:OptionProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (disabled) return;
    
    if (onClick) {
      onClick();
    } else if (title === "Home") {
      router.push("/");
    } else {
      setSelected(title);
    }
  };

  return (
    <motion.button
      layout
      onClick={handleClick}
      disabled={disabled}
      className={`relative flex h-10 w-full items-center rounded-md transition-colors text-pearl font-bold text-md ${
        disabled 
          ? "opacity-50 cursor-not-allowed bg-gray-600" 
          : selected === title 
            ? "bg-pearl/20" 
            : "hover:bg-electric"
      }`}
    >
      <motion.div
        layout
        className="grid h-full w-10 place-content-center text-lg"
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-pearl border-t-transparent rounded-full"
          />
        ) : (
          <Icon />
        )}
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

      {notifs && open && !isLoading && (
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
    <div className="mb-3 border-b-2 border-obsidian pb-3">
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