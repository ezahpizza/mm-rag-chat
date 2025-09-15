import React from "react";
import useMeasure from "react-use-measure";
import {
  useDragControls,
  useMotionValue,
  useAnimate,
  motion,
} from "framer-motion";
import { GenZAnalysisResult } from "@/lib/analyzeGenZ";

interface DragCloseDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  result: GenZAnalysisResult | null;
  onClose: () => void;
}

export const DragCloseDrawer = ({ open, setOpen, result, onClose }: DragCloseDrawerProps) => {
  const [scope, animate] = useAnimate();
  const [drawerRef, { height }] = useMeasure();

  const y = useMotionValue(0);
  const controls = useDragControls();

  const handleClose = async () => {
    animate(scope.current, {
      opacity: [1, 0],
    });

    const yStart = typeof y.get() === "number" ? y.get() : 0;

    await animate("#drawer", {
      y: [yStart, height],
    });

    setOpen(false);
    onClose();
  };

  return (
    <>
      {open && result && (
        <motion.div
          ref={scope}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 bg-persian/50 scrollbar-hide"
        >
          <motion.div
            id="drawer"
            ref={drawerRef}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{
              ease: "easeInOut",
            }}
            className="absolute bottom-0 h-[75vh] w-full overflow-hidden rounded-t-3xl bg-obsidian"
            style={{ y }}
            drag="y"
            dragControls={controls}
            onDragEnd={() => {
              if (y.get() >= 100) {
                handleClose();
              }
            }}
            dragListener={false}
            dragConstraints={{
              top: 0,
              bottom: 0,
            }}
            dragElastic={{
              top: 0,
              bottom: 0.5,
            }}
          >
            <div className="absolute left-0 right-0 top-0 z-10 flex justify-center bg-obsidian p-4">
              <button
                onPointerDown={(e) => {
                  controls.start(e);
                }}
                className="h-2 w-14 cursor-grab touch-none rounded-full bg-razza active:cursor-grabbing"
              ></button>
            </div>
            <div className="relative z-0 h-full overflow-y-scroll p-4 pt-12 scrollbar-hide">
              <div className="mx-auto max-w-2xl space-y-4 text-neutral-400">
                <h2 className="text-4xl font-bold text-skye">
                  {result.category}
                </h2>
                <div className="space-y-4">
                  <p className="text-lg text-pearl">
                    {result.explanation}
                  </p>
                  <div>
                    <h3 className="text-xl font-semibold text-electric mb-2">
                      Key Clauses:
                    </h3>
                    <ul className="space-y-2">
                      {result.clauses.map((clause, index) => (
                        <li key={index} className="text-pearl bg-cerulean p-3 rounded-lg">
                          {clause}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};