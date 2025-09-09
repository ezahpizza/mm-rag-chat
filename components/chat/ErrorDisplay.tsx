'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ErrorDisplayProps {
  error: Error | null;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-red-500/20 border border-red-500/30 px-4 py-3 rounded-2xl">
        <div className="text-red-400 text-sm">Error: {error.message}</div>
      </div>
    </motion.div>
  );
}
