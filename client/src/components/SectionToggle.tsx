import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface SectionToggleProps {
  title: string;
  children: React.ReactNode;
}

export function SectionToggle({ title, children }: SectionToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-card/30 backdrop-blur-sm mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors group"
      >
        <span className="text-xl font-display uppercase tracking-wide text-white group-hover:text-primary transition-colors">
          {title}
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 text-white/80 leading-relaxed font-light">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
