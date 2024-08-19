import { AnimatePresence, motion } from "framer-motion";
import { SetStateAction } from "react";

interface Props {
    isOpen: boolean;
    setIsOpen: SetStateAction<any>;
  }

  
const QuizModal = ({ isOpen, setIsOpen }: Props) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[9999] grid cursor-pointer place-items-center overflow-y-scroll bg-slate-900/20 p-8 backdrop-blur"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className="relative  max-w-lg cursor-default overflow-hidden rounded-lg  bg-gradient-to-br text-white shadow-xl"
          >
            <div className="relative z-10">
              <div className="flex aspect-square w-24 flex-col items-center justify-center bg-white">
                <div className="flex justify-center">

                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuizModal;
