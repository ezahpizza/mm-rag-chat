import { motion } from 'framer-motion';

export function Spinner({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <motion.svg
      className={`animate-spin text-primary ${className}`}
      width={size}
      height={size}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke="currentColor"
        strokeWidth="5"
        strokeDasharray="31.4 31.4"
        strokeLinecap="round"
        opacity="0.2"
      />
      <motion.circle
        cx="25"
        cy="25"
        r="20"
        stroke="currentColor"
        strokeWidth="5"
        strokeDasharray="31.4 31.4"
        strokeLinecap="round"
        initial={{ pathLength: 0.2 }}
        animate={{ pathLength: 1 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      />
    </motion.svg>
  );
}
